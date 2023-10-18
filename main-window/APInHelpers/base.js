export const DEFAULT_HISTORY_HRS = 24;
export const HISTORY_SPAN_SECS = 60;

import default_1 from '../assets/default/default.jpg';
import default_2 from '../assets/default/default.jpg';
import default_3 from '../assets/default/default.jpg';
import default_4 from '../assets/default/default.jpg';

// УП
import twr585_1 from '../assets/585/585_1.png';
import twr585_2 from '../assets/585/585_2.png';
import twr585_3 from '../assets/585/585_3.png';
import twr585_4 from '../assets/585/585_4.png';

import twr650_1 from '../assets/650/650_1.png';
import twr650_2 from '../assets/650/650_2.png';
import twr650_3 from '../assets/650/650_3.png';
import twr650_4 from '../assets/650/650_4.png';

// Газовая
// 48
import twr48_1 from '../assets/9151/48_1.png';
import twr48_2 from '../assets/9151/48_2.png';
import twr48_3 from '../assets/9151/48_3.png';
import twr48_4 from '../assets/9151/48_4.png';
// 91
import twr91_1 from '../assets/9155/91_1.png';
import twr91_2 from '../assets/9155/91_2.png';
import twr91_3 from '../assets/9155/91_3.png';
import twr91_4 from '../assets/9155/91_4.png';
// 133
import twr133_1 from '../assets/9163/133_1.png';
import twr133_2 from '../assets/9163/133_2.png';
import twr133_3 from '../assets/9163/133_3.png';
import twr133_4 from '../assets/9163/133_4.png';
// 179
import twr179_1 from '../assets/9170/179_1.png';
import twr179_2 from '../assets/9170/179_2.png';
import twr179_3 from '../assets/9170/179_3.png';
import twr179_4 from '../assets/9170/179_4.png';
// 209
import twr209_1 from '../assets/9173/209_1.png';
import twr209_2 from '../assets/9173/209_2.png';
import twr209_3 from '../assets/9173/209_3.png';
import twr209_4 from '../assets/9173/209_4.png';
// Нижняя Волга
import twr352_1 from '../assets/9185_352/352_1.jpg';
import twr352_2 from '../assets/9185_352/352_2.jpg';
import twr352_3 from '../assets/9185_352/352_3.jpg';
import twr352_4 from '../assets/9185_352/352_4.jpg';

import twr492_1 from '../assets/9326_492/492_1.jpg';
import twr492_2 from '../assets/9326_492/492_2.jpg';
import twr492_3 from '../assets/9326_492/492_3.jpg';
import twr492_4 from '../assets/9326_492/492_4.jpg';

import twr599_1 from '../assets/9433_599/599_1.jpg';
import twr599_2 from '../assets/9433_599/599_2.jpg';
import twr599_3 from '../assets/9433_599/599_3.jpg';
import twr599_4 from '../assets/9433_599/599_4.jpg';

import twr693_1 from '../assets/9527_693/693_1.jpg';
import twr693_2 from '../assets/9527_693/693_2.jpg';
import twr693_3 from '../assets/9527_693/693_3.jpg';
import twr693_4 from '../assets/9527_693/693_4.jpg';

import twr43_1 from '../assets/9638_43/43_1.jpg';
import twr43_2 from '../assets/9638_43/43_2.jpg';
import twr43_3 from '../assets/9638_43/43_3.jpg';
import twr43_4 from '../assets/9638_43/43_4.jpg';

import twr207_1 from '../assets/9802_207/207_1.jpg';
import twr207_2 from '../assets/9802_207/207_2.jpg';
import twr207_3 from '../assets/9802_207/207_3.jpg';
import twr207_4 from '../assets/9802_207/207_4.jpg';

import twr334_1 from '../assets/9950_334/334_1.jpg';
import twr334_2 from '../assets/9950_334/334_2.jpg';
import twr334_3 from '../assets/9950_334/334_3.jpg';
import twr334_4 from '../assets/9950_334/334_4.jpg';

