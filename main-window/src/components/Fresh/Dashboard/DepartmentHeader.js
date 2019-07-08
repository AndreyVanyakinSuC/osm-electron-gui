import React from 'react';
import Ribbon from '../../Ribbon';
import Arrow from './Arrow';
import MapIcon from './MapIcon';

const departmentHeader = ({
  depName,
  depID,
  ribbonData,
  isExpanded,
  focusChart,
  linesCount,
  mapFocus
}) => {
  let lineString;

  if (linesCount === 1) {
    lineString = 'линия';
  } else if (linesCount > 1 && linesCount <= 4) {
    lineString = 'лниии';
  } else if (linesCount > 4) {
    lineString = 'линий';
  }

  // Don't show ribbon when expanded, even if dangerous
  let ribbonMarkup;
  const { value, msgCode, wireId } = ribbonData;

  if (isExpanded) {
    ribbonMarkup = null;
  } else {
    ribbonMarkup = <Ribbon value={value} msgCode={msgCode} />;
  }

  return (
    <div className={'dep_header'}>
      <span>
        <Arrow isExpanded={isExpanded} />
        <span>{depName}</span>
      </span>

      <span>
        <span
          className="ribbon_container"
          title={`График максимального гололёда ${depName}`}
          onClick={focusChart.bind(null, 'I', wireId)}
          role="button"
        >
          {ribbonMarkup}
        </span>

        <MapIcon mapFocus={mapFocus} entityType={'dep'} entityID={depID} />

        {linesCount}

        <span className={'unit'}>{lineString}</span>
      </span>
    </div>
  );
};

export default departmentHeader;
