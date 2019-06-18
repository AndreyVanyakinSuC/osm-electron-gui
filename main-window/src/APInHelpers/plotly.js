import { downsample, unixMiliSecs, date_UTS, ts_UnderscoredString, tsmili__UnderscoredString} from './timeseries'
import _ from 'lodash';
import {ENTITY_NAMES, UNITS, MSGS} from './base';

export const CONFIG = {
    fresh: {
        scrollZoom: false,
        editable: false,
        staticPlot: false,
        toImageButtonOptions: {
            format: 'png', // one of png, svg, jpeg, webp
            filename: 'график_ОСМ_ВЛ',
            height: 500,
            width: 700,
            scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
        },
        displayModeBar: true,
        showLink: false,
        showSendToCloud: false,
        locale: 'ru',
        displaylogo: false,
        modeBarButtonsToRemove: ['sendDataToCloud','hoverClosestCartesian','hoverCompareCartesian',], //['toImage']
        responsive: true
    },
    history: {
        scrollZoom: false,
        editable: false,
        staticPlot: false,
        toImageButtonOptions: {
            format: 'png', // one of png, svg, jpeg, webp
            filename: 'график_ОСМ_ВЛ',
            height: 500,
            width: 700,
            scale: 1 // Multiply title/legend/axis/canvas sizes by this factor
        },
        displayModeBar: true,
        showLink: false,
        showSendToCloud: false,
        locale: 'ru',
        displaylogo: false,
        modeBarButtonsToRemove: ['zoom2d', 'pan2d', 'select2d','sendDataToCloud','lasso2d', 'zoomOut2d', 'zoomIn2d'], //['toImage']
        responsive: true
    },
}

// button names https://github.com/plotly/plotly.js/blob/master/src/components/modebar/buttons.js

export const SETTINGS = {
    fresh: {
        DIVID: 'chartId',
        CLASS_NAME: 'current_chart',
        PTS_COUNT:300
    },
    history: {
        DIVID: 'historyId',
        CLASS_NAME: 'history_class',
        PTS_COUNT: 600
    }
}

//
// DATA TRACES
//

// traces
const trace = (xyArr, name, propMode, yaxis) => {
    const [x,y] = XYpairstoXYarrs(xyArr);
    const fill = (propMode === 'I') ? 'tonexty' : 'none' 

    return {
        type: "scatter",
        mode: "lines",
        propMode: propMode,
        // customdata: msgArr,
        showlegend: false,
        line: {
            color: 'slategray',
            // width
            shape:"spline",
            smoothing:0,  //0 - 1.3
            dash: "solid", // "solid", "dot", "dash", "longdash", "dashdot", or "longdashdot"
            simplify: true // Simplifies lines by removing nearly-collinear points. When transitioning lines, it may be desirable to disable this so that the number of points along the resulting SVG path is unaffected. 
        },
        fill: fill,
        // fillcolor: fillcolor,
        name: name,
        text: UNITS.get(propMode),
        // format timestamps
        x: unixMiliSecs(x),
        y: y,
        connectgaps: true,
        xcalendar: "gregorian",
        yaxis: yaxis,
        hoverinfo: "y+text+x"//Any combination of "x", "y", "z", "text", "name" joined with a "+" OR "all" or "none" or "skip". examples: "x", "y", "x+y", "x+y+z", "all" default: "all" Determines which trace information appear on hover. If `none` or `skip` are set, no information is displayed upon hovering. But, if `none` is set, click and hover events are still fired.
    }
}

