import React from 'react';
import Button from './Controls/Button';

const Fallback = ({
  mode,
  isConnected,
  isConnecting,
  onConnectClick,
  onHistoryModeClick,
  isSchemaAvailable
}) => {
  let fallbackMessage;

  switch (mode) {
    case 'fresh': {
      fallbackMessage = (
        <div className="fallback_message">
          <div className="fallback_main_text">
            Для получения актуальных показаний необходимо установить соединение
            с сервером. <br></br>
            Ранее накопленные показания (история) доступны без подключения.
          </div>

          <div className="fallback_btn_block">
            <Button
              isActive={false}
              isIcon={false}
              label="Соединиться"
              clicked={onConnectClick}
            />

            <Button
              isActive={false}
              isIcon={false}
              label="К истории"
              clicked={onHistoryModeClick}
            />
          </div>
        </div>
      );

      break;
    }

    case 'history': {
      fallbackMessage = (
        <div className="fallback_message">
          <div className="fallback_main_text">
            Отображение ранее накопленных показаний невозможно в виду отсутствия
            файла описания сети мониторинга <br></br>
            Требуется осуществить подключение к серверу.
          </div>
          <div className="fallback_btn_block">
            <Button
              isActive={false}
              isIcon={false}
              label="Соединиться"
              clicked={onConnectClick}
            />
          </div>
        </div>
      );

      break;
    }
  }

  const render = isConnecting ? (
    <div className="overlay"> {fallbackMessage} </div>
  ) : (
    fallbackMessage
  );

  return <div className="fallback">{render}</div>;
};

export default Fallback;
