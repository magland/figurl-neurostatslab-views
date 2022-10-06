import { Splitter } from '@figurl/core-views';
import { useTimeFocus } from '@figurl/timeseries-views';
import { FunctionComponent, useMemo } from 'react';
import { useVocalizations } from '../context-vocalizations';
import CameraView from './CameraView';
import CurrentVocalizationControl from './CurrentVocalizationControl';
import SavePanel from './SavePanel';
import VocalizationsTable from './VocalizationsTable';

type Props = {
    width: number
    height: number
    video?: {
		uri: string,
		width: number
		height: number
		samplingFrequency: number
	}
    samplingFrequencies: {audio: number, video: number}
}

const ControlWidget: FunctionComponent<Props> = ({width, height, video, samplingFrequencies}) => {
    const {focusTime} = useTimeFocus()
    const {selectedVocalization, vocalizationState} = useVocalizations()
    const canEditPose = useMemo(() => {
        if (!selectedVocalization) return false
        if (!vocalizationState) return false
        if (!video) return false
        if (focusTime === undefined) return false
        const vocalizationStartTime = selectedVocalization.startFrame / vocalizationState.samplingFrequency
        const focusVideoFrame = Math.floor(focusTime * video.samplingFrequency)
        const vocalizationStartVideoFrame = Math.floor(vocalizationStartTime * video.samplingFrequency)
        if (focusVideoFrame === vocalizationStartVideoFrame) {
            return true
        }
        return false
    }, [focusTime, selectedVocalization, video, vocalizationState])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={500}
        >
            <VocalizationsTable
                width={0}
                height={0}
            />
            <Splitter
                width={0}
                height={0}
                initialPosition={300}
            >
                <CurrentVocalizationControl
                    width={0}
                    height={0}
                />
                <Splitter
                    width={0}
                    height={0}
                    initialPosition={300}
                >
                    <SavePanel
                        videoSamplingFrequency={samplingFrequencies.video}
                    />
                    {
                        video ? (
                            <CameraView
                                width={0}
                                height={0}
                                video={video}
                                canEditPose={canEditPose}
                            />
                        ) : <div />
                    }
                </Splitter>
            </Splitter>
        </Splitter>
        // <div style={{margin: 20}}>
        //     <h3>Vocalizations</h3>
        //     <hr />

        //     <h4>Time intervals</h4>
        //     <pre>(Use shift+click)</pre>
        //     Selected (sec): {focusTimeIntervalSeconds !== undefined ? formatTimeInterval(focusTimeIntervalSeconds) : 'undefined'}
        //     <Button disabled={focusTimeIntervalSeconds === undefined} onClick={handleAddTimeInterval}>Add time interval</Button>
        //     <div style={{overflowY: 'auto', height: 160}}>
        //         <NiceTable
        //             rows={timeIntervalRows}
        //             columns={timeIntervalColumns}
        //             onDeleteRow={handleDelete}
        //         />
        //     </div>
        //     <hr />

        //     <Button disabled={!saveEnabled} onClick={handleSave}>Save vocalizations</Button>
        // </div>
    )
}


// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: Object, space: string | number | undefined =undefined ) => {
    var allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}

export default ControlWidget