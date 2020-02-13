import React from "react"
import { withGoogleMap, GoogleMap, Marker, withScriptjs } from "react-google-maps"

import MarkerClusterer from "react-google-maps/lib/components/addons/MarkerClusterer";
import { compose, withProps, withHandlers } from "recompose"
import { PhotoById, PhotoFilter } from "common/CommonTypes";
import { connect } from "react-redux";
import { setLibraryFilter } from 'app/controller/PhotoController'
import { AppState } from 'app/state/StateTypes'

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

export interface Props extends OwnProps, DispatchProps {}

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
            googleMapURL: "https://maps.googleapis.com/maps/api/js?v=3&libraries=geometry,drawing,places&key=AIzaSyD2XPeQTx_TB5BtnAaH4l1xOKhD70ca3eY",
            loadingElement: <div style={{ height: `400px` }} />,
            containerElement: <div style={{ height: `400px` }} />,
            mapElement: <div style={{ height: `400px` }} />,
          }),
          withHandlers({
            onMarkerClustererClick: () => (markerCluster: Cluster) => {
                if (!markerCluster) {
                    return
                }
                const bounds = markerCluster.getBounds()
                const ne = bounds.getNorthEast();
                const sw = bounds.getSouthWest();
                this.props.setLibraryFilter({
                    type: "geo",
                    bounds: {latNE: ne.lat()+1e-5, latSW: sw.lat()-1e-5,
                        lngNE: ne.lng()+1e-5, lngSW: sw.lng()-1e-5,}
                })
                console.log(markerCluster);
            },
            markerClicked: () => (latLng: google.maps.LatLngLiteral) => {
                this.props.setLibraryFilter({
                    type: "geo",
                    bounds: {latNE: latLng.lat+1e-7, latSW: latLng.lat-1e-7,
                        lngNE: latLng.lng+1e-7, lngSW: latLng.lng-1e-7,}
                })
            },
            onCenterChanged: () => () => {
                const map = refs.map as GoogleMap;
                const zoom = map.getZoom();
                const center = map.getCenter().toJSON();
                localStorage.setItem('c', JSON.stringify({zoom, center}))
            },
            onMapMounted: () => ref => {
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
                onClick={props.markerClicked.bind(this,a[1])}
                position={ a[1] }
                />
            )}
            </MarkerClusterer>
          </GoogleMap>
        )
        return Object.keys(props.allPhotos || {}).length > 0 && <MyMapComponent allPhotos={props.allPhotos} />;
    }
}

const Connected = connect<{}, DispatchProps, OwnProps, AppState>(
    (state: AppState, props: OwnProps) => {
        return props
    },
    dispatch => ({
        setLibraryFilter,
    })
)(PhotoMap)

export default Connected
