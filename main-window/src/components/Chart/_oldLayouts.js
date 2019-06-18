const linear = require('everpolate').linear;

import {format, toXYPairs} from '../../APInHelpers/Utils';
import moment from 'moment';
import flatten from 'lodash.flatten';

export const PERMITTEDCOLOR =  'rgba(12, 173, 255, 1)'//'rgba(112, 128, 144, 1)'
export const WARNINGCOLOR = 'rgba(255, 168, 52, 1)';
export const DANGERCOLOR = 'rgba(255, 51, 51, 1)';




export const generalLayout = (tempVisible, vibroVisible) => {
    
    const grid = tempVisible ? { 
        subplots: ["xy", "xy3"],
        ygap: 0.3,
        rows: 2,
        columns: 1,
    } 
        : null
    
    return {
        font: {
            family: 'Roboto Condensed',
            size: 12,
            color: 'black'
        },
        // title : 'Some test plot',
        titlefont: { size: 14 },
        autosize: true,
        margin: { // around the whole chart
            l: 10,
            r: 10,
            t: 10,
            b: 10,
            pad: 0,
            autoexpand: true
        },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white',
        showlegend: false,
        hovermode: 'closest', // check
        hoverdistance: 10, // distance to point]
        grid: grid
    }
}

export const xLayout = (limits) => {
    return {
        xaxis: {
            visible: true,
            color: 'black',
            type: "date",
            rangemode: 'nonnegative',
            fixedrange: true,
            range:limits.map(ts => format(ts)),
            tickmode: 'auto',
            nticks: 0,
            tick0: 1,
            ticklen: 4, // px
            tickwidth: 1, //px
            tickcolor: 'black',
            showticklabels: true,
            automargin: true, // enlarge margin from labels
            showspikes: true,
            showline: true,
            spikethickness: 1,
            spikedash: 'dash',
            spikemode: 'toaxis', // many options
            spikesnap: 'cursor',
            showgrid: true,
            gridcolor: 'lightgray',
            gridwidth: 1, //px
            zeroline: false,
            layer: 'below traces',
            position: 0
        }
    }
}

export const scatterData = (x,y, prop, name, yThreshold, rThreshold) => {
    let yaxis, fill, fillcolor;
    const nowY =  y[y.length-1]
    
    if ( ['F', 'dF'].includes(prop) ) {
        yaxis = 'y'
    } else if ( prop === 'I') {
        yaxis = 'y'
        fill = 'tonexty';
        // FIXME: message should trigger this
        if ( nowY < yThreshold) { 
            fillcolor = setOpacity(PERMITTEDCOLOR, 0.2)
        } else if (nowY >= yThreshold && nowY < rThreshold){
            fillcolor = setOpacity(PERMITTEDCOLOR, 0.2)
        } else if (nowY >= rThreshold) {
            fillcolor = setOpacity(PERMITTEDCOLOR, 0.2)
        }
    } else if ( prop === 'Frms') {
        yaxis = 'y2';
    } else if (prop === 'Tamb') {
        yaxis = 'y3'
    } else {
        console.log('Unknown prop');
    }
    
    return {
        type: "scatter",
        mode: "lines",
        showlegend: false,
        line: {
            color: 'slategray',
            // width
            shape:"spline",
            smoothing:0.5,  //0 - 1.3
            dash: "solid", // "solid", "dot", "dash", "longdash", "dashdot", or "longdashdot"
            simplify: true // Simplifies lines by removing nearly-collinear points. When transitioning lines, it may be desirable to disable this so that the number of points along the resulting SVG path is unaffected. 
        },
        fill: fill? fill : 'none',
        fillcolor: fillcolor,
        name: name,
        // format timestamps
        x: x,
        y: y,
        connectgaps: true,
        xcalendar: "gregorian",
        yaxis: yaxis
    }
}

