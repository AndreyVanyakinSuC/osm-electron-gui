import React from 'react';
import LineSelector from './LineSelector';
import RangeSelector from './RangeSelector';
import EntitySelector from './EntitySelector';
import Button from './Button';


const ScopeSelector = (props) => {
    
    const {
        scopedLine, 
        scopedRange, 
        scopedEntities, 
        possibleEntities, 
        availableEntities,
        schema,
        onLineSelected,
        onRangeSelected,
        onEntitySelected,
        onSelectAllClick
    } = props;

    
    return (  

        <div className='selector-card'>
            <div className='selector-header'> 
                Выберите участок и фазы
            </div>

            <div className='selector-body'>

                <span className='line-range'>
                    <LineSelector 
                        value={scopedLine}
                        lines={schema.lines}
                        changed={onLineSelected}/>

                    <RangeSelector 
                        value={scopedRange}
                        schema={schema}
                        selectedLine={scopedLine}
                        changed={onRangeSelected}/>
                </span>
                

                <EntitySelector
                    possibleEntities={possibleEntities}
                    availableEntities={availableEntities}
                    scopedEntities={scopedEntities}
                    changed={onEntitySelected}/> 

                {/* Select all entites  */}
                <Button
                    isActive={false}
                    isIcon={false}
                    label={'Все'}
                    clicked={onSelectAllClick}/>
            </div>
        </div>

    );
}
 

export default ScopeSelector;