import React from 'react';
import PropertySelector from './PropertySelector';
import Button from './Button';

const ModeSelector = (props) => {
    
    const {propMode, onPropModeChange, isTempVisible, onTempSwitchClick} = props;
    
    return (

        <div className='selector-card'>
            <div className='selector-header'> 
                Выберите режим 
            </div>
            <div className='selector-body'> 
                <PropertySelector 
                    value={propMode}
                    changed={onPropModeChange}/>

                <Button 
                    isActive={isTempVisible}
                    isIcon={true}
                    label={'Температура'}
                    clicked={onTempSwitchClick}/>
            </div>
        </div>



    );
}
 
export default ModeSelector;