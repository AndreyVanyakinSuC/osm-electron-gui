import React from 'react';
import TextForm from './TextForm';

const TileSourceBlock = ({ primary, description, url, inputChanged }) => {
  const id = primary ? 'primaryMap' : 'secondaryMap';
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
    </div>
  );
};

export default TileSourceBlock;
