import { Rect } from 'common/util/GeometryTypes'


// ----- Database types -----


export type PhotoId = number
export interface Photo {
    id: PhotoId,
    /** The directory of the original image. Example: '/User/me/Pictures' */
    master_dir: string,
    /** The filename (without directory) of the original image. Example: 'IMG_9700.JPG' */
    master_filename: string,
    /** The width of the original image - only with EXIF rotation applied (in px). */
    master_width: number
    /** The height of the original image - only with EXIF rotation applied (in px). */
    master_height: number
    /** Whether the master image has a raw format */
    master_is_raw: 0 | 1,
    /** The width of the original image - after EXIF rotation and all PhotoWork have been applied (in px). */
    edited_width: number | null
    /** The height of the original image - after EXIF rotation and all PhotoWork have been applied (in px). */
    edited_height: number | null
    /** Example: '2016-09-18' */
    date_section: string,
    /** The timestamp when the photo was created */
    created_at: number,
    /** The timestamp when the photo was modified */
    updated_at: number,
    /** The timestamp when the photo was imported */
    imported_at: number,
    /** Example: 1 (= ExifOrientation.Up) */
    orientation: ExifOrientation,
    /** Example: 'SONY DSC-N2' */
    camera?: string,
    /** Example: 0.0166 */
    exposure_time?: number,
    /** Example: 0 */
    iso?: number,
    /** Example: 5 */
    focal_length?: number,
    /** Example: 5.6 */
    aperture?: number,
    lat?: number,
    lng?: number,
    /** Whether the image is flagged. */
    flag: 0 | 1,
    /** Example: 0 */
    trashed: 0 | 1,
}
export type PhotoById = { [K in PhotoId]: Photo }


export type TagId = number
export interface Tag {
    id: TagId
    title: string
    slug: string
    created_at: number
    updated_at: number | null
}
export type TagById = { [K in TagId]: Tag }


export type VersionId = number
export interface Version {
    id: VersionId
    type: string | null,
    master: string | null,
    output: string | null,
    thumbnail: string | null,
    version: number | null,
    photo_id: number | null,
}


// ----- Other types (not database) -----


/** An EXIF orientation. See: https://www.impulseadventure.com/photo/exif-orientation.html */
export enum ExifOrientation { Up = 1, Bottom = 3, Right = 6, Left = 8 }


export interface Settings {
    photoDirs: string[]
    exportOptions?: PhotoExportOptions
    legacy?: {
        versionsDir?: string
    }
}


export interface UiConfig {
    version: string
    platform: NodeJS.Platform
    locale: string
}

export type ImportProgress = {
    phase: 'scan-dirs' | 'cleanup' | 'import-photos' | 'error'
    isPaused: boolean
    /** Total number of photos found in file system */
    total: number
    /** Number of processed photos (photos which exist in file system and have been checked) */
    processed: number
    /** Number of photos added to the DB */
    added: number
    /** Number of photos removed from DB */
    removed: number
    /** The path of the directory which is currently scanned or processed */
    currentPath: string | null
}

/** See: src/usb.js */
export interface Device {
    id: any  // TODO
    type: 'usb-storage' | 'sd-card'
    name: string
    // TODO: Maybe there are more attributes. See src/usb.js
}


export interface PhotoDetail {
    versions: Version[],
    /** The tags attached to this photo. This may also contain new tags which don't exist in DB yet. */
    tags: string[]
}

export interface PhotoWork {
    rotationTurns?: 1 | 2 | 3
    /** The number of degrees the photo is tilted (= rotated around the z axis) */
    tilt?: number
    /**
     * The rectangle where the photo should be cropped.
     * In projected coordinates (see `doc/geometry-concept.md`).
     */
    cropRect?: Rect
    flagged?: true
    tags?: string[]
}

export type PhotoSectionId = string
export interface PhotoSection {
    id: PhotoSectionId
    title: string
    count: number
}
export interface PhotoSet {
    photoIds: PhotoId[]
    photoData: PhotoById
}
export interface LoadedPhotoSection extends PhotoSection, PhotoSet {
}
export function isLoadedPhotoSection(section: PhotoSection | null | undefined | false): section is LoadedPhotoSection {
    return !!(section && (section as any).photoIds)
}
export type PhotoSectionById = { [K in PhotoSectionId]: PhotoSection | LoadedPhotoSection }


export type PhotoFilterType = 'all' | 'flagged' | 'processed' | 'trash' | 'tag' | 'geo'
export type PhotoFilter =
    { readonly type: 'all' } |
    { readonly type: 'flagged' } |
    { readonly type: 'trash' } |
    { readonly type: 'tag', readonly tagId: TagId } |
    { readonly type: 'geo', readonly bounds: {readonly latSW, latNE, lngSW, lngNE: number}}
    // TODO: Revive Legacy code of 'version' feature
    // -> Add 'processed'


export interface PhotoRenderOptions {
    format: PhotoRenderFormat
    /** Quality between `0` and `1`. Will be ignored if `format` is `png` */
    quality: number
}
export type PhotoRenderFormat = 'jpg' | 'webp' | 'png'
export const photoRenderFormats: PhotoRenderFormat[] = [ 'jpg', 'webp', 'png' ]


export interface PhotoExportOptions extends PhotoRenderOptions {
    size: PhotoExportSizeType
    customSizeSide: PhotoExportCustomSizeSide
    customSizePixels: number
    withMetadata: boolean
    fileNameStyle: PhotoExportFileNameStyle
    fileNamePrefix: string
    folderPath: string
}
export type PhotoExportSizeType = 'S' | 'M' | 'L' | 'original' | 'custom'
export type PhotoExportCustomSizeSide = 'width' | 'height' | 'size'
export type PhotoExportFileNameStyle = 'like-original' | 'sequence'

export interface PhotoExportProgress {
    processed: number
    total: number
}
