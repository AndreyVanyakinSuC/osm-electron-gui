import React, { PureComponent } from 'react';
import _ from 'lodash';

// import Chart from '../Chart/Chart';
import Chart from '../Chart/Chart';
import LoadingScreen from './LoadingScreen';

// CONTROLS
import DateRangeSelector from '../Controls/DateRangeSelector';
import ScopeSelector from '../Controls/ScopeSelector';
import ModeSelector from '../Controls/ModeSelector';

// HELPERS
import {
  nowTS,
  minusHrs,
  plusHrs,
  date_UTS,
  uts_Date
} from '../../APInHelpers/timeseries';
import { setRecommendedSpan } from '../../APInHelpers/history';
import {
  schemaRangeObjects,
  schemaObjIDbyType,
  schemaAllObjectTypes,
  schemaRangeObjectTypes,
  schemaTypesbyObjIDs,
  schemaFirstRangeofLine,
  schemaFirstLineID,
  schemaObjIDs
} from '../../APInHelpers/schema';

//
// DESIRED BEHAVIOUR
//

// 1) Изменение propMode и клики по выбору entity не приводят к ожиданию (нет обращений к БД)
// 2) Изменение масштаба на графике по Х отражается на элементах управления графиком
// 3) Изменение масштаба на графике по Y остаётся в силе при ререндерах

// LoadingScreen is triggered when

class History extends PureComponent {
  state = {
    startTS: minusHrs(nowTS(), this.props.historyShowHrs),
    endTS: nowTS(),
    isExpectingData: false, // any change was made that has to request new data from IDB
    propMode: 'F', //F, dF, I
    isTempVisible: false, //bool
    isVibroVisible: false,
    scopedObjects: schemaRangeObjects(
      this.props.schema,
      schemaFirstRangeofLine(
        this.props.schema,
        schemaFirstLineID(this.props.schema)
      )
    ), //[A, B, C, ОКГТ] etc all scoped by default
    scopedRange: schemaFirstRangeofLine(
      this.props.schema,
      schemaFirstLineID(this.props.schema)
    ), // default first range ID
    scopedLine: schemaFirstLineID(this.props.schema), // defautl first line ID
    spanSecs: setRecommendedSpan(
      this.props.historyShowHrs * 3600,
      this.props.historyMaxPtsCount
    )
  };

  handleLineSelect(lineOption) {
    const lineID = lineOption.value;
    this.setState(prevState => {
      if (prevState.scopedLine !== lineID) {
        return {
          scopedLine: lineID,
          scopedRange: schemaFirstRangeofLine(this.props.schema, lineID),
          scopedObjects: schemaRangeObjects(
            this.props.schema,
            schemaFirstRangeofLine(this.props.schema, lineID)
          ),
          isExpectingData: true
        };
      } else {
        return null;
      }
    });
  }

  handleRangeSelect(rangeOption) {
    const rangeID = rangeOption.value;
    this.setState(prevState => {
      if (prevState.scopedRange !== rangeID) {
        return {
          scopedRange: rangeID,
          scopedObjects: schemaRangeObjects(this.props.schema, rangeID),
          isExpectingData: true
        };
      } else {
        return null;
      }
    });
  }

  handleEntitySelect(selectedType) {
    // console.log(selectedType, 'entity clicked');
    console.log('%c[CHART-CTRLS] Select entity clicked', 'color: blue');

    const selected = parseInt(
      schemaObjIDbyType(this.props.schema, this.state.scopedRange, selectedType)
    );

    this.setState(prevState => {
      const scoped = prevState.scopedObjects;
      // console.log('scoped:', scoped, 'clicked', selected);

      if (!scoped.includes(selected)) {
        return {
          scopedObjects: [...scoped, selected]
          // isExpectingData: true
        }; // add
      } else {
        // console.log('same selected', selected);
        return {
          scopedObjects: scoped.filter(v => v !== selected)
          // isExpectingData: true
        }; // kill selected
      }
    });
  }

  handleSelectAllEntities() {
    this.setState(prevState => {
      console.log('%c[CHART-CTRLS] Select all clicked', 'color: blue');

      const selected = prevState.scopedObjects;
      const all = schemaRangeObjects(this.props.schema, prevState.scopedRange);
      const isAllSelected = _.isEqual(selected, all) ? true : false;

      if (isAllSelected) {
        // console.log('Already all selected');
        return null;
      } else {
        return {
          scopedObjects: all
          // isExpectingData: true
        };
      }
    });
  }

