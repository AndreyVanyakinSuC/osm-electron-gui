import React from 'react';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const lineSelector = ({value, lines, changed}) => {
    
   
    const lineOptions = Object.keys(lines).map((lineId) =>  {
        return { 'value' : parseInt(lineId),  'label': lines[lineId].Name}
    })
    
    const currentOption = { 'value': value, 'label': lines[value].Name}
    // [{ value: '1', label: 'linesname1'},
    // { value: '2', label: 'linesname2'}]

    return (  
        <Dropdown 
            className='line_selector'
            value={currentOption}    
            options={lineOptions}
            onChange={changed}
            placeholder='Выберите ВЛ'
            />
    );
}
export default lineSelector;