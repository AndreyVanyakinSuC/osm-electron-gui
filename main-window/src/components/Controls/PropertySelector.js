import React from 'react';
import Dropdown from 'react-dropdown';

// [{ value: '1', label: 'linesname1'},
// { value: '2', label: 'linesname2'}]

const PropertySelector = ({ value, changed }) => {
  return (
    <Dropdown
      value={value}
      options={[
        { value: 'F', label: 'Тяжение' },
        { value: 'dF', label: 'Прирост тяжения' },
        { value: 'I', label: 'Гололёд' }
      ]}
      onChange={changed}
      // placeholder='Выберите режим'
    />
  );
};

export default PropertySelector;
