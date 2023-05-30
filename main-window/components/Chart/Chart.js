import React, { PureComponent } from 'react';

// Building plotly to enable RU locale
import Plotly from 'plotly.js/dist/plotly';
import locale from 'plotly.js-locales/ru';
import createPlotlyComponent from 'react-plotly.js/factory';
const Plot = createPlotlyComponent(Plotly);
Plotly.register(locale);
Plotly.setPlotConfig({ locale: 'ru' });
import { formatDataArr, F_MODES, I_MODE } from '../../APInHelpers/history';
import SettingsContext from '../SettingsContext';

import _ from 'lodash';
import {
  CONFIG,
  SETTINGS,
  wiresToState,
  displayName_wireID,
  mainTraces,
  tempTraces,
  generalLayout,
  xLayout,
  yLayout,
  normalBandShapes,
  iceLevelsShapes,
  ghostShape,
  traceShapes,
  highlightDangerShapes,
  valueAnnotation
} from '../../APInHelpers/plotly';
import {
  date_UTS,
  displayHuman,
  freshMaxTS
} from '../../APInHelpers/timeseries';

import { readDataByTSRanges } from '../../APInHelpers/database';

// PROPS
// schema.obj= {}
// tsRange = []
// scopedWires=  [1,2,3]
// possibleWires
// propMode = str
// isTempVisible
// isVibroVisible
// mode: history / fresh
// onUpdate

class Chart extends PureComponent {
  state = {
    dataArr: [], // [slices]
    revision: 0,
    isNormalVisible: wiresToState(this.props.possibleWires), // {"possibleWireID": true/false}
    yMainRange: null, //[min, max]
    yTempRange: null // default to null to enable autoscale
    // isReady: false,
  };

  // Update isNormalVisible if possibleWireIds have changed
  static getDerivedStateFromProps(nextProps, prevState) {
    const prevPossibleWireIDs = _.keys(prevState.isNormalVisible).map(id =>
      parseInt(id)
    );
    const nextPossibleWireIDs = nextProps.possibleWires; // to compare
    // console.log(prevPossibleWireIDs, nextPossibleWireIDs);

    if (_.isEqual(prevPossibleWireIDs, nextPossibleWireIDs)) {
      return null;
    } else {
      return { isNormalVisible: wiresToState(nextPossibleWireIDs) };
    }
  }

  // re-read data from DB if range || timespan changed  i.e if new range or new timerange OUT => write data and revision to state
  // write data to state as if everything is visible
  async updateState(tsRange, possibleWires) {
    console.log(
      `%c[CHART] Data update started, revision ${
        this.state.revision
      }, human range ${displayHuman(tsRange)}`,
      'color: darkgreen'
    );

    const dataArr = formatDataArr(
      await readDataByTSRanges(possibleWires, tsRange),
      this.props.spanLength,
      this.props.fMode,
      this.props.iceMode
    );
    // console.log(`%c[CHART] Max ts in datarr ${displayHuman(freshMaxTS(dataArr))}`,'color: darkgreen');

    this.setState(prevState => ({
      dataArr: dataArr,
      revision: prevState.revision + 1
      // isReady: true
    }));

    // Make parent know that data fetch is finalised and we can show it
    this.props.onDataLoaded();
  }

  async componentDidMount() {
    console.log('%c[CHART] Component did mount', 'color: darkgreen');
    const { tsRange, possibleWires } = this.props;
    // await this.requestHistory(tsRange, possibleWires);
    await this.updateState(tsRange, possibleWires);
  }

  async componentDidUpdate(prevProps, prevState) {
    // re-read data from DB if range || timespan changed || db was updated with history i.e if new range or new timerange OUT => write data and revision to state
    // write data to state as if everything is visible

    const { tsRange, possibleWires, propMode, historyPKs } = this.props;
    const isNewXRange = !_.isEqual(prevProps.tsRange, tsRange);
    const isNewScope = !_.isEqual(prevProps.possibleWires, possibleWires);
    const isNewPropMode = !_.isEqual(prevProps.propMode, propMode);
    const isNewHistory = !_.isEqual(prevProps.historyPKs, historyPKs);

    // console.log('[H] isNewProps',isNewProps, 'isNewHistory',isNewHistory );
    isNewXRange || isNewScope || isNewHistory
      ? await this.updateState(tsRange, possibleWires)
      : null;

    // Reset y axis ranges to null (autoscale) when new propmode or possible wires changed
    isNewScope || isNewPropMode
      ? this.setState({ yMainRange: null, yTempRange: null })
      : null;
  }

  componentWillUnmount() {}

  yRangesToState(layout) {
    // destructure changes
    const yMainRange = [layout['yaxis.range[0]'], layout['yaxis.range[1]']];
    const yTempRange = [layout['yaxis2.range[0]'], layout['yaxis2.range[1]']];
    const yMainAutorange = layout['yaxis.autorange'];
    const yTempAutorange = layout['yaxis2.autorange'];

    // Check if autorange was clicked in modebar
    if (yMainAutorange) {
      this.setState({ yMainRange: null });
    }

    if (yTempAutorange) {
      this.setState({ yTempRange: null });
    }

    // Check if layout has the info
    if (!_.includes(yMainRange, undefined)) {
      // console.log('ran');
      this.setState({ yMainRange: yMainRange });
    }

    if (!_.includes(yTempRange, undefined)) {
      // console.log('ran');
      this.setState({ yTempRange: yTempRange });
    }
  }