  handleStartDateChange(date) {
    this.setState(prevState => {
      // Force startDate to be endDate - 24h if user tries to set startDate > endDate

      let newStartTs = date_UTS(date),
        newEndTs = prevState.endTS;

      if (date_UTS(date) >= prevState.endTS) {
        // Force startDate to be endDate - 24h if user tries to set startDate > endDate
        newStartTs = minusHrs(prevState.endTS, this.props.historyShowHrs);
      } else {
        // Do not let show more than 30 days, force end date to be startTS + 30 days
        const isMorethan30Days =
          prevState.endTS - date_UTS(date) >= 30 * 24 * 3600;
        if (isMorethan30Days) {
          // console.log('Is more that 30 days');
          newEndTs = plusHrs(newStartTs, 30 * 24);
        }
      }

      return {
        startTS: newStartTs,
        endTS: newEndTs,
        spanSecs: setRecommendedSpan(
          newEndTs - newStartTs,
          this.props.historyMaxPtsCount
        ),
        isExpectingData: true
      };
    });
  }

  handleEndDateChange(date) {
    this.setState(prevState => {
      // Force startDate to be endDate - 24h if user tries to set startDate > endDate

      let newEndTs = date_UTS(date),
        newStartTs = prevState.startTS;

      if (date_UTS(date) <= prevState.startTS) {
        newEndTs = plusHrs(prevState.startTS, this.props.historyShowHrs);
      } else {
        // Do not let show more than 30 days, force end date to be startTS + 30 days
        const isMorethan30Days =
          date_UTS(date) - prevState.startTS >= 30 * 24 * 3600;
        if (isMorethan30Days) {
          // console.log('Is more that 30 days');
          newStartTs = minusHrs(newEndTs, 30 * 24);
        }
      }

      return {
        startTS: newStartTs,
        endTS: newEndTs,
        spanSecs: setRecommendedSpan(
          newEndTs - newStartTs,
          this.props.historyMaxPtsCount
        ),
        isExpectingData: true
      };
    });
  }

  handlePropModeChange(modeOption) {
    this.setState(prevState => {
      const was = prevState.propMode;
      const selected = modeOption.value;

      if (was === selected) {
        return null;
      } else {
        return {
          propMode: selected
          // isExpectingData: true
        };
      }
    });
  }

  handleTempSwitch() {
    this.setState(prevState => ({
      isTempVisible: !prevState.isTempVisible
      // isExpectingData: true
    }));
  }

  handleChartResize(resizedLimits) {
    // console.log('[HISTORY] Updated');
    // console.log(limits);
    // console.log(xStart, xEnd);
    const [resizedStartTS, resizedEndTS] = resizedLimits.map(lim =>
      date_UTS(lim)
    );

    let startTS, endTS;

    const isMorethan30Days = (resizedEndTS - resizedStartTS) / (24 * 3600) > 30;

    this.setState(prevState => {
      if (isMorethan30Days) {
        // We have to limit to 30 days
        if (prevState.endTS === resizedEndTS) {
          // SCrolling <=left startTs is master
          startTS = resizedStartTS;
          endTS = plusHrs(startTS, 24 * 30);
        } else if (prevState.startTS === resizedStartTS) {
          // Scrollinmg right => endTs is master
          if (resizedEndTS >= nowTS()) {
            // Don't let scroll to future
            endTS = nowTS();
          } else {
            endTS = resizedEndTS;
          }
          startTS = minusHrs(endTS, 24 * 30);
        } else {
          // Zooming <= => or => <= endTs centerTs is master
          const centerTS = (resizedEndTS + resizedStartTS) / 2;
          if (resizedEndTS >= nowTS()) {
            // Don't let scroll to future
            endTS = nowTS();
          } else {
            endTS = plusHrs(centerTS, 24 * 15);
          }
          startTS = minusHrs(endTS, 24 * 30);
        }
      } else {
        if (resizedEndTS >= nowTS()) {
          // Don't let scroll to future
          endTS = nowTS();
        } else {
          endTS = resizedEndTS;
        }

        startTS = resizedStartTS;
      }

      return {
        isExpectingData: true,
        startTS: startTS,
        endTS: endTS,
        spanSecs: setRecommendedSpan(
          endTS - startTS,
          this.props.historyMaxPtsCount
        )
      };
    });
  }

