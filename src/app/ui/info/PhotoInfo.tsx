import { clipboard, shell } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { Button, Icon, NonIdealState, Popover, Position, Classes, Menu, MenuItem } from '@blueprintjs/core'
import moment from 'moment'

import { Photo, PhotoDetail } from 'common/CommonTypes'
import { msg } from 'common/i18n/i18n'
import { bindMany } from 'common/util/LangUtil'
import { getMasterPath } from 'common/util/DataUtil'
import { formatNumber } from 'common/util/TextUtil'

import { showError } from 'app/ErrorPresenter'
import Toolbar from 'app/ui/widget/Toolbar'
import FaIcon from 'app/ui/widget/icon/FaIcon'

import TagEditor from './TagEditor'

import './PhotoInfo.less'


const infoIconSize = 24

interface Props {
    style?: any
    className?: any
    isActive: boolean
    photo: Photo | null
    photoDetail: PhotoDetail | null
    tags: string[]
    closeInfo: () => void
    getFileSize(path: string): Promise<number>
    setPhotoTags: (photo: Photo, tags: string[]) => void
}

interface State {
    masterFileSize: number | null
}

export default class PhotoInfo extends React.Component<Props, State> {

    private isFetchingMasterFileSize = false

    constructor(props: Props) {
        super(props)
        bindMany(this, 'showPhotoInFolder', 'copyPhotoPath')
        this.state = { masterFileSize: null }
    }

    componentDidMount() {
        this.updateMasterFileSize()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const { props, state } = this
        if (props.photo !== prevProps.photo) {
            this.setState({ masterFileSize: null })
            if (props.isActive) {
                this.updateMasterFileSize()
            }
        } else if (props.photo && props.isActive && state.masterFileSize === null) {
            this.updateMasterFileSize()
        }
    }

    updateMasterFileSize() {
        const photo = this.props.photo
        if (photo && !this.isFetchingMasterFileSize) {
            this.isFetchingMasterFileSize = true
            this.props.getFileSize(getMasterPath(photo))
                .then(masterFileSize => {
                    this.isFetchingMasterFileSize = false
                    if (photo === this.props.photo) {
                        this.setState({ masterFileSize })
                    } else {
                        // The photo has changed in the mean time -> Fetch again
                        this.updateMasterFileSize()
                    }
                })
                .catch(error => {
                    this.isFetchingMasterFileSize = false
                    showError('Fetching master file size failed', error)
                })
        }
    }

    showPhotoInFolder() {
        if (this.props.photo) {
            shell.showItemInFolder(getMasterPath(this.props.photo))
        }
    }

    copyPhotoPath() {
        if (this.props.photo) {
            clipboard.writeText(getMasterPath(this.props.photo))
        }
    }

