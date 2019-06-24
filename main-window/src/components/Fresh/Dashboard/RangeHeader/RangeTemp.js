import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThermometerHalf } from '@fortawesome/free-solid-svg-icons' 
import {UNITS} from '../../../../APInHelpers/base';

const rangeTemp = ({temp}) => {
    return (
        <span 
            className='header_feature'
            title='Температура воздуха на участке'>
            <FontAwesomeIcon icon={faThermometerHalf} className={'therm_icon'}/>
            {temp.toFixed(1)}
            <span className={'unit'}>{UNITS.get('T')}</span>
        </span> 
    );
}
 
export default rangeTemp;