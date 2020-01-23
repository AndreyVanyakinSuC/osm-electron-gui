import React, { Component } from 'react';
import {
  Map,
  TileLayer,
  LayersControl,
  Polyline,
  FeatureGroup,
  ZoomControl
} from 'react-leaflet';
import Control from 'react-leaflet-control';
import MapLine from './MapLine';
import Tower from './Tower/Tower';
import ZoomHomeBtn from './ZoomHomeBtn';
import _ from 'lodash';
import { geo_globalBounds, geo_Center } from '../../../APInHelpers/map';
import { pickWorstMessage } from '../../../APInHelpers/notification';
import { schema_towerObjs } from '../../../APInHelpers/schema';
import { filterFresh } from '../../../APInHelpers/history';
import { MSGS } from '../../../APInHelpers/base';

import L from 'leaflet';
require('leaflet_css');
require('leaflet_marker');
require('leaflet_marker_2x');
require('leaflet_marker_shadow');

export default class MyMap extends Component {
  state = {
    viewport: {
      center: geo_Center(this.props.schema),
      zoom: 10 // not important
    },
    maxBounds: L.latLngBounds(geo_globalBounds(this.props.schema)).pad(1)
  };

  componentDidMount() {
    // console.log('%c[MAP] Component did mount','color:blue');
    // console.log('%c[MAP] Refs', 'color:blue', this.refs);
  }

  componentDidUpdate(prevProps) {
    // console.log('%c[MAP] Component did update', 'color:blue');

    // Handle focusing on demand
    const { entityID, entityType } = this.props.zoomTo;
    const mapElement = this.refs.map.leafletElement;
    // Handle recenter map if container was resized
    mapElement.invalidateSize(true);

    if (entityID !== null && entityType !== null) {
      const focusRef = `${entityType}_${entityID}`;
      console.log(`%c[MAP] will focus to ${focusRef}`, 'color:blue');

      // focus map by its ref using the element focusRef
      const mapElement = this.refs.map.leafletElement;
      const focusElement = this.refs[focusRef].leafletElement;

      mapElement.fitBounds(focusElement.getBounds(), { padding: [50, 50] });
      // mapElement.fitBounds(focusElement.getBounds().pad(0.1)); //padding

      // reset parent
      this.props.resetZoomTo();
    }
  }

  // To use in handlers and in render
  maxBounds = L.latLngBounds(geo_globalBounds(this.props.schema)).pad(1);

  //
  // HAMNDLERS
  //

  handleViewportChange(vp) {
    // console.log('%c[MAP] Viewport change fired', 'color:blue', vp);
    this.setState(prevState => {
      if (_.isEqual(prevState.viewport, vp)) {
        return null;
      } else {
        return { viewport: vp };
      }
    });
  }

  handleZoomHomeCLick() {
    // console.log('Zoom home clicked');
    this.refs.map.leafletElement.fitBounds(this.state.maxBounds, {
      padding: [50, 50]
    });
  }

  // getMapRef = (node) => { this.map = node; }

  render() {
    // console.log('%c[MAP] Render', 'color:blue', this.state);
    const { schema, focusChart, fresh, tileSources } = this.props;
    // const maxBounds= L.latLngBounds(geo_globalBounds(schema)).pad(1);
    // const tileUrl = PRIMARY_TILE_URL;

    //
    //RENDER SHIT
    //

    let deps = Object.keys(schema.deps);

    const renderTowers = lID =>
      _.uniq(
        _.flatten(
          schema.lines[lID].ranges.map(rID => schema.ranges[rID].towers)
        )
      ) // map to unique tower ids
        .map(tID => {
          let freshSubset, twrFromNumber, twrTowardsNumber;

          if (!schema.towers[tID].hasSensors) {
            freshSubset, twrFromNumber, twrTowardsNumber === null;
          } else {
            const towerObjs = schema_towerObjs(schema, tID);
            freshSubset = filterFresh(fresh, towerObjs);
          }

          return (
            <Tower
              key={`tower_${tID}`}
              towerID={tID}
              focusChart={focusChart}
              schema={schema}
              fresh={freshSubset}
            />
          );
        });

    const renderRanges = lID =>
      schema.lines[lID].ranges.map(rID => {
        // Get messages for all objects within range and take the most dangerous one to style the range

        // console.log(schema.ranges[rID].obj);
        // console.log(fresh);
        const messages = schema.ranges[rID].obj.map(o => fresh[o].msg);
        // console.log(messages[0][0])
        // const worstMsg = pickWorstMessage(messages);
        const pickedWorst = pickWorstMessage(messages);
        // const worstMsg = messages[0][0]
        const worstMsg = pickedWorst;
        // console.log('worst msg',worstMsg, 'picked worst', pickedWorst)
        const rangeClasses =
          worstMsg === null || worstMsg === undefined || worstMsg === ''
            ? 'range'
            : `range ${MSGS.get(worstMsg).class}`;

        //FIXME: set styles based on [msg]

        return (
          <Polyline
            ref={`range_${rID}`}
            key={`range_${rID}_${Math.random()}`} // key changing to force React ot rerender range to upadte stytles
            className={rangeClasses} // +alert +warning +hint
            positions={schema.ranges[rID].latlng}
          />
        );
      });

    const renderLines = dID =>
      schema.deps[dID].lines.map(lID => (
        <MapLine key={`line_${lID}`} lineID={lID}>
          <Polyline
            ref={`line_${lID}`}
            className={'centerline'}
            positions={schema.lines[lID].latlng}
          />
          {renderRanges(lID)}
          {renderTowers(lID)}
        </MapLine>
      ));

    const renderDeps = () =>
      deps.map(dID => (
        <FeatureGroup key={`dep_${dID}`} ref={`dep_${dID}`}>
          {renderLines(dID)}
        </FeatureGroup>
      ));

    // console.log(this.maxBounds);

    return (
      <Map
        ref={'map'}
        attributionControl={false}
        viewport={this.state.viewport}
        maxBounds={this.state.maxBounds}
        boundsOptions={{ padding: [50, 50] }}
        className="map_cont"
        useFlyTo={true}
        zoomControl={false}
        animate={true}
        // onViewportChanged={this.handleViewportChange.bind(this)}
      >
        {/* <TileLayer url={tileSource.url} /> */}

        <LayersControl position="topright">
          <LayersControl.BaseLayer
            name={tileSources.primary.description}
            checked={true}
          >
            <TileLayer
              // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url={tileSources.primary.url}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name={tileSources.secondary.description}>
            <TileLayer
              // attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url={tileSources.secondary.url}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ZoomControl position="topright" />

        <Control position="topleft">
          <ZoomHomeBtn onClick={this.handleZoomHomeCLick.bind(this)} />
        </Control>

        {renderDeps()}
      </Map>
    );
  }
}