import twr482_1 from '../assets/10098_482/482_1.jpg';
import twr482_2 from '../assets/10098_482/482_2.jpg';
import twr482_3 from '../assets/10098_482/482_3.jpg';
import twr482_4 from '../assets/10098_482/482_4.jpg';

export const IMAGE_PATHS = new Map([
  ['default', [default_1, default_2, default_3, default_4]],
  [585, [twr585_1, twr585_2, twr585_3, twr585_4]],
  [650, [twr650_1, twr650_2, twr650_3, twr650_4]],
  [9151, [twr48_1, twr48_2, twr48_3, twr48_4]],
  [9155, [twr91_1, twr91_2, twr91_3, twr91_4]],
  [9163, [twr133_1, twr133_2, twr133_3, twr133_4]],
  [9170, [twr179_1, twr179_2, twr179_3, twr179_4]],
  [9173, [twr209_1, twr209_2, twr209_3, twr209_4]],
  [9185, [twr352_1, twr352_2, twr352_3, twr352_4]],
  [9326, [twr492_1, twr492_2, twr492_3, twr492_4]],
  [9433, [twr599_1, twr599_2, twr599_3, twr599_4]],
  [9527, [twr693_1, twr693_2, twr693_3, twr693_4]],
  [9638, [twr43_1, twr43_2, twr43_3, twr43_4]],
  [9802, [twr207_1, twr207_2, twr207_3, twr207_4]],
  [9950, [twr334_1, twr334_2, twr334_3, twr334_4]],
  [10098, [twr482_1, twr482_2, twr482_3, twr482_4]]
]);

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
  msg: ['000'],
  ITrend: new Array(10).fill(0),
  FTrend: new Array(10).fill(0),
  FmnTrend: new Array(10).fill(0),
  FmxTrend: new Array(10).fill(0),
  FrmsTrend: new Array(10).fill(0)
});

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
  ['F', 'кгс'],
  ['dF', 'кгс'],
  // ['I', 'мм'],
  ['I', 'кг/ 200м'],
  ['T', '\u00B0C'],
  ['Tamb', '\u00B0C'],
  ['L', 'км']
]);

export const PROP_STRINGS = new Map([
  ['F', 'Тяжение'],
  ['dF', '\u0394 Тяжения'],
  ['Tamb', 'T воздуха'],
  // ['I', 'Стенка'],
  ['I', 'Гололёд']
]);

export const MSGS = new Map([
  [
    '000',
    {
      priority: 0,
      class: '',
      threshold: 0,
      to: 1,
      color: ''
    }
  ],
  [
    '011',
    {
      priority: 1,
      class: 'light-ice',
      threshold: 1,
      to: 5,
      color: 'rgb(28, 200, 163);'
    }
  ], //  1mm =< ice < 10mm
  [
    '012',
    {
      priority: 2,
      class: 'warning-ice',
      threshold: 10,
      to: 10,
      color: '#ff8534'
    }
  ], //  5mm =< ice < 20mm
  [
    '013',
    {
      priority: 3,
      class: 'alarm-ice',
      threshold: 20,
      to: 20,
      color: '#ff3333'
    }
  ], //  10mm =< ice < 30mm
  [
    '014',
    {
      priority: 4,
      class: 'critical-ice',
      threshold: 30,
      to: 100,
      color: 'rgb(114, 19, 19);'
    }
  ] //  30mm =< ice
]);

export const CABLE_DIAMETER_MM = {
  ACO300: 24,
  OPGW: 11.5
};

export const SENSOR_DIAMETER_MM = {
  1: CABLE_DIAMETER_MM.ACO300,
  2: CABLE_DIAMETER_MM.ACO300,
  3: CABLE_DIAMETER_MM.OPGW,
  4: CABLE_DIAMETER_MM.OPGW,
  5: CABLE_DIAMETER_MM.ACO300,
  6: CABLE_DIAMETER_MM.ACO300,
  7: CABLE_DIAMETER_MM.OPGW,
  8: CABLE_DIAMETER_MM.OPGW
};
