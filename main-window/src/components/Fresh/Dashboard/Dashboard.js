import React from 'react';
import { Accordion} from 'react-accessible-accordion';


import Line from './Line';
import Department from './Department';

const dashboard = ({schema, fresh, scope, changeScope, focusChart, mapFocus}) => {
        
    let markup;

    // We don't want to show department level if there's only one department
    const deps = Object.keys(schema.deps);

    if (deps.length === 1) {

        const lines = schema.deps[deps.join()].lines;
        markup = lines.map(lineID => 
            <Line 
                key={`line${lineID}`} 
                schema={schema} 
                fresh={fresh} 
                scope={scope}
                changeScope={changeScope}
                mapFocus={mapFocus}
                focusChart={focusChart}
                lineID={lineID}/>
        )

    } else {

        markup = deps.map(depID => 
            <Department 
                key={`dep${depID}`}
                depID={depID}
                schema={schema}
                scope={scope}
                changeScope={changeScope}
                mapFocus={mapFocus}
                focusChart={focusChart}
                fresh={fresh}/>
        )

    }

    return (
        <Accordion 
            className='dashboard'
            allowMultipleExpanded={true}
            allowZeroExpanded={true}>
            {markup}
        </Accordion>
    );
}
 
export default dashboard;