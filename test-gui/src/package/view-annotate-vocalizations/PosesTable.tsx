import { Hyperlink, NiceTable, NiceTableColumn, NiceTableRow } from "@figurl/core-views";
import { FunctionComponent, useMemo } from "react";
import { usePoses } from "../context-poses";
import { timeForPose } from "../context-poses/PoseContext";
import { useVocalizations, Vocalization } from "../context-vocalizations";

type Props ={
	width: number
	height: number
    samplingFrequencies: {audio: number, video: number}
}

const columns: NiceTableColumn[] = [
    {
        key: 'time',
        label: 'Time'
    },
    {
        key: 'numPoints',
        label: 'Num. pts.'
    },
    {
        key: 'vocalization',
        label: 'Vocalization'
    }
]

const PosesTable: FunctionComponent<Props> = ({width, height, samplingFrequencies}) => {
    const {vocalizations, vocalizationState} = useVocalizations()
	const {poses, selectedPose, setSelectedPose, poseState} = usePoses(samplingFrequencies.video)
    const vocalizationsByVideoFrame: {[f: number]: Vocalization} = useMemo(() => {
        if (!vocalizationState) return {}
        if (!poseState) return {}
        const vocalizationsByVideoFrame: {[f: number]: Vocalization} = {}
        for (let v of vocalizations) {
            const t = v.startFrame / samplingFrequencies.audio
            const f = Math.floor(t * samplingFrequencies.video)
            vocalizationsByVideoFrame[f] = v
        }
        return vocalizationsByVideoFrame
    }, [poseState, vocalizationState, vocalizations, samplingFrequencies])
	const rows: NiceTableRow[] = useMemo(() => {
        return poses.map((x, i) => {
			const handleClick = () => {
				setSelectedPose(x.frame)
			}
            return {
                key: `${x.frame}`,
                columnValues: {
                    time: {
                        element: <Hyperlink onClick={handleClick}>{timeForPose(x, samplingFrequencies.video)}</Hyperlink>
                    },
                    numPoints: {
                        text: `${x.points.length}`
                    },
                    vocalization: {
                        text: vocalizationsByVideoFrame[x.frame]?.vocalizationId || ''
                    }
                }
            }
        })
    }, [poses, setSelectedPose, vocalizationsByVideoFrame, samplingFrequencies])
	const selectedKeys = useMemo(() => (
		selectedPose ? [`${selectedPose.frame}`] : []
	), [selectedPose])
    const topAreaHeight = 90
	return (
        <div>
            <h3>Poses</h3>
            <p>[Use Shift+[mouse-wheel] to zoom on the video frame]</p>
            <div style={{position: 'absolute', top: topAreaHeight, width, height: height - topAreaHeight, overflowY: 'auto'}}>
                <NiceTable
                    columns={columns}
                    rows={rows}
                    // onDeleteRow={handleDelete}
                    selectedRowKeys={selectedKeys}
                    selectionMode="single"
                    onSelectedRowKeysChanged={(keys: string[]) => setSelectedPose(parseInt(keys[0]))}
                />
            </div>
        </div>
	)
}

export default PosesTable
