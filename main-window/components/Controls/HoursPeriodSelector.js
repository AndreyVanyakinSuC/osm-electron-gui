import React from 'react';
import RadioGroup from './RadioGroup';

const HoursPeriodSelector = props => {
  const { rangeHours, onRangeHoursChange } = props;

  return (
    <div className="selector-card">
      <div className="selector-header">За период..</div>
      <div className="selector-body">
        <RadioGroup
          currentValue={rangeHours}
          valueChanged={onRangeHoursChange}
          isIcon={true}
          options={[
            { value: 1, label: '1 ч' },
            { value: 4, label: '4 ч' },
            { value: 8, label: '8 ч' }
          ]}
        />
      </div>
    </div>
  );
};

export default HoursPeriodSelector;
