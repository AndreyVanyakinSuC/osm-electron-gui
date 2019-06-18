import React, {Component} from 'react';
import Dashboard from './Dashboard/Dashboard';
import Map from './Map/MyMap';
import FreshChart from './FreshChart';

import { freshMaxTS, minusHrs } from '../../APInHelpers/timeseries';
import { TREND_HRS, HISTORY_SPAN_SECS} from '../../APInHelpers/base';
import { schemaObjIDs } from '../../APInHelpers/schema';

class Fresh extends Component {
    state = {
        mapFocus: {
            entityID: null,
            entityType: null // 'dep' , 'line', 'range', 'tower'
        },
        mapScheme: 'map', // 'map' or 'scheme'
        scopedRange: null, // id of range in scope
        chartPropMode: 'F', //F, dF, I
    }


    componentDidMount() {
        // Will request history for trends on startup for all objects in schema
        const needMax = freshMaxTS(this.props.fresh);
        const needMin = minusHrs(needMax, TREND_HRS)
        const objIDs = schemaObjIDs(this.props.schema)

        this.props.onHistoryRequired(needMin, needMax, objIDs, HISTORY_SPAN_SECS);
        console.log('[F] Fired onHistoryRequired handler');
        
    }

    //
    // BASE
    //
    handlePropModeChange(newPropMode) {
        this.setState(prevState => {
            if (prevState.chartPropMode !== newPropMode) {
                return { chartPropMode: newPropMode};
            } else {
                return null;
            }
        })
    }
    handleScopeRangeChange(newScopeRange) {
        this.setState(prevState => {
            if (prevState.scopedRange !== newScopeRange) {
                return {scopedRange: newScopeRange}
            } else {
                return {scopedRange: null};
            }
        })

    }
    //
    //
    //


    //
    // CLICKS
    //
    handleChartIconClick(newScopeRange, event) {
        this.handleScopeRangeChange(newScopeRange);
    }
    // OUT = RANGE ID AND PROP TO STATE
    handleWireStripClick(prop, wireID, event) {
        // event.stopPropagation();

        const clickedWireRange = this.props.schema.obj[wireID].parentRange;

        this.handlePropModeChange(prop);
        this.handleScopeRangeChange(clickedWireRange)


        // return only changed
        // this.setState(prevState => {
        //     // chart is closed, no scope
        //     if (!prevState.isChartVisible) {
        //         // turn on and show
        //         return { scopedRange: clickedWireRange, chartPropMode: mode, isChartVisible: true}
        //     } else { // is visible
        //         if (prevState.scopedRange === clickedWireRange) {
        //             if (prevState.chartPropMode === prop) {
        //                 return {scopedRange: null, isChartVisible: false}; // cliced the same turn off
        //             } else {
        //                 return { chartPropMode: prop}
        //             }
        //         } else {
        //             if (prevState.chartPropMode === prop) {
        //                 return {scopedRange: clickedWireRange}
        //             } else {
        //                 return {scopedRange: clickedWireRange, chartPropMode: prop}
        //             }
        //         }
        //     }
        // })
    }
    // entity and id to scope
    handleMapFocusClick(entityType, entityID, event) {
        // console.log( ' map focus clicked');
        this.setState(() => ({ mapFocus: {entityID: entityID, entityType: entityType} }))
        // this.setState(prevState =>{ mapFocus: `${entityType}_${entityID}`})
    }

    // after succesfull zoom
    handleResetFocus() {
        this.setState({ mapFocus: {entityID: null, entityType: null} })
    }
    // change Map to Scheme and vice-versa
    handleMapSchemeSwitchClick(clickedMode) {
        this.setState(prevState => {
            if (prevState.mode === clickedMode) {
                return null;
            } else {
                return { mode: clickedMode }
            }
        })
    }
    //
    //
    //

    render() {

        const { fresh, schema, historyPKs } = this.props;
        // have smth in scope
        const isChartVisible = this.state.scopedRange !== null ? true : false;
        const latestTS = freshMaxTS(fresh);
        // console.log(fresh, latestTS);

        return (
            <div className='current'>
                <div className='left_pane'>
                    <Dashboard 
                        schema = {schema}
                        fresh ={fresh}
                        scope={this.state.scopedRange}
                        changeScope={this.handleChartIconClick.bind(this)}
                        focusChart={this.handleWireStripClick.bind(this)}
                        mapFocus={this.handleMapFocusClick.bind(this)}/>
                </div>
                <div className='right_pane'>
                    <Map 
                        schema ={schema}
                        zoomTo={this.state.mapFocus}
                        resetZoomTo= {this.handleResetFocus.bind(this)}
                        fresh ={fresh}/>
                
                {
                    isChartVisible ? 
                    <FreshChart 
                        schema = {schema}
                        latestTS = {latestTS}
                        scope = {this.state.scopedRange}
                        propMode = {this.state.chartPropMode}
                        historyPKs= {historyPKs}
                        changePropMode = {this.handlePropModeChange.bind(this)}
                        changeScope = {this.handleScopeRangeChange.bind(this)}/>  : null
                }
                </div>
            </div>
        )
    }
}

export default Fresh;