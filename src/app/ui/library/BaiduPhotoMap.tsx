import React from "react"

import { PhotoById, PhotoFilter } from "common/CommonTypes";
import { connect } from "react-redux";
import { setLibraryFilter } from 'app/controller/PhotoController'
import { AppState } from 'app/state/StateTypes'
import { wgs2bd, bd2wgs } from "eviltransform";
import { asyncWrapper } from 'react-baidu-maps';
import { BaiduMap, ScaleControl, MapTypeControl, NavigationControl, MarkerClusterer, Marker } from 'react-baidu-maps';


interface OwnProps {
    allPhotos?: PhotoById
}

interface DispatchProps {
    setLibraryFilter(newFilter: PhotoFilter): void
}

export interface Props extends OwnProps, DispatchProps {}

export class PhotoMapBaidu extends React.Component<Props> {
    render() {
        const props = this.props
        console.log("Rerender");
        const AsyncMap = asyncWrapper(BaiduMap);
        return Object.keys(props.allPhotos || {}).length > 0 && <div style={{ background: '#444', height: '350px' }}>
            <AsyncMap
              mapUrl={`http://api.map.baidu.com/api?v=3.0&ak=FLGL9Os0DoodIHC5cFrgZwPgWfGkYCCE`}
              loadingElement={<div>Loading.....</div>}
              enableScrollWheelZoom
              enableMapClick={false}
              enableDoubleClickZoom={false}
              zoom={2}
              center={{lat: 40, lng: 120}}
              onClick={(e) => {
                  console.log(e, "Zoom level", e.target.getZoom());
                  const dist = 6e-3 * Math.pow(2, 14 - e.target.getZoom())
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
                <MapTypeControl  />
                <ScaleControl  />
                <NavigationControl
                    type="small"
                    anchor="top_right"
                    offset={{ width: 0, height: 30 }} />

                <MarkerClusterer>
                    {Object.keys(props.allPhotos || {})
                    .map(photoId => [photoId, props && (props.allPhotos || {})[photoId]]).filter(
                        (a) => a[1].lat && a[1].lng
                    ).map((a) =>
                        <Marker
                        onClick={(e) => {
                            e.domEvent.stopPropagation();
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
}

const Connected = connect<{}, DispatchProps, OwnProps, AppState>(
    (state: AppState, props: OwnProps) => props,
    dispatch => ({
        setLibraryFilter,
    })
)(PhotoMapBaidu)

export default Connected
