import { BrowserWindow, ipcMain, dialog } from 'electron'

import { UiConfig } from 'common/CommonTypes'
import { assertMainProcess } from 'common/util/ElectronUtil'

import AppWindowController from 'background/AppWindowController'
import { exportPhoto } from 'background/ExportController'
import ForegroundClient from 'background/ForegroundClient'
import { startImport, toggleImportPaused, cancelImport } from 'background/ImportController'
import { fetchPhotoWorkOfPhoto, storePhotoWork } from 'background/store/PhotoWorkStore'
import { fetchTotalPhotoCount, fetchSections, updatePhotos, fetchPhotoDetail, fetchSectionPhotos, emptyTrash, fetchAllPhotos } from 'background/store/PhotoStore'
import { fetchSettings, storeSettings } from 'background/store/SettingsStore'
import { fetchTags, storePhotoTags } from 'background/store/TagStore'
import { createThumbnail, deleteThumbnail } from 'background/store/ThumbnailStore'
import { fsStat } from 'background/util/FileUtil'


assertMainProcess()


let uiConfig: UiConfig

let resolveBackgroundReady: () => void
const waitForBackgroundReadyPromise = new Promise(resolve => resolveBackgroundReady = resolve)


export function init(mainWin: BrowserWindow, newUiConfig: UiConfig) {
    uiConfig = newUiConfig

    ipcMain.on('start-scanning', startImport)
    ipcMain.on('empty-trash', () => {
        emptyTrash()
            .catch(error => {
                ForegroundClient.showError('Emptying trash failed', error)
            })
    })

    ipcMain.on('executeBackgroundAction', (event, callId, action, params) => {
        executeBackgroundAction(action, params)
            .then(result => {
                mainWin.webContents.send('onBackgroundActionDone', callId, null, result)
            },
            error => {
                const msg = (error instanceof Error) ? error.message : error
                mainWin.webContents.send('onBackgroundActionDone', callId, msg, null)
            })
    })
}

export function onBackgroundReady() {
    resolveBackgroundReady()
}

async function executeBackgroundAction(action: string, params: any): Promise<any> {
    if (action === 'waitForBackgroundReady') {
        return waitForBackgroundReadyPromise
    } else if (action === 'toggleFullScreen') {
        AppWindowController.toggleFullScreen()
    } else if (action === 'toggleMaximized') {
        AppWindowController.toggleMaximized()
    } else if (action === 'fetchUiConfig') {
        return Promise.resolve(uiConfig)
    } else if (action === 'fetchSettings') {
        return fetchSettings()
    } else if (action === 'storeSettings') {
        await storeSettings(params.settings)
    } else if (action === 'getFileSize') {
        const stat = await fsStat(params.path)
        return stat.size
    } else if (action === 'selectScanDirectories') {
        const result = await dialog.showOpenDialog(AppWindowController.getAppWindow(), { properties: [ 'openDirectory', 'multiSelections' ] })
        return result.canceled ? undefined : result.filePaths
    } else if (action === 'selectExportDirectory') {
        const result = await dialog.showOpenDialog(AppWindowController.getAppWindow(), { properties: [ 'openDirectory', 'createDirectory' ] })
        return result.canceled ? undefined : result.filePaths[0]
    } else if (action === 'startImport') {
        startImport()
    } else if (action === 'toggleImportPaused') {
        toggleImportPaused()
    } else if (action === 'cancelImport') {
        cancelImport()
    } else if (action === 'fetchTotalPhotoCount') {
        return fetchTotalPhotoCount()
    } else if (action === 'fetchSections') {
        return fetchSections(params.filter, params.sectionIdsToKeepLoaded)
    } else if (action === 'fetchSectionPhotos') {
        return fetchSectionPhotos(params.sectionIds, params.filter)
    } else if (action === 'fetchAllPhotos') {
        return fetchAllPhotos(params.filter)
    } else if (action === 'updatePhotos') {
        return updatePhotos(params.photoIds, params.update)
    } else if (action === 'fetchPhotoDetail') {
        return fetchPhotoDetail(params.photoId)
    } else if (action === 'fetchPhotoWorkOfPhoto') {
        return fetchPhotoWorkOfPhoto(params.photo)
    } else if (action === 'storePhotoWork') {
        return storePhotoWork(params.photoDir, params.photoFileName, params.photoWork)
    } else if (action === 'createThumbnail') {
        return createThumbnail(params.photo)
    } else if (action === 'deleteThumbnail') {
        return deleteThumbnail(params.photoId)
    } else if (action === 'fetchTags') {
        return fetchTags()
    } else if (action === 'storePhotoTags') {
        const shouldFetchTags = await storePhotoTags(params.photoId, params.photoTags)
        return shouldFetchTags ? (await fetchTags()) : null
    } else if (action === 'exportPhoto') {
        return exportPhoto(params.photo, params.photoIndex, params.options)
    } else {
        throw new Error('Unknown background action: ' + action)
    }
}
