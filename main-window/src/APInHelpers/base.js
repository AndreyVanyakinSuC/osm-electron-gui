export const TREND_HRS = 8;
export const TREND_PTS = 40;
export const DEFAULT_HISTORY_HRS = 8;
export const HISTORY_SPAN_SECS = 600;

export const SCHEMA_1ST_LEVEL_NAMES = ["deps", "lines", "ranges", "towers", "obj"];
export const DATA_PROP_NAMES = ["ts", "obj", "F", "Fmn", "Fmx", "Frms", "I", "VI","Tamb", "msg"];

export const ENTITY_NAMES = new Map ([
    ['1_phaseA', 'фаза А'],
    ['2_phaseA', 'фаза B'],
    ['3_phaseA', 'фаза C'],
    ['4_OPGW', 'ОКГТ'],
]);

export const UNITS = new Map ([
    ['F', 'даН'],
    ['dF', 'даН'],
    ['I', 'мм'],
    ['T','\u00B0C'],
    ['Tamb','\u00B0C'],
    ['L', 'км'],
]);

export const PROP_STRINGS = new Map([
    ['F', 'Тяжение'],
    ['dF', '\u0394 Тяжения'],
    ['Tamb', 'T воздуха'],
    ['I', 'Стенка'],
])


export const MSGS = new Map ([
    ['011', {
        priority: 1,
        class: 'light-ice', 
        threshold: 1,
        color: 'rgb(28, 200, 163);'
    }], //  1mm =< ice < 5mm
    ['012', {
        priority: 2,
        class: 'warning-ice', 
        threshold: 5,
        color: '#ff8534'
    }], //  5mm =< ice < 10mm
    ['013', {
        priority: 3,
        class: 'alarm-ice', 
        threshold: 10,
        color: '#ff3333'
    }], //  10mm =< ice < 20mm
    ['014', {
        priority: 4,
        class: 'critical-ice', 
        threshold: 20,
        color:'rgb(114, 19, 19);'
    }], //  20mm =< ice
])

// MAP
export const TILE_URL = "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