export const mainTraces = (dataArr, props) => {
    const {objData, propMode, scopedWires, mode} = props;
    const PTS_COUNT = SETTINGS[mode].PTS_COUNT;

    return scopedWires.map(w => {
        if (propMode === 'F') {

            const Fxy = pullXYpairs(dataArr, w, 'F', PTS_COUNT); // [[ts, F], [ts, F]]
            const name = ENTITY_NAMES.get(objData[w].Type); // A, B, C
            return trace(Fxy, name, propMode, 'y')
    
        } else if (propMode === 'dF') {
        
            const dFxy = deltaY(pullXYpairs(dataArr, w, 'F', PTS_COUNT)); // [[ts, F], [ts, F]]
            const name = ENTITY_NAMES.get(objData[w].Type); // A, B, C
            return trace(dFxy, name, propMode, 'y')

        } else if (propMode === 'I') {

            const Fxy = pullXYpairs(dataArr, w, 'I', PTS_COUNT); // [[ts, F], [ts, F]]
            const name = ENTITY_NAMES.get(objData[w].Type); // A, B, C
            return trace(Fxy, name, propMode, 'y')

        }
    })


}

export const tempTraces = (dataArr, props) => {
    const {scopedWires,mode} = props;
    const PTS_COUNT = SETTINGS[mode].PTS_COUNT;

    const allTempXY = scopedWires.map(w => pullXYpairs(dataArr, w, 'Tamb', PTS_COUNT)) // [[ts, F], [ts, F]]
    return trace(averageXYpairs(allTempXY), null,'T','y3');

}

//
// END OFDATA TRACES
//



//
// AXIS LAYOUTS
//

export const generalLayout = (tempVisible, mode) => {
    
    const grid = tempVisible ? { 
        subplots: ["xy", "xy3"],
        ygap: 0.3,
        rows: 2,
        columns: 1,
    } 
        : null

    // To fit annotations in fresh mode
    const rightPad = (mode === 'fresh') ? 80 : 10;
    
    return {
        font: {
            family: 'Roboto Condensed',
            size: 14,
            color: 'black'
        },
        // title : 'Some test plot',
        titlefont: { size: 14 },
        autosize: true,
        margin: { // around the whole chart
            l: 10,
            r: rightPad,
            t: 10,
            b: 10,
            pad: 0,
            autoexpand: true
        },
        paper_bgcolor: 'white',
        plot_bgcolor: 'white',
        showlegend: false,
        hovermode: 'closest', // check
        hoverdistance: 3, // distance to point]
        grid: grid
    }
}


