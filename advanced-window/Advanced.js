import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
import log from 'electron-log';
import _ from 'lodash';
import ConfirmationCheck from '../connect-window/controls/ConfirmationCheck';
import NumericInput from './UI/NumericInput';
import {
  ADVWINDOW_CLOSE,
  ADVWINDOW_RECEIVE,
  ADVWINDOW_SEND,
  ADVWINDOW_DEF_REQ
} from '../Electron/IPC';

log.variables.label = 'AdvW';

// Close window on ESC without setting up the settings
window.addEventListener('keydown', e => {
  if (e.keyCode == 27) {
    log.verbose('[UI] ESC pressed');
    ipcRenderer.send(ADVWINDOW_CLOSE);
  }
});

class Advanced extends Component {
  state = {};

  handleDefaultsClick() {
    log.silly('[IPC] Requesting defaults');
    ipcRenderer.send(ADVWINDOW_DEF_REQ);
  }
  handleSaveClick() {
    log.silly('[IPC] Sending advanced settings to main');
    ipcRenderer.send(ADVWINDOW_SEND, this.state);
    ipcRenderer.send(ADVWINDOW_CLOSE);
  }

  handleNumericInput(event) {
    const { id, value } = event.target;
    this.setState(() => ({ [id]: _.toNumber(value) }));
  }

  handleCheckBoxClick(event) {
    const { id } = event.currentTarget;
    // Toggle
    this.setState(prevState => ({ [id]: !prevState[id] }));
  }

  componentDidMount() {
    log.silly('CDM');
    ipcRenderer.on(ADVWINDOW_RECEIVE, (e, args) => {
      log.info('[IPC] Received _ADVWINDOW_RECEIVE_');
      console.log(args);
      this.setState(() => {
        return args;
      });
    });
  }

  componentWillUnmount() {
    log.silly('CDUnmount');
    ipcRenderer.removeAllListeners(ADVWINDOW_RECEIVE);
  }

  render() {
    return (
      <div className="settings-window">
        {/* Fresh settings */}
        <div className="full-block">
          <div className="block-header">Свежие показания</div>
          <ConfirmationCheck
            isActive={this.state.isAddMsgToFresh}
            changed={this.handleCheckBoxClick.bind(this)}
            id="isAddMsgToFresh"
            label="Ранжировать входящие сообщения по уровням опасности гололёда"
            title="Если сервер не передаёт корректные значения в поле MSGS фрешей, то отключение приведет к отключению цветовой сигнализации в dashboard"
          />
          <NumericInput
            value={this.state.freshMaxPtsCount}
            changed={this.handleNumericInput.bind(this)}
            id="freshMaxPtsCount"
            label="Максимальное количество точек графика свежих показаний"
            title="Используется алгоритмом даунсемплинга"
          />
          <NumericInput
            value={this.state.sseTimeoutSecs}
            changed={this.handleNumericInput.bind(this)}
            id="sseTimeoutSecs"
            label="Таймаут переподключения к Серверу ОСМ при тишине по SSE (секунды)"
            title="В пределах данного времени интерфейс не будет пытаться переподключиться к Серверу ОСМ"
          />
        </div>
        {/* Trends settings */}
        <div className="full-block">
          <div className="block-header">Микрографики трендов</div>
          <NumericInput
            value={this.state.trendHrs}
            changed={this.handleNumericInput.bind(this)}
            id="trendHrs"
            label="Глубина микрографиков (в часах)"
            title="Временно диапазон, который отображается в микрографиках тренда"
          />
          <NumericInput
            value={this.state.trensMaxPtsCount}
            changed={this.handleNumericInput.bind(this)}
            id="trensMaxPtsCount"
            label="Максимальное количество точек микрографика"
            title="Используется алгоритмом даунсемплинга"
          />
        </div>
        {/* History */}
        <div className="full-block">
          <div className="block-header">История</div>
          <NumericInput
            value={this.state.historyShowHrs}
            changed={this.handleNumericInput.bind(this)}
            id="historyShowHrs"
            label="Глубина отображения истории по умолчанию (часы)"
            title="Временной период, который будет отображаться при перехоже в окно истории"
          />
          <NumericInput
            value={this.state.historyMaxPtsCount}
            changed={this.handleNumericInput.bind(this)}
            id="historyMaxPtsCount"
            label="Максимальное количество точек графика истории"
            title="Используется алгоритмом даунсемплинга"
          />
          <NumericInput
            value={this.state.historySpanSecs}
            changed={this.handleNumericInput.bind(this)}
            id="historySpanSecs"
            label="Скважность (секунды) запроса истории"
            title="Шаг в секундах, с которым будут запрашиваться измерения при запросе истории"
          />
          <ConfirmationCheck
            isActive={this.state.isSaveHistoryReqs}
            changed={this.handleCheckBoxClick.bind(this)}
            id="isSaveHistoryReqs"
            label="Сохранять запросы истории в JSON"
            title="Осуществлять сохранение исходящих запросов истории на диске в JSON (для отладки)"
          />
          <ConfirmationCheck
            isActive={this.state.isSaveHistoryReps}
            changed={this.handleCheckBoxClick.bind(this)}
            id="isSaveHistoryReps"
            label="Сохранять входящие сообщения с историей в JSON"
            title="Осуществлять сохранение входящих файлов истории на диск в JSON(для отладки)"
          />
          <div>
            JSON-файлы будут сохраняться в папке \history\ подписанные
            timestamp. Файлы, содержащие req - запросы, res - ответная история.
          </div>
        </div>
        {/* Default btn */}
        <div className="center-block">
          <button
            id="default"
            className="btn"
            onClick={this.handleDefaultsClick.bind(this)}
            title="Сбросить все значения на значения по умолчанию"
          >
            Всё по умолчанию
          </button>
        </div>
        {/* Send btn */}
        <div className="center-block">
          <button
            id="save_n_close"
            className="btn"
            onClick={this.handleSaveClick.bind(this)}
            title="Сохранить значения и закрыть окно"
          >
            Сохранить и закрыть
          </button>
        </div>
      </div>
    );
  }
}

export default Advanced;
