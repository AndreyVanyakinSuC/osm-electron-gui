import React from 'react';
import ChartIcon from '../ChartIcon';
import PropTypes from 'prop-types';

const rangeChart = ({rangeID, isScoped, changeScope}) => {

    // console.log(`range ${rangeID} is scoped? ${isScoped}`);
    return (
        <span className={'header_feature'} >
            <span 
                onClick={changeScope.bind(null, rangeID)}
                >
                <ChartIcon isScoped={isScoped}/>
            </span>
        </span> 
    );
}
 

rangeChart.propTypes = {
    isScoped: PropTypes.bool.isRequired,
    changeScope: PropTypes.func.isRequired
};


export default rangeChart;