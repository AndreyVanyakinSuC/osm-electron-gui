import React, { Component } from 'react';
import { Polyline } from 'react-leaflet';

class Centerline extends Component {
  render() {
    const { LatLngList } = this.props;

    return <Polyline className={'centerline'} positions={LatLngList} />;
  }
}

export default Centerline;