// axisNo either 'yaxis' or 'yaxis2'
export const yLayout = (prop, isTempVisible) => {

    let axisNo, domain, title, rangemode, range, zeroline;

    if (prop === "F") {
        
        title = "Тяжение, даН";
        axisNo = 'yaxis';
        domain = isTempVisible ? [0.25, 1] : [0, 1];
        rangemode = "normal";

    } else if (prop === 'dF') {
        
        axisNo = 'yaxis';
        domain = isTempVisible ? [0.25, 1] : [0, 1];
        rangemode = "normal";

    } else if (prop === 'Tamb') {
        
        title = "Т воздуха, С";
        axisNo = 'yaxis3'; 
        zeroline = true;
        domain = [0, 0.15];
        rangemode = "normal";

    } else if (prop === 'Frms') {
        
        title = "Вибрация";
        axisNo = 'yaxis2';
        domain = isTempVisible ? [0.25, 1] : [0, 1];
        rangemode = "normal";

    } else if (prop === 'I') {
        
        title = "Стенка гололеда, мм";
        axisNo = 'yaxis';
        domain = isTempVisible ? [0.25, 1] : [0, 1];
        rangemode = "tozero";

    }
    
    return {
        [axisNo]: {
            title: title,
            domain: domain,
            rangemode: rangemode,
            zeroline: zeroline ? zeroline : null,
            range: range ? range : null,
            visible: true,
            color: 'black',
            type: "linear", 
            autorange: true, // can be reversed 
            fixedrange: true,
            tickmode: 'auto', // can be array => ticks only on particualar values
            nticks: 0, // unllimited ticks
            tick0: 1, // first tick
            ticklen: 4, // px
            tickwidth: 1, //px
            tickcolor: 'black',
            showticklabels: true,
            automargin: true, // enlarge margin from labels
            showspikes: true, // only for hovermode: closest
            spikethickness: 1,
            spikedash: 'dash',
            spikemode: 'toaxis', // many options
            spikesnap: 'cursor', // cursor / data
            showgrid: true,
            gridcolor: 'lightgray',
            gridwidth: 1, //px,
            layer: 'below traces',
            position: 0
        }
    }


}

export const tensionLimits = (minCurve, maxCurve) => {


    const topCurve = `M ${toXYPairs(maxCurve).map(v => v.join(',')).join(' L ')}`;
    const bottomCurve = `${toXYPairs(minCurve).reverse().map(v => v.join(',')).join(' L ')}`;

    const path = `${topCurve} L ${bottomCurve} Z`
    return {
        type: "path",
        layer: "above",
        xref: "x",
        yref: "y",
        path: path,
        fillcolor: "rgb(61, 255, 130)",
        fill: 'tonexty',
        opacity: 0.25,
        line: {
            width: 0
        }
    }
}

// return an array of objects to be infused inside the shapes object in layout
export const iceThresholdShape = (thresholdValue, color) => {
    return {
        visible: true,
        type: 'line',
        xref: 'paper',
        x0: 0,
        y0: thresholdValue,
        x1: 1,
        y1: thresholdValue,
        line: {
            width: 2,
            dash: 'dot',
            color: color
        }
    }
}

// draw a line connecting [xlast, y last] and [x - 1hr, y @ x- 1hr]
export const iceSpeedShape = (xyarr, hrs=1) => {
    let [ts,I] = xyarr;
    let lastIx = ts.length -1;

    const tsAgo = moment(ts[lastIx]).subtract(hrs, 'h').unix();
    const Iago = linear(tsAgo, ts.map(ts => moment(ts).unix()), I).join('');
    

    return {
        type: "line",
        layer: "above",
        x0: format(tsAgo),
        y0: Iago,
        x1: ts[lastIx],
        y1: I[lastIx],
        xref: "x",
        yref: "y",
        line: {
            width: 2,
            color: 'slategray'
        }
    }
}

// Apply filters to scoepd ranges and etities to output an array of wire IDs to handle
export const defineScopeWires = (scope, entities, schema) => {
    return flatten(scope.map(rangeID => {return schema.ranges[rangeID].obj})).filter(id => (entities.includes(schema.obj[id].Type)))
}

// calculate actual ts ranges to display
export const calculateTimestampsRange = (latestFresh, timeRangeMode) => {
    return [moment.unix(latestFresh).subtract(parseInt(timeRangeMode, 10), 'h').unix(), latestFresh]
}

// receive rbga(x,x,x,o) string and return the same with different opacity
const setOpacity = (rgba, newOpacity) => {
    const arr = rgba.split(',');
    arr[3] = `${newOpacity})`
    return arr.join(',')
}
