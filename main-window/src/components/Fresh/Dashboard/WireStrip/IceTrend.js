import React from 'react';
import { Sparklines, SparklinesCurve, SparklinesSpots } from 'react-sparklines';
import LinearGradientFill from './LinearGradeintFill';



const IceTrend = ({data, trendBounds, iceYellowThreshold, iceRedThreshold, changeScope}) => {
    

    return (

        <span className={'trend'}>
        
            <Sparklines 
                data={data}
                min={trendBounds[0]}
                max={trendBounds[1]}>
            
                <SparklinesCurve
                style={{
                    strokeWidth: 5, 
                    stroke: '#D9DBDB', 
                    strokeOpactity: 1,  
                    // fill: 'url(#gradient)', 
                    fillOpacity: 1

                }}/>

                <SparklinesSpots 
                  size={8}
                  spotColors={{'1':'#5DA1FF'}}
                />

            </Sparklines>

        </span>
    );
}
 
export default IceTrend;



<span>
<Sparklines 
    data={[5,5,5.2,4.7,5,5.4,4.6,5]}
    min={0}
    max={10}>
    
    
    <svg>
        <defs>
            <LinearGradientFill/>
        </defs>
    </svg>

    <SparklinesCurve
        style={{
            strokeWidth: 5, 
            stroke: '#D9DBDB', 
            strokeOpactity: 1,  
            fill: 'url(#gradient)', 
            fillOpacity: 1
        }}/>

    <SparklinesSpots 
            size={8}
        />
    

</Sparklines>
</span>