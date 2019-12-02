export const TREND_HRS = 8;
export const TREND_PTS = 40;
export const DEFAULT_HISTORY_HRS = 24;
export const HISTORY_SPAN_SECS = 60;

import default_1 from "../assets/default/twr1.png";
import default_2 from "../assets/default/twr2.png";
import default_3 from "../assets/default/twr3.png";
import default_4 from "../assets/default/twr4.png";
// 48
import twr48_1 from "../assets/9151/48_1.png";
import twr48_2 from "../assets/9151/48_2.png";
import twr48_3 from "../assets/9151/48_3.png";
import twr48_4 from "../assets/9151/48_4.png";
// 91
import twr91_1 from "../assets/9155/91_1.png";
import twr91_2 from "../assets/9155/91_2.png";
import twr91_3 from "../assets/9155/91_3.png";
import twr91_4 from "../assets/9155/91_4.png";
// 133
import twr133_1 from "../assets/9163/133_1.png";
import twr133_2 from "../assets/9163/133_2.png";
import twr133_3 from "../assets/9163/133_3.png";
import twr133_4 from "../assets/9163/133_4.png";
// 179
import twr179_1 from "../assets/9170/179_1.png";
import twr179_2 from "../assets/9170/179_2.png";
import twr179_3 from "../assets/9170/179_3.png";
import twr179_4 from "../assets/9170/179_4.png";
// 209
import twr209_1 from "../assets/9173/209_1.png";
import twr209_2 from "../assets/9173/209_2.png";
import twr209_3 from "../assets/9173/209_3.png";
import twr209_4 from "../assets/9173/209_4.png";

export const IMAGE_PATHS = new Map([
  ["default",[default_1, default_2, default_3, default_4]],
  [9151,[twr48_1,twr48_2,twr48_3,twr48_4]],
  [9155,[twr91_1,twr91_2,twr91_3,twr91_4]],
  [9163,[twr133_1,twr133_2,twr133_3,twr133_4]],
  [9170,[twr179_1,twr179_2,twr179_3,twr179_4]],
  [9173,[twr209_1,twr209_2,twr209_3,twr209_4]],
])


export const SCHEMA_1ST_LEVEL_NAMES = [
  'deps',
  'lines',
  'ranges',
  'towers',
  'obj'
];

export const FRESH_DUMMY = (objID, ts) => ({
  ts: ts,
  obj: objID,
  F: 0,
  Fmn: 0,
  Fmx: 0,
  Frms: 0,
  I: 0,
  VI: 0,
  Tamb: 0,
  msg: [],
  ITrend:(new Array(10)).fill(0),
  FTrend:(new Array(10)).fill(0), 
  FmnTrend:(new Array(10)).fill(0),
  FmxTrend:(new Array(10)).fill(0),
  FrmsTrend: (new Array(10)).fill(0)
})

export const DATA_PROP_NAMES = [
  'ts',
  'obj',
  'F',
  'Fmn',
  'Fmx',
  'Frms',
  'I',
  'VI',
  'Tamb',
  'msg'
];

export const ENTITY_NAMES = new Map([
  ['1_phaseA', 'фаза А'],
  ['2_phaseB', 'фаза B'],
  ['3_phaseC', 'фаза C'],
  ['4_OPGW', 'ОКГТ'],
  ['ОКГТ', 'ОКГТ']
]);

export const UNITS = new Map([
  ['F', 'Н'],
  ['dF', 'Н'],
  ['I', 'мм'],
  ['T', '\u00B0C'],
  ['Tamb', '\u00B0C'],
  ['L', 'км']
]);

export const PROP_STRINGS = new Map([
  ['F', 'Тяжение'],
  ['dF', '\u0394 Тяжения'],
  ['Tamb', 'T воздуха'],
  ['I', 'Стенка']
]);

export const MSGS = new Map([
  [
    '011',
    {
      priority: 1,
      class: 'light-ice',
      threshold: 1,
      to: 5,
      color: 'rgb(28, 200, 163);'
    }
  ], //  1mm =< ice < 5mm
  [
    '012',
    {
      priority: 2,
      class: 'warning-ice',
      threshold: 5,
      to: 10,
      color: '#ff8534'
    }
  ], //  5mm =< ice < 10mm
  [
    '013',
    {
      priority: 3,
      class: 'alarm-ice',
      threshold: 10,
      to:20,
      color: '#ff3333'
    }
  ], //  10mm =< ice < 20mm
  [
    '014',
    {
      priority: 4,
      class: 'critical-ice',
      threshold: 20,
      to:100,
      color: 'rgb(114, 19, 19);'
    }
  ] //  20mm =< ice
]);

// MAP
export const TILE_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
