import React from 'react';

const TextForm = ({ name, value, changed, title, id, placeholder }) => {
  return (
    <input
      type="text"
      id={id}
      name={name}
      value={value}
      onChange={changed}
      title={title}
      placeholder={placeholder}
    />
  );
};

export default TextForm;
