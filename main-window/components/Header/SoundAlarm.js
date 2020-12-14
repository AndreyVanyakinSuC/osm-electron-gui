import React, { useState, useEffect, useRef } from 'react';
import Button from '@material-ui/core/Button';
import VolumeOffRoundedIcon from '@material-ui/icons/VolumeOffRounded';
import VolumeUpRoundedIcon from '@material-ui/icons/VolumeUpRounded';
import Sound from 'react-sound';
import alarmSound from '../../assets/alarm.mp3';

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

const SoundAlarm = props => {
  const { isAlarm } = props;
  const [isEnabled, setEnabled] = useState(true);
  const [playStatus, setPlayStatus] = useState('STOPPED');

  const previousPlayStatus = usePrevious(playStatus);

  console.log('msg_code', isAlarm, 'previous playstatus', previousPlayStatus);

  useEffect(() => {
    if (isAlarm) {
      setPlayStatus('PLAYING');
    } else {
      setPlayStatus('STOPPED');
    }
  }, [isAlarm]);

  return (
    <>
      <Sound
        url={alarmSound}
        playStatus={playStatus}
        loop
        volume={isEnabled ? 75 : 0}
        // onFinishedPlaying={() => setPlayStatus('STOPPED')}
      />
      <Button
        startIcon={
          isEnabled ? <VolumeUpRoundedIcon /> : <VolumeOffRoundedIcon />
        }
        onClick={() => setEnabled(!isEnabled)}
        className="sound-btn"
      >
        {isEnabled
          ? 'Звуковое уведомление включено'
          : 'Звуковое уведомление отключено'}
      </Button>
    </>
  );
};

export default SoundAlarm;
