import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback, useState } from "react";
import { useVocalizations } from "../context-vocalizations";
import CameraViewArea from "./CameraViewArea";

type Props ={
	width: number
	height: number
	video: {
		uri: string,
		width: number
		height: number
		samplingFrequency: number
	}
	canEditPose: boolean
}

const CameraView: FunctionComponent<Props> = ({width, height, video, canEditPose}) => {
	const topPanelHeight = 100
	const viewAreaWidth = width
	const viewAreaHeight = height - topPanelHeight
	const {selectedVocalization, removePose, setBox} = useVocalizations()
	const [annotatingBox, setAnnotatingBox] = useState(false)
	const handleClearPose = useCallback(() => {
		selectedVocalization && removePose(selectedVocalization?.vocalizationId)
	}, [selectedVocalization, removePose])

	const clearPoseEnabled = canEditPose && ((selectedVocalization?.pose?.points.length || 0) > 0)
	const annotateBoxEnabled = !annotatingBox

	const handleSelectRect = useCallback((box: {x: number, y: number, w: number, h: number}) => {
		if (annotatingBox) {
			setBox(box)
			setAnnotatingBox(false)
		}
	}, [setBox, annotatingBox])

	return (
		<div style={{position: 'absolute', width, height}}>
			{
				canEditPose && selectedVocalization ? (
					<h3>Pose for vocalization {selectedVocalization.vocalizationId}</h3>
				) : (
					<h3>No associated vocalization</h3>
				)
			}
			<div>
				<Button disabled={!clearPoseEnabled} onClick={handleClearPose}>Clear pose</Button>
				<Button disabled={!annotateBoxEnabled} onClick={() => setAnnotatingBox(true)}>Annotate box</Button>
				{annotatingBox && <span>Select a box</span>}
			</div>
			<div style={{position: 'absolute', top: topPanelHeight, width: viewAreaWidth, height: viewAreaHeight}}>
				<CameraViewArea
					width={viewAreaWidth}
					height={viewAreaHeight}
					video={video}
					canEditPose={canEditPose}
					onSelectRect={handleSelectRect}
				/>
			</div>
		</div>
	)
}

export default CameraView