export const xLayout = (tsRange, mode) => {

    let fixedrange, rangeslider;

    if (mode === 'fresh') {
        fixedrange= true;
        rangeslider= null;
    } else if (mode === 'history') {
        fixedrange= false;
        rangeslider= null;
    }

    return {
        xaxis: {
            visible: true,
            color: 'black',
            type: "date",
            rangemode: 'nonnegative',
            fixedrange: fixedrange,
            rangeslider: rangeslider,
            range: unixMiliSecs(tsRange),
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

export const yLayout = (prop, isTempVisible, mode) => {

    let axisNo, domain, title, rangemode, range, zeroline, fixedrange;

    if (mode === 'fresh') {
        fixedrange= true;
    } else if (mode === 'history') {
        // FIXME:
        fixedrange= false;
    }

    domain = isTempVisible ? [0.25, 1] : [0, 1];

    if (prop === "F") {
        
        title = "Тяжение, даН";
        axisNo = 'yaxis';
        domain = isTempVisible ? [0.25, 1] : [0, 1];
        rangemode = "normal";

    } else if (prop === 'dF') {
        
        axisNo = 'yaxis';
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
        rangemode = "normal";

    } else if (prop === 'I') {
        
        title = "Стенка гололеда, мм";
        axisNo = 'yaxis';
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
            fixedrange: fixedrange,
            tickmode: 'auto', // can be array => ticks only on particualar values
            nticks: 0, // unllimited ticks
            mirror: 'all', //Determines if the axis lines or/and ticks are mirrored to the opposite side of the plotting area. If "true", the axis lines are mirrored. If "ticks", the axis lines and ticks are mirrored. If "false", mirroring is disable. If "all", axis lines are mirrored on all shared-axes subplots. If "allticks", axis lines and ticks are mirrored on all shared-axes subplots.
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



//
// END OF AXIS LAYOUTS
//


// 
// SHAPES
//

export const normalBandShapes = (dataArr, props, isNormalVisible) => {
    const { propMode, scopedWires, mode} = props;
    const PTS_COUNT = SETTINGS[mode].PTS_COUNT;

    return scopedWires.map(w => {

        if (isNormalVisible[w]) {
            if (propMode === 'F') {

                return Flimits(
                    pullXYpairs(dataArr, w, 'Fmn', PTS_COUNT),
                    pullXYpairs(dataArr, w, 'Fmx', PTS_COUNT)
                );
        
            } else if (propMode === 'dF') {
            
                return Flimits(
                    deltaY(pullXYpairs(dataArr, w, 'Fmn', PTS_COUNT)),
                    deltaY(pullXYpairs(dataArr, w, 'Fmx', PTS_COUNT))
                );
            }
        }

        
    })
}

// in [{msg: color}, {}]
export const iceLevelsShapes = () => {
    return [...MSGS.entries()].map(tc => {
        const {threshold, color} = tc[1];
        return  {
            type: "line",
            layer: "above",
            xref: "paper",
            yref: "y",
            x0: 0,
            x1: 1,
            y0: threshold,
            y1: threshold,
            line: {
                width: 2,
                color: color
            }
        }
    })
}

// FROZEN
export const currentValueShape = (tracesArr) => {
    return tracesArr.map(trace => {
        const {x,y} = trace;

        // No data on the plot
        if (x.length === 0 || y.length === 0) {
            return null;
        }

        const xCoord = _.last(x);
        const yCoord = _.last(y);

        return {
            type: "circle",
            layer: "above",
        }

    })
}


export const highlightDangerShapes = (traces) => {
    // console.log(traces);
    return traces.map(trace => {
        const {x, y} = trace;
        // x = miliseconds unix

        // Do not do anything in absence of data
        if (x.length > 2 && y.length > 2) {
            
            // console.log(x);

            // 1) copy trace to svg path with numeric x (unix miliseconds would work)
            const path = toPath(x.map((v, i) => [v, y[i]]));

            // 2) define a rectangle that includes the whole path
            const xMin = _.min(x);
            const yMin = _.min(y);
            
            const xMax = _.max(x);
            const yMax = _.max(y);

            // 3) 

            // 4) Trim

            // 5) Format x to plotly date
        


        }
        
    })
}
    

export const traceShapes = (traces) => {
    return traces.map(trace => {
        const {x, y} = trace;
        const XYPairs = x.map((v, i) => [v, y[i]]);

        const path = toPath(XYPairs);

        return {
            type: "path",
            layer: "above",
            xref: "x",
            yref: "y",
            path: path,
            opacity: 0.7,
            line: {
                width: 3,
                color: MSGS.get('014').color
            }
        }

    })
}



// 
// END OF SHAPES
//

//
// ANNOTATIONS
//

export const valueAnnotation = (tracesArr) => {
    return tracesArr.map(trace => {
        // console.log(trace);
        const {name, x, y, propMode} = trace;

        // No data on the plot
        if (x.length === 0 || y.length === 0) {
            return null;
        }

        const xData = _.last(x);
        const yData = _.round(_.last(y), 1);

        return {
            visible: true,
            showarrow: false,
            // text: `<span class='ribbon critical-ice'>${name} ${yData} ${UNITS.get(propMode)}</span>`,
            font: {
                size: 14,
                // color
            },
            //startstandoff: 2, //Sets a distance, in pixels, to move the start arrowhead away from the position it is pointing at, for example to point at the edge of a marker independent of zoom. Note that this shortens the arrow from the `ax` / `ay` vector, in contrast to `xshift` / `yshift` which moves everything by this amount.
            text: `<b>${name}</b><br>${yData} ${UNITS.get(propMode)}`,
            bgcolor: 'rgba(170,170,170,0.9)' , //default: "rgba(0,0,0,0)"  
            bordercolor: 'rgba(0,0,0,1)',//default: "rgba(0,0,0,0)" 
            borderpad: 2,
            borderwidth: 1,
            align: "left",
            valign: "middle",
            clicktoshow: "onoff", //Makes this annotation respond to clicks on the plot. If you click a data point that exactly matches the `x` and `y` values of this annotation, and it is hidden (visible: false), it will appear. In "onoff" mode, you must click the same point again to make it disappear, so if you click multiple points, you can show multiple annotations. In "onout" mode, a click anywhere else in the plot (on another data point or not) will hide this annotation. If you need to show/hide this annotation in response to different `x` or `y` values, you can set `xclick` and/or `yclick`. This is useful for example to label the side of a bar. To label markers though, `standoff` is preferred over `xclick` and `yclick`.
            // xref: 'paper',
            xref: 'x',
            yref: 'y',
            // xanchor: 'left',
            // yanchor: 'middle',
            
            x: xData,
            xshift: 30, //px
            yshift:0,
            y: yData
        }

    })
}

//
// END OF ANNOTATIONS
//




const TEST_LINE = [
    {
        type: "line",
        layer: "above",
        xref: "paper",
        yref: "y",
        x0: 0,
        x1: 1,
        y0: 1,
        y1: 1,
        // fillcolor: "rgb(61, 255, 130)",
        // fill: 'tonexty',
        // opacity: 0.25,
        line: {
            width: 2,
            color: "rgb(61, 255, 130)"
        }
    },
    {
        type: "line",
        layer: "above",
        xref: "paper",
        yref: "y",
        x0: 0,
        x1: 1,
        y0: 5,
        y1: 5,
        // fillcolor: "rgb(61, 255, 130)",
        // fill: 'tonexty',
        // opacity: 0.25,
        line: {
            width: 2,
            color: "rgb(61, 255, 130)"
        }
    }
]

const TEST_SHAPE = [{
    type: "rect",
    layer: "above",
    xref: "paper",
    yref: "paper",
    x0: 0.2,
    x1: 0.25,
    y0: 0,
    y1: 0.2,
    fillcolor: "rgb(61, 255, 130)",
    // fill: 'tonexty',
    opacity: 0.25,
    line: {
        width: 0
    }
}];



const annotation = {
    visible: true,
    text: 'Sume', //Sets the text associated with this annotation. Plotly uses a subset of HTML tags to do things like newline (<br>), bold (<b></b>), italics (<i></i>), hyperlinks (<a href='...'></a>). Tags <em>, <sup>, <sub> <span> are also supported.
    textangle: 0,
    opacity: 0.8,
    align: "right", //Sets the horizontal alignment of the `text` within the box. Has an effect only if `text` spans more two or more lines (i.e. `text` contains one or more <br> HTML tags) or if an explicit width is set to override the text width.
    valign: "middle", //Sets the vertical alignment of the `text` within the box. Has an effect only if an explicit height is set to override the text height.
    // bgcolor: 
    // bordercolor
    // borderpad
    // borderwidth
    showarrow: true,
    // arrowcolor
    // arrowhead Sets the end annotation arrow head style.integer between or equal to 0 and 
    axref: 'x',
    ayref: 'y',
    ax: 'x value absolute', //Sets the x component of the arrow tail about the arrow head. If `axref` is `pixel`, a positive (negative) component corresponds to an arrow pointing from right to left (left to right). If `axref` is an axis, this is an absolute value on that axis, like `x`, NOT a relative value.
    ay: 'y value absolute'

}



//
// HELPERS
//

// IN [  
//      [[ts, Tamb], [ts, Tamb]... [ts, Tamb]] , 
//      [[ts, Tamb], [ts, Tamb]... [ts, Tamb]]  
//   ]
// OUT [[ts... Tamb mean], [ts... Tamb mean], [ts... Tamb mean]]
export const averageXYpairs = (xyPairsArr) => {
    const allTss = _.flattenDeep(xyPairsArr.map(xyArr => xyArr.map(xy => xy[0])));
    const uniqTss = _.sortBy(_.uniq(allTss));
    // console.log('all tss',allTss.length,'uniq tss', uniqTss.length);
    const flat = _.flatten(xyPairsArr) // all [ts, Tamb] together
    // console.log(flat);
    const getMean = (ts) => (
        _.mean(flat.filter(xy => xy[0] === ts)
            .map(xy => xy[1])) // Tamb
    )
    // [ts, ts, ts, ts]
    return uniqTss.map(ts => [ts, getMean(ts)])
}

//  IN [[x,y], [x,y]] OUT [[x,x,x,x][y,y,y,y,y]]
const XYpairstoXYarrs = (xyPairs) => (
    [_.flatten(xyPairs.map(pair => [pair[0]])), _.flatten(xyPairs.map(pair => [pair[1]]))]
)

//  IN [[x,y], [x,y]] OUT [x,y=0], [x,y]]
export const deltaY = (xyPairs) => {
    const firstY = xyPairs[0][1];
    return xyPairs.map((xy) => {
        const [x,y] = xy;
        return [x, y-firstY]
    })
}

// IN dataArr,  OUT [[ts, Yprop],[ts, Yprop], ... ]
export const pullXYpairs = (dataArr, objID, propName, PTS_COUNT) => {
    const xyPairs = _.sortBy((dataArr
        .filter(d => d.obj === objID)
        .map(d => [d.ts, d[propName]])), d => d[0]) // sort by ts

    return downsample(xyPairs, PTS_COUNT);
}

const toPath = (XYPairs) => {
    const formatted = XYPairs.map(tsv => {
        const [ts, value] = tsv;
        return [tsmili__UnderscoredString(ts), value];
    });


    return `M ${formatted.map(v => v.join(',')).join(' L ')}`;


}

// const pickClusteredXY = (dataArr, objID, propName, PTS_COUNT) => {
//     const xyMsgArr = _.sortBy((dataArr
//         .filter(d => d.obj === objID)
//         .map(d => [d.ts, d[propName], d.msg])), d => d[0]); // sort by ts

//     let chunks = [];
//     let accumulator = [];
//     let i = 1;
    
//     while (i <=  xyMsgArr.length -1) {

//         const [ts, value, msg] = xyMsgArr[i];
        

//         while (_.isEqual(msg, xyMsgArr[i-1])) {
//             accumulator.push(xyMsgArr[i]);
//             i =+ 1;
//         }
        
//         chunks.push(accumulator)
//         accumulator = [];

        
//     }

    
// }

// IN Fmin and Fmax [[ts, F]\, [ts, F]] 
// OUT => path
export const Flimits = (minCurve, maxCurve) => {

    // pre format to plotly shape date format
    const _minCurve = minCurve.map(tsF => {
        const [ts, F] = tsF;
        return [ts_UnderscoredString(ts), F];
    })
    const _maxCurve = maxCurve.map(tsF => {
        const [ts, F] = tsF;
        return [ts_UnderscoredString(ts), F];
    })

    const topCurve = `M ${_maxCurve.map(v => v.join(',')).join(' L ')}`;
    const bottomCurve = `${_minCurve.reverse().map(v => v.join(',')).join(' L ')}`;

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

// IN plotly [data] , OUT [tsExtents]
export const dataExtents = (data) => {
    const tsArrs = _.map(data, d => d.x);
    // calc min and max for each tsArr
    const minMaxArrs = _.map(tsArrs, tsArr => [_.min(tsArr), _.max(tsArr)]);
    
    
    // take maximum of mins and minimum af maxs
    let allMins= [], allMaxs = [];
    minMaxArrs.forEach(mmArr => {
        allMins.push(mmArr[0]);
        allMaxs.push(mmArr[1])
    })

    return [date_UTS(_.max(allMins)), date_UTS(_.min(allMaxs))]
    // console.log(res);

}

export const wiresToState = (possibleWires) => {
    return _.fromPairs(possibleWires.map(id => [id, true]))
}

export const displayName_wireID = (displayName, objData) => {
    const [type, name] = [...ENTITY_NAMES.entries()]
    .find(entry => { 
        const [key, value] = entry;
        return value === displayName;
    })
    const [id, data] = _.find(_.toPairs(objData), kv => {
        const [id, data] = kv;
        return data.Type === type
    });

    return id;

}

