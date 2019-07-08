import _ from 'lodash';

export const purgeSpaces = string => _.replace(string, /\s+/g, '');
export const getIP = url => _.replace(_.split(url, ':')[1], '//', '');
export const getPort = url => _.last(_.split(url, ':'));
