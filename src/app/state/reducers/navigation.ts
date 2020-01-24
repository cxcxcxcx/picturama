import { Action } from 'app/state/ActionType'
import { SET_FULL_SCREEN, OPEN_SETTINGS, CLOSE_SETTINGS, OPEN_DIFF, CLOSE_DIFF, SET_MAP_SETTINGS } from 'app/state/actionTypes'

import { NavigationState, DetailState } from 'app/state/StateTypes'


const initialNavigationState: NavigationState = {
    isFullScreen: false,
    mainView: null,
    map: {
        zoom: 2,
        center: {lat: 40, lng: 120}
    }
}

export const navigation = (state: NavigationState = initialNavigationState, detailState: DetailState | null, action: Action): NavigationState => {
    switch (action.type) {
        case SET_FULL_SCREEN:
            return {
                ...state,
                isFullScreen: action.payload
            }
        case SET_MAP_SETTINGS:
            return {
                ...state,
                map: action.payload
            }
        case OPEN_SETTINGS:
            return {
                ...state,
                mainView: 'settings'
            }
        case OPEN_DIFF:
            return {
                ...state,
                mainView: 'diff'
            }
        case CLOSE_SETTINGS:
        case CLOSE_DIFF:
            return {
                ...state,
                mainView: null
            }
        default:
            if (state.mainView === null && detailState) {
                return {
                    ...state,
                    mainView: 'detail'
                }
            } else if (state.mainView === 'detail' && !detailState) {
                return {
                    ...state,
                    mainView: null
                }
            } else {
                return state
            }
    }
}