  handleRelayout(layout) {
    console.log('%c[CHART] Relayout', 'color: darkgreen', layout);

    // https://plot.ly/javascript/plotlyjs-events/#update-data

    //
    // Y axis to state
    //
    this.yRangesToState(layout);

    //
    // X axis up
    //

    const xRange = [layout['xaxis.range[0]'], layout['xaxis.range[1]']];

    if (!_.includes(xRange, undefined)) {
      this.props.onResize(xRange);
    }
  }

  handleClick(info) {
    // console.log('%c[CHART] Click','color: darkgreen');

    const displayName = info.points[0].fullData.name;
    // console.log(displayName);

    const clickedID = displayName_wireID(displayName, this.props.objData);

    this.setState(prevState => {
      let newState = { ...prevState.isNormalVisible };
      newState[clickedID] = !prevState.isNormalVisible[clickedID];

      return {
        revision: prevState.revision + 1,
        isNormalVisible: newState
      };
    });
  }

  // Double click on plot area enables autorange on y axis
  handleDblClick() {
    console.log('%c[CHART] Double Click', 'color: darkgreen');
    this.setState({ yMainRange: null, yTempRange: null });
  }

  static contextType = SettingsContext;

  render() {
    const dataArr = this.state.dataArr;
    const props = this.props;
    const { isTempVisible, mode, tsRange, propMode, ptsCount } = props;

    // Main
    const plotlyMainData = mainTraces(
      dataArr,
      props,
      ptsCount,
      this.context.iceMode,
      this.context.spanLength,
      this.context.fMode
    );
    const plotlyYLayoutMain = yLayout(
      propMode,
      mode,
      this.state.yMainRange,
      this.context.iceMode,
      this.context.spanLength,
      this.context.fMode
    );

    // Temperature
    const plotlyTempData = isTempVisible
      ? tempTraces(dataArr, props, ptsCount)
      : null;
    const plotlyYLayoutTemp = isTempVisible
      ? yLayout('Tamb', mode, this.state.yTempRange)
      : null;

    // Layout
    const plotlyGeneralLayout = generalLayout(mode);
    const plotlyXLayout = xLayout(tsRange, mode);

    //Shapes
    // const plotlyTraceShapes = traceShapes(plotlyMainData);

    let shapes = [];
    if (propMode === 'F' || propMode === 'dF') {
      const plotlyTensionLimitsShapes = normalBandShapes(
        dataArr,
        props,
        this.state.isNormalVisible
      );
      shapes = plotlyTensionLimitsShapes;
      // WE add ghost shapes to make buffer view
      if (mode === 'fresh') {
        const ghostShapes = ghostShape(dataArr);
        !!ghostShapes ? shapes.push(ghostShapes) : null;
      }
    } else if (propMode === 'I' && this.props.iceMode === I_MODE.mm) {
      const plotlyIceLevelShapes = iceLevelsShapes();
      shapes = plotlyIceLevelShapes;
    }
    // shapes = _.flatten([...shapes, plotlyTraceShapes]);

    // Annotations
    let annotations = [];

    if (mode === 'fresh') {
      annotations = valueAnnotation(
        plotlyMainData,
        this.context.iceMode,
        this.context.spanLength,
        this.context.fMode
      );
    }

    // Combine all
    const data = isTempVisible
      ? [...plotlyMainData, plotlyTempData]
      : plotlyMainData;
    const layout = _.merge(
      {},
      plotlyGeneralLayout,
      plotlyXLayout,
      plotlyYLayoutMain,
      plotlyYLayoutTemp,
      { shapes: shapes },
      { annotations: annotations }
    );

    // TEST
    // highlightDangerShapes(plotlyMainData);

    console.log(
      `%c[CHART] Render with revision ${this.state.revision}`,
      'color:darkgreen'
    );

    return (
      <Plot
        data={data}
        layout={layout}
        revision={this.state.revision}
        onInitialized={console.log(
          '%c[CHART][PLOT] Initialised',
          'color:darkgreen'
        )}
        // onInitialized={fig => this.setState(fig)}
        // onUpdate={this.props.onUpdate}
        // onHover={this.handleHover.bind(this)}
        // onUnhover={this.handleUnhover.bind(this)}
        onClick={this.handleClick.bind(this)}
        onDoubleClick={this.handleDblClick.bind(this)}
        onRelayout={this.handleRelayout.bind(this)}
        onError={err => console.log('[CHART] error', err)}
        debug={true}
        config={CONFIG[mode]}
        className={SETTINGS[mode].CLASS_NAME}
        divId={SETTINGS[mode].DIVID}
        useResizeHandler={false}
      />
    );
  }
}

export default Chart;
