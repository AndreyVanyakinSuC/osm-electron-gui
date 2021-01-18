import React, { Component } from 'react';
import _ from 'lodash';
// CONTROLS
import HoursPeriodSelector from '../Controls/HoursPeriodSelector';
import ScopeSelector from '../Controls/ScopeSelector';
import ModeSelector from '../Controls/ModeSelector';
import CloseChartPane from '../Controls/CloseChartPane';
//
import Chart from '../Chart/Chart';
import LoadingScreen from '../History/LoadingScreen';

import {
  schemaAllObjectTypes,
  schemaRangeObjectTypes,
  schemaLinebyRange,
  schemaRangeObjects,
  schemaFirstRangeofLine,
  schemaRangeByObjectIds,
  schemaObjIDbyType,
  schemaTypesbyObjIDs
} from '../../APInHelpers/schema';
import { minusHrs } from '../../APInHelpers/timeseries';

class FreshChart extends Component {
  state = {
    scopedObjects: schemaRangeObjects(this.props.schema, this.props.scope), //[ids]
    rangeHours: 1, // 1,4,8
    isTempVisible: false, //bool
    isExpectingData: false
  };

  // select all wires of a range if range chaged
  static getDerivedStateFromProps(nextProps, prevState) {
    const incomingRange = nextProps.scope;
    const existingRange = schemaRangeByObjectIds(
      nextProps.schema,
      prevState.scopedObjects
    );

    const isSameRange = existingRange == incomingRange;
    // console.log(existingRange, incomingRange, isSameRange);

    if (isSameRange) {
      // console.log('[GDS] Return null');
      return null;
    } else {
      // console.log('[GDS] Update State');
      // return null;
      return {
        scopedObjects: schemaRangeObjects(nextProps.schema, nextProps.scope)
      };
    }
  }

  componentDidMount() {
    console.log('[FRESH-CHART][CDM]');
    this.setState({ isExpectingData: true });
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('[FRESH-CHART][CDU]');
  }

  // PROPS
  //schema = {schema}
  // latestTS = {freshMaxTS(fresh)}
  // scope = {this.state.scopedRange}
  // propMode = {this.state.propMode}
  // changePropMode = {this.handlePropModeChange.bind(this)}
  // changeScope = {this.handlePropModeChange.bind(this)}/

  // calc
  // scopedRange
  // scopedLine

  //
  // CLICKS
  //

  handleRangeHoursChange(newRange) {
    this.setState(prevState => {
      if (prevState.rangeHours !== newRange) {
        return { rangeHours: newRange, isExpectingData: true };
      } else {
        return null;
      }
    });
  }

  handleLineSelect(lineOption) {
    const lineID = lineOption.value;

    // define first range in line and communicate up to Fresh we have a new range
    const rangeID = schemaFirstRangeofLine(this.props.schema, lineID);
    const alreadySelectedLine = schemaLinebyRange(
      this.props.schema,
      this.props.scope
    );

    // console.log(lineOption, alreadySelectedLine);

    // send up only if another range is selected, otherwise it will close chart
    if (lineID !== alreadySelectedLine) {
      this.props.changeScope(rangeID);
      this.setState({ isExpectingData: true });
    }
  }

  handleRangeSelect(rangeOption) {
    const rangeID = rangeOption.value;

    // send up only if another range is selected, otherwise it will close chart
    if (rangeID !== this.props.scope) {
      this.props.changeScope(rangeID);
      this.setState({ isExpectingData: true });
    }
  }

  handleEntitySelect(selectedType) {
    // console.log(selectedType, 'entity clicked');
    console.log('%c[CHART-CTRLS] Select entity clicked', 'color: blue');

    const selected = parseInt(
      schemaObjIDbyType(this.props.schema, this.props.scope, selectedType)
    );

    this.setState(prevState => {
      const scoped = prevState.scopedObjects;
      console.log('scoped:', scoped, 'clicked', selected);

      if (!scoped.includes(selected)) {
        return {
          scopedObjects: [...scoped, selected]
        }; // add
      } else {
        // console.log('same selected', selected);
        return {
          scopedObjects: scoped.filter(v => v !== selected)
        }; // kill selected
      }
    });
  }

  handleSelectAllEntities() {
    this.setState(prevState => {
      console.log('%c[CHART-CTRLS] Select all clicked', 'color: blue');

      const selected = prevState.scopedObjects;
      const all = schemaRangeObjects(this.props.schema, this.props.scope);
      const isAllSelected = _.isEqual(selected, all) ? true : false;

      if (isAllSelected) {
        // console.log('Already all selected');
        return null;
      } else {
        return { scopedObjects: all };
      }
    });
  }

  handleTempSwitch() {
    this.setState(prevState => ({ isTempVisible: !prevState.isTempVisible }));
  }

  handlePropModeChange(modeOption) {
    this.props.changePropMode(modeOption.value);
  }

  handleCloseChartClick() {
    // Send current active range id to disable it in parent Fresh scope and close the chart automatically
    this.props.changeScope(this.props.scope);
  }

  handleDataReady() {
    this.setState({ isExpectingData: false });
  }

  //
  //
  //

  render() {
    const { schema, latestTS, scope, propMode, historyPKs } = this.props;

    // Define the timestamp range for the Chart
    const tsRange = [minusHrs(latestTS, this.state.rangeHours), latestTS];
    // console.log('tsRange',tsRange);

    // LINES stuff
    const scopedLine = schemaLinebyRange(schema, scope);
    const allLines = schema.lines;

    // ENTITIES stuff
    const possibleEntities = _.sortBy(schemaRangeObjectTypes(schema, scope));
    const possibleWires = schemaRangeObjects(schema, scope); // all wires for this range
    const availableEntities = schemaRangeObjectTypes(schema, scope);
    const scopedEntities = schemaTypesbyObjIDs(
      schema,
      this.state.scopedObjects
    );

    return (
      <div className={'chart_container'}>
        <div className={'chart_controls'}>
          <HoursPeriodSelector
            rangeHours={this.state.rangeHours}
            onRangeHoursChange={this.handleRangeHoursChange.bind(this)}
          />

          <ScopeSelector
            scopedLine={scopedLine}
            scopedRange={scope}
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
            propMode={propMode}
            onPropModeChange={this.handlePropModeChange.bind(this)}
            isTempVisible={this.state.isTempVisible}
            onTempSwitchClick={this.handleTempSwitch.bind(this)}
          />

          <CloseChartPane onClick={this.handleCloseChartClick.bind(this)} />
        </div>

        {this.state.isExpectingData ? <LoadingScreen /> : null}

        <Chart
          objData={schema.obj} // schema objs
          tsRange={tsRange} // []
          fMode={this.props.fMode}
          iceMode={this.props.iceMode}
          spanLength={this.props.spanLength}
          scopedWires={this.state.scopedObjects} // wire ids [1,2,3]
          possibleWires={possibleWires} // for this range
          propMode={propMode}
          isTempVisible={this.state.isTempVisible}
          historyPKs={historyPKs}
          onResize={() => null}
          onDataLoaded={this.handleDataReady.bind(this)}
          ptsCount={this.props.freshMaxPtsCount}
          mode="fresh"
        />
      </div>
    );
  }
}

export default FreshChart;
