import React, { PureComponent } from 'react';
import { displayHuman } from '../../APInHelpers/timeseries';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faCircleNotch,
  faTimesCircle
} from '@fortawesome/free-solid-svg-icons';
import log from 'electron-log';

class ConnectStatus extends PureComponent {
  state = {
    lastFreshMessageTS: '',
    isShouldBlink: true
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.lastFreshMessageTS !== prevState.lastFreshMessageTS) {
      return {
        lastFreshMessageTS: nextProps.lastFreshMessageTS,
        isShouldBlink: true
      };
    } else {
      return null;
    }
  }

  handleAnimationEnd(e) {
    // Reset
    if (e.animationName === 'fa-opacity-calm') {
      this.setState({ isShouldBlink: false });
    }
  }

  render() {
    const {
      ip,
      lastFreshMessageTS,
      onConnectClick,
      isConnected,
      isConnecting,
      isWaitingHistory,
      isSchemaAvailable,
      isFreshAvailable
    } = this.props;

    let icon, classes, message, stage, title;

    if (isConnected) {
      if (isWaitingHistory) {
        icon = <FontAwesomeIcon icon={faCircleNotch} spin />;
        classes = 'connect-icon connected';
        message = 'Соединено';
        title = `IP сервера ${ip}`;
        stage = 'Запрашиваем архивные данные с сервера..';
      } else {
        icon = <FontAwesomeIcon icon={faCircle} />;
        classes = `connect-icon connected ${
          this.state.isShouldBlink ? 'fresh' : null
        }`;
        message = 'Соединено';
        title = `IP сервера ${ip}   Последнее сообщение получено в ${displayHuman(
          lastFreshMessageTS
        )}`;
        stage = '';
      }
    } else if (!isConnected) {
      if (isConnecting) {
        icon = <FontAwesomeIcon icon={faCircleNotch} spin />;
        classes = 'connect-icon connecting';
        message = 'Соединяемся..';
        title = `IP сервера ${ip}`;

        if (!isSchemaAvailable) {
          stage = 'получаем описание..';
        } else if (!isFreshAvailable) {
          stage = 'получаем последние данные..';
        }
      } else {
        icon = <FontAwesomeIcon icon={faTimesCircle} />;
        classes = 'connect-icon disconnected';
        message = 'Соединение не установлено';
        stage = null;
      }
    }

    return (
      <div
        className="connect-status-container"
        title={title}
        onClick={onConnectClick}
      >
        <span
          className={classes}
          onAnimationEnd={this.handleAnimationEnd.bind(this)}
        >
          {icon}
        </span>

        <span className="connect-message">{message}</span>

        <span className="connect-message">{stage}</span>
      </div>
    );
  }
}

// export default ConnectStatus1;

// const ConnectStatus = ({
//   ip,
//   lastFreshMessageTS,
//   onConnectClick,
//   isConnected,
//   isConnecting,
//   isWaitingHistory,
//   isSchemaAvailable,
//   isFreshAvailable
// }) => {
//   let icon, classes, message, stage, title;

//   if (isConnected) {
//     if (isWaitingHistory) {
//       icon = <FontAwesomeIcon icon={faCircleNotch} spin />;
//       classes = 'connect-icon connected';
//       message = 'Соединено';
//       title = `IP сервера ${ip}`;
//       stage = 'Запрашиваем архивные данные с сервера..';
//     } else {
//       icon = <FontAwesomeIcon icon={faCircle} />;
//       classes = 'connect-icon connected fresh';
//       message = 'Соединено';
//       title = `IP сервера ${ip}   Последнее сообщение получено в ${displayHuman(
//         lastFreshMessageTS
//       )}`;
//       stage = '';
//     }
//   } else if (!isConnected) {
//     if (isConnecting) {
//       icon = <FontAwesomeIcon icon={faCircleNotch} spin />;
//       classes = 'connect-icon connecting';
//       message = 'Соединяемся..';
//       title = `IP сервера ${ip}`;

//       if (!isSchemaAvailable) {
//         stage = 'получаем описание..';
//       } else if (!isFreshAvailable) {
//         stage = 'получаем последние данные..';
//       }
//     } else {
//       icon = <FontAwesomeIcon icon={faTimesCircle} />;
//       classes = 'connect-icon disconnected';
//       message = 'Соединение не установлено';
//       stage = null;
//     }
//   }

//   return (
//     <div
//       className="connect-status-container"
//       title={title}
//       onClick={onConnectClick}
//     >
//       <span
//         className={classes}
//         onAnimationEnd={log.info('End')}
//       >
//         {icon}
//       </span>

//       <span className="connect-message">{message}</span>

//       <span className="connect-message">{stage}</span>
//     </div>
//   );
// };

export default ConnectStatus;
