import L from 'leaflet';
import deHasSenors from '../../../../assets/de_hasSensors.png';
import deNoSenors from '../../../../assets/de_noSensors.png';

const towerIcon = (hasSensors, isDE) => {
  const SENSOR = 28;
  const NON = SENSOR / 1.2;

  let icon;

  if (hasSensors && isDE) {
    icon = new L.icon({
      iconUrl: deHasSenors,
      iconSize: [SENSOR, SENSOR],
      iconAnchor: [SENSOR / 2, SENSOR / 2],
      popupAnchor: [0, 0]
    });
  } else if (!hasSensors && isDE) {
    icon = new L.icon({
      iconUrl: deNoSenors,
      iconSize: [NON, NON],
      iconAnchor: [NON / 2, NON / 2],
      popupAnchor: [0, 0]
    });
  } else {
    // FIXME:
    icon = new L.icon({
      iconUrl: deNoSenors,
      iconSize: [NON, NON],
      iconAnchor: [NON / 2, NON / 2],
      popupAnchor: [0, 0]
    });
  }

  return icon;
};

export default towerIcon;
