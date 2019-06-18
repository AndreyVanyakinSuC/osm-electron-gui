import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const rangeSelector = ({value, schema, selectedLine, changed}) => {
    
    const rangeIDs = schema.lines[selectedLine].ranges
    // [1,2,4]

    const towersNameByRange = (id, schema) => (
        [schema.towers[schema.ranges[id].towers[0]].number, schema.towers[schema.ranges[id].towers[1]].number]
    ) // ['2424','443']

    const renderRangeLabel = (id, schema) => (
        `№№ ${towersNameByRange(id,schema)[0]}-${towersNameByRange(id,schema)[1]}` 
    ) // 
    
    const rangeOptions = rangeIDs.map((rangeId) =>  (
        { 
            'value' : rangeId,  
            label: renderRangeLabel(rangeId, schema)
        }
    ))

    // [{ value: '1', label: 'linesname1'},
    // { value: '2', label: 'linesname2'}]

    const currentOption = { 'value': value, 'label': renderRangeLabel(value, schema)}

    return (  
        <Dropdown 
            className='range_selector'
            value={currentOption}
            options={rangeOptions}
            onChange={changed}
            placeholder='Выберите участок'
            />
    );
}
export default rangeSelector;