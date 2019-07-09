import React from 'react';
import _ from 'lodash';
import { MSGS } from './base';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faArrowLeft,
  faCaretLeft,
  faCaretRight,
  faEye,
  faExclamationCircle,
  faSnowflake,
  faQuestion,
  faExclamation,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';

// From [[msgs], [msgs] ... [msgs]] of non unique message codes pick up the worst one
// no message === null
export const pickWorstMessage = messagesArrs => {
  const uniqueMsgs = _.uniq(_.flatten(messagesArrs));

  // No messages at all
  const isNoMessages = uniqueMsgs.length === 1 && uniqueMsgs.join('') === null;
  if (isNoMessages) {
    return null;
  } else {
    // at least one non-null message and sort by priroty
    const nonNull = _.sortBy(
      uniqueMsgs.filter(v => v !== null),
      v => MSGS.get(v).priority
    );
    return _.last(nonNull);
  }
};

// IN fresh or Subset
// OUT {value, msgCode} for Ribbon
export const worstCaseRibbon = fresh => {
  const worstMsg = pickWorstMessage(_.map(fresh, f => f.msg));
  const maxIce = _.max(_.map(fresh, f => f.I));

  if (worstMsg === null) {
    return { value: null, msgCode: null };
  } else {
    return { value: maxIce, msgCode: worstMsg };
  }
};
