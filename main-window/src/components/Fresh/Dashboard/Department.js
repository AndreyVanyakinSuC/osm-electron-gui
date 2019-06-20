import React from 'react';
import Line from './Line'
import DepartmentHeader from './DepartmentHeader';
import {filterFresh} from '../../../APInHelpers/history';
import { Accordion, AccordionItem, AccordionItemPanel, AccordionItemHeading, AccordionItemButton, AccordionItemState} from 'react-accessible-accordion';

const department = ({schema, fresh, depID, scope, changeScope, mapFocus, focusChart}) => {
    
    const depName = schema.deps[depID].Name;
    const lines = schema.deps[depID].lines;
    const linesCount = lines.length;
    const depObjs = _.uniq(_.flatten(_.flatten(lines.map(lID => schema.lines[lID].ranges)).map(rID => schema.ranges[rID].obj)));
    const depFresh = filterFresh(fresh, depObjs);
    
    // Combine value
        // console.log(lines, depFresh);
        const maxIce = _.max(depFresh.map(f => f.I));
        // console.log(depFresh, maxIce);
        const msgCode = depFresh.find(f => f.I === maxIce).msg[0];
        // console.log(maxIce, msgCode);

        const ribbonData = {value: maxIce, msgCode: msgCode}


    return (
        <AccordionItem 
            className={'dep_block'}
            uuid={`dep${depID}`}>
            
            <AccordionItemHeading>
                <AccordionItemButton>
                    <AccordionItemState>
                        {state => <DepartmentHeader 
                            depID={depID} 
                            depName={depName} 
                            ribbonData ={ribbonData}
                            mapFocus={mapFocus}
                            isExpanded = {state.expanded}
                            linesCount={linesCount}/> }
                    </AccordionItemState>
                    
                </AccordionItemButton>
            </AccordionItemHeading>

            <AccordionItemPanel>
                <Accordion 
                    preExpanded={lines.map(lineID => `line${lineID}`)}
                    allowMultipleExpanded={true}
                    allowZeroExpanded={true}>
                    {lines.map(lineID => 
                        <Line 
                            key={`line${lineID}`} 
                            schema={schema} 
                            fresh={fresh} 
                            lineID={lineID}
                            scope={scope}
                            mapFocus={mapFocus}
                            focusChart={focusChart}
                            changeScope={changeScope}/>
                    )}
                </Accordion>
            </AccordionItemPanel>

        </AccordionItem>
    );
}
export default department;