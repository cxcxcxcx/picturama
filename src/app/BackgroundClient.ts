import { ipcRenderer } from 'electron'

import { UiConfig, Settings, PhotoSet, PhotoExportOptions } from 'common/CommonTypes'
import { PhotoId, Photo, PhotoDetail, PhotoWork, PhotoFilter, PhotoSection, PhotoSectionId, Tag } from 'common/CommonTypes'
import { assertRendererProcess } from 'common/util/ElectronUtil'


assertRendererProcess()


// We used to use electron.require for this, but it was too buggy.
// (I passed a value to an IPC stub and the other side got a value from a previous call)


interface CallInfo {
    resolve(result: any)
    reject(error: any)
}


let isInitialized = false
let nextCallId = 1
const pendingCalls: { [key:number]: CallInfo } = {}


export default {

    init() {
        if (isInitialized) {
            throw new Error('BackgroundClient is already initialized')
        }
        isInitialized = true
        ipcRenderer.on('onBackgroundActionDone', (event, callId, error, result) => {
            const callInfo = pendingCalls[callId]
            delete pendingCalls[callId]
            if (callInfo) {
                if (error) {
                    callInfo.reject(error)
                } else {
                    callInfo.resolve(result)
                }
            }
        })
    },

    waitForBackgroundReady(): Promise<void> {
        return callOnBackground('waitForBackgroundReady')
    },

    toggleFullScreen(): Promise<void> {
        return callOnBackground('toggleFullScreen')
    },

    toggleMaximized(): Promise<void> {
        return callOnBackground('toggleMaximized')
    },

    fetchUiConfig(): Promise<UiConfig> {
        return callOnBackground('fetchUiConfig')
    },

    fetchSettings(): Promise<Settings> {
        return callOnBackground('fetchSettings')
    },

    storeSettings(settings: Settings) {
        return callOnBackground('storeSettings', { settings })
    },

    getFileSize(path: string): Promise<number> {
        return callOnBackground('getFileSize', { path })
    },

    selectScanDirectories(): Promise<string[] | undefined> {
        return callOnBackground('selectScanDirectories')
    },

    selectExportDirectory(): Promise<string | undefined> {
        return callOnBackground('selectExportDirectory')
    },

    startImport(): Promise<void> {
        return callOnBackground('startImport')
    },

    toggleImportPaused(): Promise<void> {
        return callOnBackground('toggleImportPaused')
    },

    cancelImport(): Promise<void> {
        return callOnBackground('cancelImport')
    },

    fetchTotalPhotoCount(): Promise<number> {
        return callOnBackground('fetchTotalPhotoCount')
    },

    fetchSections(filter: PhotoFilter, sectionIdsToKeepLoaded?: PhotoSectionId[]): Promise<PhotoSection[]> {
        return callOnBackground('fetchSections', { filter, sectionIdsToKeepLoaded })
    },

    fetchSectionPhotos(sectionIds: PhotoSectionId[], filter: PhotoFilter): Promise<PhotoSet[]> {
        return callOnBackground('fetchSectionPhotos', { sectionIds, filter })
    },

    fetchAllPhotos(filter: PhotoFilter): Promise<PhotoSet> {
        return callOnBackground('fetchAllPhotos', { filter })
    },

    updatePhotos(photoIds: PhotoId[], update: Partial<Photo>): Promise<void> {
        return callOnBackground('updatePhotos', { photoIds, update })
    },

    fetchPhotoDetail(photoId: PhotoId): Promise<PhotoDetail> {
        return callOnBackground('fetchPhotoDetail', { photoId })
    },

    fetchPhotoWorkOfPhoto(photo: Photo): Promise<PhotoWork> {
        return callOnBackground('fetchPhotoWorkOfPhoto', { photo })
    },

    storePhotoWork(photoDir: string, photoFileName: string, photoWork: PhotoWork): Promise<void> {
        return callOnBackground('storePhotoWork', { photoDir, photoFileName, photoWork })
    },

    createThumbnail(photo: Photo): Promise<void> {
        return callOnBackground('createThumbnail', { photo })
    },

    deleteThumbnail(photoId: PhotoId): Promise<void> {
        return callOnBackground('deleteThumbnail', { photoId })
    },

    fetchTags(): Promise<Tag[]> {
        return callOnBackground('fetchTags')
    },

    storePhotoTags(photoId: PhotoId, photoTags: string[]): Promise<Tag[] | null> {
        return callOnBackground('storePhotoTags', { photoId, photoTags })
    },

    exportPhoto(photo: Photo, photoIndex: number, options: PhotoExportOptions): Promise<void> {
        return callOnBackground('exportPhoto', { photo, photoIndex, options })
    },
}

async function callOnBackground(action: string, params: any = null): Promise<any> {
    if (!isInitialized) {
        throw new Error('BackgroundClient is not yet initialized')
    }

    const callId = nextCallId++

    return new Promise<any>((resolve, reject) => {
        pendingCalls[callId] = { resolve, reject }
        ipcRenderer.send('executeBackgroundAction', callId, action, params)
    })
}
