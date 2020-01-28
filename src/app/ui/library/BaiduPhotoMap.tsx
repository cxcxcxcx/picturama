import React from "react"

import { compose, withProps, withHandlers } from "recompose"
import { PhotoById, PhotoFilter } from "common/CommonTypes";
import { connect } from "react-redux";
import { setLibraryFilter } from 'app/controller/PhotoController'
import { AppState } from 'app/state/StateTypes'
import store from "app/state/store";
import { setMapAction } from "app/state/actions";
import config from "common/config";
import { wgs2bd, bd2wgs } from "eviltransform";
import { asyncWrapper } from 'react-baidu-maps';
import { BaiduMap, ScaleControl, MarkerClusterer, Marker } from 'react-baidu-maps';


interface OwnProps {
    allPhotos?: PhotoById
}

interface DispatchProps {
    setLibraryFilter(newFilter: PhotoFilter): void
}

interface StateProps {
    zoom: number
    center: google.maps.LatLngLiteral
}

export interface Props extends OwnProps, StateProps, DispatchProps {}

export class PhotoMapBaidu extends React.Component<Props> {
    render() {
        const props = this.props
        const cS = localStorage.getItem('c')
        let m: StateProps = {
            zoom: 2,
            center: {lat: 40, lng: 120}
        }
        if (cS) {
            m = JSON.parse(cS) as StateProps
        }
        console.log("Rerender");
        const AsyncMap = asyncWrapper(BaiduMap);
        return Object.keys(props.allPhotos || {}).length > 0 && <div style={{ background: '#444', height: '300px' }}>
            <AsyncMap
              mapUrl={`http://api.map.baidu.com/api?v=3.0&ak=FLGL9Os0DoodIHC5cFrgZwPgWfGkYCCE`}
              loadingElement={<div>Loading.....</div>}
              enableScrollWheelZoom
              zoom={m.zoom}
              center={m.center}
              onClick={(e) => {
                  console.log(e);
                  const dist = 7e-3 * Math.pow(2, 14 - e.target.getZoom())
                  console.log("map", dist, e.target.getZoom(), e.target.getCenter());
                  const p = bd2wgs(e.point.lat, e.point.lng);
                  const bounds = {latNE: p.lat+dist, latSW: p.lat-dist,
                    lngNE: p.lng+dist, lngSW: p.lng-dist}
                  console.log(p, bounds, "Back:", wgs2bd(p.lat, p.lng))
                  this.props.setLibraryFilter({
                      type: "geo",
                      bounds
                  })
                }}
              mapContainer={<div style={{ height: '100%' }} />} >
            <ScaleControl  />

            <MarkerClusterer>
                {Object.keys(props.allPhotos || {})
                .map(photoId => [photoId, props && (props.allPhotos || {})[photoId]]).filter(
                    (a) => a[1].lat && a[1].lng
                ).map((a) =>
                    <Marker
                    onClick={(e) => {
                        console.log(e, e.point);
                        e.domEvent.stopPropagation();
                        // let latLng = e.point;
                        let latLng = a[1]
                        this.props.setLibraryFilter({
                            type: "geo",
                            bounds: {latNE: latLng.lat+1e-7, latSW: latLng.lat-1e-7,
                                lngNE: latLng.lng+1e-7, lngSW: latLng.lng-1e-7,}
                        })
                    } }
                    key={a[0]}
                    position={ wgs2bd(a[1].lat, a[1].lng) }
                    />
                )}
            </MarkerClusterer> 
                  </AsyncMap>
          </div>;
    }
    //最简单的用法，生成一个marker数组，然后调用markerClusterer类即可。
    // var markerClusterer = new BMapLib.MarkerClusterer(map, {markers:markers});
}

const Connected = connect<StateProps, DispatchProps, OwnProps, AppState>(
    (state: AppState, props: OwnProps) => {
        // console.log(state)
        const m = state.navigation.map
        console.log("Connect again", m)
        return {...props,
          zoom: m.zoom,
          center: m.center
        }
    },
    dispatch => ({
        setLibraryFilter,
    })
)(PhotoMapBaidu)

export default Connected
