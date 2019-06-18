import React from 'react';

const checkGroup = ({ name, selectedValues, selectedChanged, isolate, options }) => {
    console.log(selectedValues);
    return (
        <div className={"btn-group"}>

            {options.map(o => {return (
                <div 
                    key={o.value}
                    className={selectedValues.includes(o.value) ? "item active" : "item"}>

                    <input type="checkbox" id={o.value} value={o.value}/>
                    <label
                        onClick={selectedChanged.bind(null, o.value)}
                        onDoubleClick={isolate.bind(null, o.value)}>
                        {o.label}
                    </label>

                </div>)
            })}

        </div>
    );
}
 
export default checkGroup;