  handleDataReady() {
    this.setState({ isExpectingData: false });
  }

  handleSpanSecsChange(e) {
    // console.log(e.target.value);
    // const secsValue = _.t
    this.setState({ spanSecs: _.toNumber(e.target.value) });
  }

  handleHistoryRequest() {
    // 1) take [ts start, ts end] from state
    // 2) take all possible [objids] for this schema
    // 3) define missing spans for each object [[ts1, ts2], [ts3, ts4] ... [ts5, ts6]]
    // 4) prepare request

    const { startTS, endTS, spanSecs } = this.state;
    const objIDs = schemaObjIDs(this.props.schema);
    this.props.onHistoryRequired(startTS, endTS, objIDs, spanSecs);
    this.setState({ isExpectingData: true });

    // console.log('%c[H] onHistoryRequired fired', 'color: magenta');
    // const reqBody = [
    //     {
    //       "1": [[ts1, ts2, dts], [ts3, ts4, dts]]
    //     },
    //     {
    //       "2": [[ts1, ts2, dts], [ts3, ts4, dts]]
    //     }
    //   ];
  }

  componentDidMount() {
    console.log('%c[H] Component did mount', 'color: magenta');
    this.setState({ isExpectingData: true });
  }

  componentDidUpdate(prevProps, prevState) {
    // if (this.props.isWaitingHistory) {
    //     this.setState({isExpectingData: true})
    // } else {
    //     this.setState({isExpectingData: false})
    // }
    console.log('%c[H] Component did update', 'color: magenta');
  }

  render() {
    const { schema, isConnected } = this.props;
    const tsRange = [this.state.startTS, this.state.endTS];

    // ENTITIES and WIRES stuff
    const possibleEntities = _.sortBy(
      schemaRangeObjectTypes(schema, this.state.scopedRange)
    );
    const possibleWires = schemaRangeObjects(schema, this.state.scopedRange); // all wires for this range
    const availableEntities = schemaRangeObjectTypes(
      schema,
      this.state.scopedRange
    );
    const scopedEntities = schemaTypesbyObjIDs(
      schema,
      this.state.scopedObjects
    );
    // console.log(scopedEntities);

    return (
      <div className="history">
        <div className="chart_controls">
          <DateRangeSelector
            startSelected={uts_Date(this.state.startTS)}
            endSelected={uts_Date(this.state.endTS)}
            onStartChanged={this.handleStartDateChange.bind(this)}
            onEndChanged={this.handleEndDateChange.bind(this)}
            isConnected={isConnected}
            onHistoryRequestClick={this.handleHistoryRequest.bind(this)}
            spanSecs={this.state.spanSecs}
            onSpanSecsChange={this.handleSpanSecsChange.bind(this)}
          />

          <ScopeSelector
            scopedLine={this.state.scopedLine}
            scopedRange={this.state.scopedRange}
            scopedEntities={scopedEntities}
            possibleEntities={possibleEntities}
            availableEntities={availableEntities}
            schema={schema}
            onLineSelected={this.handleLineSelect.bind(this)}
            onRangeSelected={this.handleRangeSelect.bind(this)}
            onEntitySelected={this.handleEntitySelect.bind(this)}
            onSelectAllClick={this.handleSelectAllEntities.bind(this)}
          />

          <ModeSelector
            propMode={this.state.propMode}
            onPropModeChange={this.handlePropModeChange.bind(this)}
            isTempVisible={this.state.isTempVisible}
            onTempSwitchClick={this.handleTempSwitch.bind(this)}
          />
        </div>

        {this.state.isExpectingData ? <LoadingScreen /> : null}

        <Chart
          objData={schema.obj} // schema objs
          tsRange={tsRange} // []
          fMode={this.props.fMode}
          spanLength={this.props.spanLength}
          iceMode={this.props.iceMode}
          scopedWires={this.state.scopedObjects} // wire ids [1,2,3]
          possibleWires={possibleWires} // for this range
          propMode={this.state.propMode}
          isTempVisible={this.state.isTempVisible}
          isVibroVisible={this.state.isVibroVisisble}
          historyPKs={this.props.historyPKs}
          // isNormalBandVisible={true}
          onResize={this.handleChartResize.bind(this)}
          onDataLoaded={this.handleDataReady.bind(this)}
          ptsCount={this.props.historyMaxPtsCount}
          mode="history"
        />
      </div>
    );
  }
}

export default History;
