import React from 'react';
import { AccordionItem, AccordionItemPanel, AccordionItemHeading, AccordionItemButton, AccordionItemState} from 'react-accessible-accordion';
import _ from 'lodash';
import {filterFresh} from '../../../APInHelpers/history';
import LineHeader from './LineHeader';
import RangeCard from './RangeCard';

const line = ({schema, fresh, lineID, scope, changeScope, mapFocus, focusChart}) => {
    
        const lineName = schema.lines[lineID].Name;
        const ranges = schema.lines[lineID].ranges;
        const lineObjs = _.flatten(ranges.map(rID => schema.ranges[rID].obj));
        const lineFresh = filterFresh(fresh, lineObjs);

        // Combine value
        // console.log('linefresh', lineFresh);
        const maxIce = _.max(_.map(lineFresh, f => f.I));
        const msgCode = (_.find(lineFresh, f => f.I === maxIce)).msg[0];
        const wireId = _.find(lineObjs, id => lineFresh[id].I === maxIce && lineFresh[id].msg[0] === msgCode)
        console.log(maxIce, msgCode, wireId);

        const ribbonData = {
            value: maxIce, 
            msgCode: msgCode,
            wireId: wireId
        }

        return (
            <AccordionItem 
                className='line_block' 
                uuid={`line${lineID}`}> 
                <AccordionItemHeading>
                    <AccordionItemButton>
                        <AccordionItemState>
                            {state => <LineHeader 
                                    lineID={lineID} 
                                    lineName={lineName} 
                                    ribbonData ={ribbonData}
                                    mapFocus={mapFocus}
                                    focusChart={focusChart}
                                    isExpanded = {state.expanded}
                                    rangesCount={ranges.length} />}
                        </AccordionItemState>
                    </AccordionItemButton>
                    
                </AccordionItemHeading>

                <AccordionItemPanel className='line_body'>
                
                    {ranges.map(rangeID => 
                        <RangeCard 
                            key={`range${rangeID}`} 
                            lineID={lineID}
                            rangeID={rangeID} 
                            schema={schema} 
                            fresh={fresh}
                            isScoped={scope === rangeID ? true : false}
                            mapFocus={mapFocus}
                            focusChart={focusChart}
                            changeScope={changeScope}/>
                        )
                    }
                    
                </AccordionItemPanel>

            </AccordionItem>
        )

    }

 
export default line;