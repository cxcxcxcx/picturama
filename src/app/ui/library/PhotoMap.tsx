import React from "react"
import { withGoogleMap, GoogleMap, Marker, withScriptjs } from "react-google-maps"

import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import { compose, withProps, withHandlers } from "recompose"
import { PhotoById, PhotoFilter } from "common/CommonTypes";
import { connect } from "react-redux";
import { setLibraryFilter } from 'app/controller/PhotoController'
import { AppState } from 'app/state/StateTypes'
import store from "app/state/store";
import { setMapAction } from "app/state/actions";
import config from "common/config";

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

export class PhotoMap extends React.Component<Props> {
    render() {
        console.log("Rerender");
        const props = this.props
        const cS = localStorage.getItem('c')
        let m: StateProps = {
            zoom: 2,
            center: {lat: 40, lng: 120}
        }
        if (cS) {
            m = JSON.parse(cS) as StateProps
        }
        const refs : {map?: GoogleMap} = {
            map: undefined
        }
        const MyMapComponent = compose(
          withProps({
            googleMapURL: "https://maps.google.cn/maps/api/js?v=3&libraries=geometry,drawing,places&key=AIzaSyD2XPeQTx_TB5BtnAaH4l1xOKhD70ca3eY&region=US",
            loadingElement: <div style={{ height: `300px` }} />,
            containerElement: <div style={{ height: `400px` }} />,
            mapElement: <div style={{ height: `300px` }} />,
          }),
          withHandlers({
            onMarkerClustererClick: () => (markerCluster: Cluster) => {
                if (!markerCluster) {
                    return
                }
                const bounds = markerCluster.getBounds()
                this.props.setLibraryFilter({
                    type: "geo",
                    bounds: {latNE: bounds.getNorthEast().lat()+1e-7, latSW: bounds.getSouthWest().lat()-1e-7,
                        lngNE: bounds.getNorthEast().lng()+1e-7, lngSW: bounds.getSouthWest().lng()-1e-7,}
                })
                console.log(markerCluster);
            },
            onCenterChanged: () => () => {
                const map = refs.map as GoogleMap;
                const zoom = map.getZoom();
                const center = map.getCenter().toJSON();
                console.log('ZC', {
                    zoom,
                    center
                })
                localStorage.setItem('c', JSON.stringify({zoom, center}))
                // setTimeout(() => store.dispatch(setMapAction({
                //     zoom,
                //     center
                // })))
                // return true;
            },
            onMapMounted: () => ref => {
                console.log("Mounted", this.state)
                refs.map = ref
            }
          }),
          withScriptjs,
          withGoogleMap
        )((props) =>
          <GoogleMap
            defaultZoom={m.zoom}
            ref={props.onMapMounted}
            defaultCenter={m.center}
            onCenterChanged={props.onCenterChanged}
            onZoomChanged={props.onCenterChanged}
          >
            <MarkerClusterer
                onClick={props.onMarkerClustererClick}
                styles={[{
                    url: config.images + '/m1.png',
                    height: 53,
                    width: 53
                }, {
                    url: config.images + '/m2.png',
                    height: 56,
                    width: 56
                }, {
                    url: config.images + '/m3.png',
                    height: 66,
                    width: 66
                }, {
                    url: config.images + '/m4.png',
                    height: 78,
                    width: 78
                }, {
                    url: config.images + '/m5.png',
                    height: 90,
                    width: 90
                }]}
                averageCenter
                enableRetinaIcons
                gridSize={60}
            >
            {Object.keys(props.allPhotos || {})
            .map(photoId => [photoId, props.allPhotos[photoId]]).filter(
                (a) => a[1].lat && a[1].lng
            ).map((a) =>
                <Marker
                key={a[0]}
                position={{ lat: a[1].lat, lng: a[1].lng }}
                />
            )}
            </MarkerClusterer>
          </GoogleMap>
        )
        return Object.keys(props.allPhotos || {}).length > 0 && <MyMapComponent allPhotos={props.allPhotos} />;
    }
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
)(PhotoMap)

export default Connected
