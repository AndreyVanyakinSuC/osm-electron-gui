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
        // console.log('depFresh', depFresh);
        const maxIce = _.max(_.map(depFresh, f => f.I));
        const msgCode = (_.find(depFresh, f => f.I === maxIce)).msg[0];
        const wireId = _.find(depObjs, id => depFresh[id].I === maxIce && depFresh[id].msg[0] === msgCode)
        // console.log(maxIce, msgCode, wireId);

        const ribbonData = {
            value: maxIce, 
            msgCode: msgCode,
            wireId: wireId
        }


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
                            focusChart={focusChart}
                            isExpanded = {state.expanded}
                            linesCount={linesCount}/> }
                    </AccordionItemState>
                    
                </AccordionItemButton>
            </AccordionItemHeading>

            <AccordionItemPanel className='dep_body'>
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