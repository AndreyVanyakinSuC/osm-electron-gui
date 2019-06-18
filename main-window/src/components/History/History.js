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
import {DEFAULT_HISTORY_HRS, HISTORY_SPAN_SECS} from '../../APInHelpers/base';
import { nowTS, minusHrs, plusHrs, date_UTS, uts_Date} from '../../APInHelpers/timeseries';
import { schemaRangeObjects, schemaObjIDbyType, schemaAllObjectTypes, schemaRangeObjectTypes, schemaTypesbyObjIDs,schemaFirstRangeofLine, schemaFirstLineID, schemaObjIDs } from '../../APInHelpers/schema';


// LoadingScreen is triggered when 

class History extends PureComponent {

    state={
        startTS: minusHrs(nowTS(), DEFAULT_HISTORY_HRS),
        endTS: nowTS(),
        isExpectingData: false, // any change was made that has to request new data from IDB
        propMode:'F', //F, dF, I
        isTempVisible: false, //bool
        isVibroVisible: false,
        scopedObjects: schemaRangeObjects(this.props.schema, schemaFirstRangeofLine(this.props.schema, schemaFirstLineID(this.props.schema))), //[A, B, C, ОКГТ] etc all scoped by default
        scopedRange: schemaFirstRangeofLine(this.props.schema, schemaFirstLineID(this.props.schema)), // default first range ID
        scopedLine: schemaFirstLineID(this.props.schema),  // defautl first line ID

    }

    handleLineSelect(lineOption) {
        const lineID = lineOption.value;
        this.setState(prevState => {
            if (prevState.scopedLine !== lineID) {
                return {
                    scopedLine: lineID,
                    scopedRange: schemaFirstRangeofLine(this.props.schema, lineID),
                    scopedObjects: schemaRangeObjects(this.props.schema, schemaFirstRangeofLine(this.props.schema, lineID)),
                    isExpectingData: true
                }
            } else {
                return null;
            }
        })
    }

    handleRangeSelect(rangeOption) {
        const rangeID = rangeOption.value;
        this.setState(prevState => {
            if (prevState.scopedRange !== rangeID) {
                return {
                    scopedRange: rangeID,
                    scopedObjects: schemaRangeObjects(this.props.schema, rangeID),
                    isExpectingData: true
                }
            } else {
                return null;
            }
        })
    }

    handleStartDateChange(date) {
        this.setState(prevState => {
            
            // Force startDate to be endDate - 24h if user tries to set startDate > endDate

            let newStartTs;

            if (date_UTS(date) >= prevState.endTS) {
                newStartTs = minusHrs(prevState.endTS, 24);
            } else {
                newStartTs = date_UTS(date);
            }
        
        
            return {
                startTS: newStartTs,
                isExpectingData: true
            }
        })
    }

    handleEndDateChange(date) {
        
        this.setState( prevState => { 
            
            // Force startDate to be endDate - 24h if user tries to set startDate > endDate

            let newEndTs;

            if (date_UTS(date) <= prevState.startTS) {
                newEndTs = plusHrs(prevState.startTS, 24);
            } else {
                newEndTs = date_UTS(date);
            } 
            
            return {
                endTS: newEndTs,
                isExpectingData: true
            }
        })
    }
    
    handleEntitySelect(selectedType) {
        // console.log(selectedType, 'entity clicked');
        console.log('%c[CHART-CTRLS] Select entity clicked', 'color: blue');

        const selected = parseInt(schemaObjIDbyType(this.props.schema, this.state.scopedRange, selectedType))

        this.setState(prevState => {

            const scoped = prevState.scopedObjects;
            // console.log('scoped:', scoped, 'clicked', selected);
            
            if (!scoped.includes(selected)) {
                return {
                    scopedObjects: [...scoped, selected],
                    // isExpectingData: true
                } // add
            } else {
                // console.log('same selected', selected);
                return {
                    scopedObjects: scoped.filter(v => v !== selected),
                    // isExpectingData: true
                } // kill selected
            }
        })
    }
    