    render() {
        const props = this.props
        const state = this.state
        const photo = props.photo

        let body
        if (!props.isActive) {
            body = null
        } else if (photo) {
            const momentCreated = moment(photo.created_at)

            body = (
                <>
                    <div className="PhotoInfo-infoRow">
                        <Icon className="PhotoInfo-infoIcon" icon="calendar" iconSize={infoIconSize} />
                        <div className="PhotoInfo-infoBody">
                            <h1>{momentCreated.format('LL')}</h1>
                            <div className="PhotoInfo-minorInfo">
                                {`${momentCreated.format('dd')}, ${momentCreated.format('LT')} \u00b7 ${momentCreated.fromNow()}`}
                            </div>
                        </div>
                    </div>
                    <div className="PhotoInfo-infoRow">
                        <Icon className="PhotoInfo-infoIcon" icon="media" iconSize={infoIconSize} />
                        <div className="PhotoInfo-infoBody">
                            <h1 className="PhotoInfo-infoTitle hasColumns">
                                <div className="PhotoInfo-shrinkable" title={getMasterPath(photo)}>
                                    {photo.master_filename}
                                </div>
                                <Popover position={Position.BOTTOM_RIGHT}>
                                    <span className={classNames('PhotoInfo-breadcrumbs',  Classes.BREADCRUMBS_COLLAPSED)} />
                                    <Menu>
                                        <MenuItem text={msg('PhotoInfo_showInFolder')} onClick={this.showPhotoInFolder} />
                                        <MenuItem text={msg('PhotoInfo_copyPath')} onClick={this.copyPhotoPath} />
                                    </Menu>
                                </Popover>
                            </h1>
                            <div className="PhotoInfo-minorInfo hasColumns">
                                <div>{formatImageMegaPixel(photo.master_width, photo.master_height)}</div>
                                <div>{`${photo.master_width} \u00d7 ${photo.master_height}`}</div>
                                <div>{formatFileSize(state.masterFileSize)}</div>
                            </div>
                            {(photo.edited_width !== photo.master_width || photo.edited_height !== photo.master_height) &&
                                <div className='PhotoInfo-minorInfo isCentered'>
                                    {`(${photo.edited_width} \u00d7 ${photo.edited_height})`}
                                </div>
                            }
                        </div>
                    </div>
                    {(photo.camera || photo.aperture || photo.exposure_time || photo.focal_length || photo.iso) &&
                        <div className="PhotoInfo-infoRow">
                            <Icon className="PhotoInfo-infoIcon" icon="camera" iconSize={infoIconSize} />
                            <div className="PhotoInfo-infoBody">
                                {photo.camera &&
                                    <h1>{photo.camera}</h1>
                                }
                                <div className="PhotoInfo-minorInfo hasColumns">
                                    {photo.aperture &&
                                        <div>{`\u0192/${photo.aperture}`}</div>
                                    }
                                    {photo.exposure_time &&
                                        <div>{formatShutterSpeed(photo.exposure_time)}</div>
                                    }
                                    {photo.focal_length &&
                                        <div>{`${photo.focal_length} mm`}</div>
                                    }
                                    {photo.iso &&
                                        <div>{`ISO ${photo.iso}`}</div>
                                    }
                                </div>
                            </div>
                        </div>
                    }
        <div>LatLng: {photo.lat}, {photo.lng}</div>
                    <div className="PhotoInfo-infoRow">
                        <FaIcon className="PhotoInfo-infoIcon" name="tags" style={{ fontSize: infoIconSize }} />
                        <TagEditor
                            className="PhotoInfo-tagEditor PhotoInfo-infoBody"
                            photo={props.photo}
                            photoDetail={props.photoDetail}
                            tags={props.tags}
                            setPhotoTags={props.setPhotoTags}
                        />
                    </div>
                </>
            )
        } else {
            // No photo selected
            body = (
                <NonIdealState
                    icon="insert"
                    title={msg('PhotoInfo_noSelection_title')}
                    description={msg('PhotoInfo_noSelection_message')}
                />
            )
        }
    
        return (
            <div className={classNames(props.className, 'PhotoInfo bp3-dark')} style={props.style}>
                <Toolbar className="PhotoInfo-topBar">
                    <span className="PhotoInfo-title">{msg('PhotoInfo_title')}</span>
                    <div className="pull-right">
                        <Button icon="cross" minimal={true} onClick={props.closeInfo} />
                    </div>
                </Toolbar>
                {body}
            </div>
        )
    }

}


function formatImageMegaPixel(width, height): string {
    const sizeMp = width * height / 1000000
    return `${formatNumber(sizeMp, 1)} MP`
}

function formatFileSize(bytes: number | null): string {
    if (bytes === null) {
        return '...'
    } else if (bytes < 1000) {
        return `${bytes} byte`
    } else if (bytes < 1000000) {
        return `${formatNumber(bytes / 1000, 1)} kB`
    } else {
        return `${formatNumber(bytes / 1000000, 1)} MB`
    }
}

function formatShutterSpeed(exposureTime: number): string {
    return '1/' + Math.round(1 / exposureTime)
}
