import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';

const LoadingScreen = () => {
  return (
    <div className="loading_screen">
      <div>
        <span>
          <FontAwesomeIcon icon={faCircleNotch} spin />
        </span>
        Готовим график..
      </div>
    </div>
  );
};

export default LoadingScreen;