    handleSelectAllEntities() {
        this.setState(prevState => {
            console.log('%c[CHART-CTRLS] Select all clicked', 'color: blue');


            const selected = prevState.scopedObjects;
            const all = schemaRangeObjects(this.props.schema, prevState.scopedRange)
            const isAllSelected = _.isEqual(selected, all) ? true : false;
            
            if (isAllSelected) {
                // console.log('Already all selected');
                return null;
            } else {
                
                return { 
                    scopedObjects: all, 
                    // isExpectingData: true 
                }
            }
        })
    }

    handlePropModeChange(modeOption) {
        this.setState(prevState => {
            const was = prevState.propMode;
            const selected = modeOption.value;
            
            if (was === selected) {
                return null
            } else {
                return {
                    propMode: selected,
                    // isExpectingData: true
                }

            }
        })
    }

    handleTempSwitch() {
        this.setState(prevState => ({
            isTempVisible: !prevState.isTempVisible, 
            // isExpectingData: true
        }))
    }

    handleChartResize(xLimits) {
        console.log('[HISTORY] Updated');
        // console.log(limits);
        const {xStart, xEnd} = xLimits;
        // console.log(xStart, xEnd);

        // Don't let scroll to future
        let endTS;

        if (date_UTS(xEnd) >= nowTS()) {
            endTS = nowTS();
        } else {
            endTS = date_UTS(xEnd)
        }



        this.setState(prevState => {
            return {
                isExpectingData: false,
                startTS: date_UTS(xStart),
                endTS: endTS,
            }
        })
    }


    handleDataReady() {
        this.setState({isExpectingData: false})
    }


    handleHistoryRequest() {
        // 1) take [ts start, ts end] from state
        // 2) take all possible [objids] for this schema
        // 3) define missing spans for each object [[ts1, ts2], [ts3, ts4] ... [ts5, ts6]]
        // 4) prepare request

        const needMin = this.state.startTS;
        const needMax = this.state.endTS;
        const objIDs = schemaObjIDs(this.props.schema)

        this.props.onHistoryRequired(needMin, needMax, objIDs, HISTORY_SPAN_SECS);

        this.setState({isExpectingData: true})

        console.log('%c[H] onHistoryRequired fired', 'color: magenta');
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
        const tsRange = [this.state.startTS, this.state.endTS]

        
        // ENTITIES and WIRES stuff
        const possibleEntities = _.sortBy(schemaAllObjectTypes(schema));
        const possibleWires = schemaRangeObjects(schema, this.state.scopedRange); // all wires for this range
        const availableEntities = schemaRangeObjectTypes(schema, this.state.scopedRange)
        const scopedEntities = schemaTypesbyObjIDs(schema, this.state.scopedObjects)
        // console.log(scopedEntities);


        return(
            <div className='history'>
                
                <div className='chart_controls'>    
                    <DateRangeSelector
                        startSelected={uts_Date(this.state.startTS)}
                        endSelected={uts_Date(this.state.endTS)}
                        onStartChanged={this.handleStartDateChange.bind(this)}
                        onEndChanged={this.handleEndDateChange.bind(this)}
                        isConnected={isConnected}
                        onHistoryRequestClick={this.handleHistoryRequest.bind(this)}/>

                    

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
                        onSelectAllClick={this.handleSelectAllEntities.bind(this)}/>

                    <ModeSelector 
                        propMode={this.state.propMode}
                        onPropModeChange={this.handlePropModeChange.bind(this)}
                        isTempVisible={this.state.isTempVisible}
                        onTempSwitchClick={this.handleTempSwitch.bind(this)}/>

          

                </div>
                
                
                
                {this.state.isExpectingData ?  <LoadingScreen/> : null}

                <Chart
                    objData = {schema.obj} // schema objs 
                    tsRange={tsRange} // []
                    scopedWires={this.state.scopedObjects} // wire ids [1,2,3]
                    possibleWires={possibleWires} // for this range
                    propMode={this.state.propMode}
                    isTempVisible={this.state.isTempVisible}
                    isVibroVisible={this.state.isVibroVisisble}
                    historyPKs={this.props.historyPKs}
                    // isNormalBandVisible={true}
                    onResize={this.handleChartResize.bind(this)}
                    onDataLoaded={this.handleDataReady.bind(this)}
                    mode='history' />
          
            </div>
        )
    }
}

export default History;
