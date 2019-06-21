import React, {Component} from 'react';
import {Map, TileLayer, Polyline, FeatureGroup, ZoomControl} from 'react-leaflet';
import MapLine from './MapLine';
import Tower from './Tower/Tower';
import _ from 'lodash';
import {geo_globalBounds, geo_Center} from '../../../APInHelpers/map';
import { pickWorstMessage } from '../../../APInHelpers/notification';
import { schema_towerObjs } from '../../../APInHelpers/schema';
import { filterFresh } from '../../../APInHelpers/history';
import { MSGS, TILE_URL } from '../../../APInHelpers/base';


import L from 'leaflet';
require("leaflet_css");
require("leaflet_marker");
require("leaflet_marker_2x");
require("leaflet_marker_shadow");

export default class MyMap extends Component {

    state = {
        viewport: {
            center: geo_Center(this.props.schema),
            zoom: 10, // not importany
        }
    }

    componentDidMount() {
        // console.log('%c[MAP] Component did mount','color:blue');
        console.log('%c[MAP] Refs','color:blue', this.refs);
    }

    componentDidUpdate(prevProps) {
        
        console.log('%c[MAP] Component did update','color:blue');

        // null are default
        const {entityID, entityType} = this.props.zoomTo;
        
        if (entityID !== null && entityType !== null) {
            const focusRef = `${entityType}_${entityID}`
            console.log(`%c[MAP] will focus to ${focusRef}`,'color:blue');

            // focus map by its ref using the element focusRef
            const mapElement = this.refs.map.leafletElement;
            const focusElement = this.refs[focusRef].leafletElement;

            mapElement.fitBounds(focusElement.getBounds(), {padding: [50,50]});
            // mapElement.fitBounds(focusElement.getBounds().pad(0.1)); //padding

            // reset parent
            this.props.resetZoomTo();

        }

    }


    // 
    // HAMNDLERS
    //

    handleViewportChange(vp) {
        console.log('%c[MAP] Viewport change fired','color:blue',vp);
        this.setState(prevState => {
            if (_.isEqual(prevState.viewport, vp)) {
                return null;
            } else {
                return {viewport: vp}
            }
        });
    }

    // getMapRef = (node) => { this.map = node; }

    render() {
        console.log('%c[MAP] Render','color:blue');
        const { schema, fresh } = this.props;
        const maxBounds= L.latLngBounds(geo_globalBounds(schema)).pad(1);
        const tileUrl = TILE_URL;

        //
        //RENDER SHIT
        //

        let deps = Object.keys(schema.deps);

        const renderTowers = (lID) => _.uniq(_.flatten(schema.lines[lID].ranges
            .map(rID => schema.ranges[rID].towers))) // map to unique tower ids
            .map(tID => {
                let freshSubset, twrFromNumber, twrTowardsNumber;

                if (!schema.towers[tID].hasSensors) {
                    freshSubset,twrFromNumber,twrTowardsNumber === null;
                } else {
                    const towerObjs = schema_towerObjs(schema, tID);
                    freshSubset = filterFresh(fresh, towerObjs);
                }

                return <Tower 
                    key={`tower_${tID}`}  
                    towerID={tID} 
                    schema={schema} 
                    fresh={freshSubset} />
        })

        const renderRanges = (lID) => (schema.lines[lID].ranges
            .map(rID => {

                // Get messages for all objects within range and take the most dangerous one to style the range

                const messages = schema.ranges[rID].obj.map(o => fresh[o].msg);
                const worstMsg = pickWorstMessage(messages);
                const rangeClasses = worstMsg === null ? 'range' : `range ${MSGS.get(worstMsg).class}`

                //FIXME: set styles based on [msg]

                return <Polyline 
                    ref={`range_${rID}`} 
                    key={`range_${rID}`} 
                    className={rangeClasses} // +alert +warning +hint
                    positions={schema.ranges[rID].latlng}/>
        }))

        const renderLines = (dID) => (schema.deps[dID].lines.map(lID => <MapLine key={`line_${lID}`} lineID={lID} >
            <Polyline ref={`line_${lID}`} className={'centerline'} positions={schema.lines[lID].latlng}/>
            {renderRanges(lID)}
            {renderTowers(lID)}
        </MapLine>))

        const renderDeps = () => (deps.map(dID => <FeatureGroup key={`dep_${dID}`} ref={`dep_${dID}`}>
            {renderLines(dID)}
        </FeatureGroup>))

        return (
            <Map
                ref={'map'}
                // center={this.state.center}
                // zoom={this.state.zoom}
                viewport={this.state.viewport}
                maxBounds={maxBounds}
                boundsOptions = {{padding: [50, 50]}}
                // onViewportChange = {this.handleViewportChange.bind(this)}
                className={'map_cont'}
                useFlyTo={true}
                zoomControl={false}
                animate={true}>
                
                <TileLayer url={tileUrl}/>

                <ZoomControl position='topright'/>

                {renderDeps()}

            </Map>
        )
        
    }
        
}
 

