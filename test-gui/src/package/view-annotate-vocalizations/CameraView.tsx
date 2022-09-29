import { FunctionComponent } from "react";
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
	const topPanelHeight = 50
	const viewAreaWidth = width
	const viewAreaHeight = height - topPanelHeight
	const {selectedVocalization} = useVocalizations()
	return (
		<div style={{position: 'absolute', width, height}}>
			{
				canEditPose && selectedVocalization ? (
					<h3>Pose for vocalization {selectedVocalization.vocalizationId}</h3>
				) : (
					<h3>No associated vocalization</h3>
				)
			}
			<div style={{position: 'absolute', top: topPanelHeight, width: viewAreaWidth, height: viewAreaHeight}}>
				<CameraViewArea
					width={viewAreaWidth}
					height={viewAreaHeight}
					video={video}
					canEditPose={canEditPose}
				/>
			</div>
		</div>
	)
}

export default CameraView
