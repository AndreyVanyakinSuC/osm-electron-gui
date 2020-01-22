import React from 'react';
import TextForm from './TextForm';

const TileSourceBlock = ({
  primary,
  description,
  url,
  inputChanged,
  defaultClicked
}) => {
  const id = primary ? 'primary' : 'secondary';
  return (
    <div className="map-inputs">
      <div>Описание</div>
      <TextForm
        name="description"
        value={description}
        changed={inputChanged}
        title="Введенное описание будет отображаться в интерфейсе"
        id={id}
      />
      <div>Адрес</div>
      <TextForm
        name="url"
        value={url}
        changed={inputChanged}
        title="Введите URL сайта тайлов"
        id={id}
      />
      <button
        id={id}
        className="btn"
        onClick={defaultClicked}
        title="Нажатие восстановит значения по умолчанию"
      >
        По умолчанию
      </button>
    </div>
  );
};

export default TileSourceBlock;
