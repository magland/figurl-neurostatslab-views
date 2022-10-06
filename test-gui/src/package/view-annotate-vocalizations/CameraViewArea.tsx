import { useTimeFocus } from "@figurl/timeseries-views";
import { FunctionComponent, useMemo } from "react";
import PoseViewport from "./PoseViewport";
import useWheelZoom from "./useWheelZoom";
import VideoFrameView from "./VideoFrameView";

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

const CameraViewArea: FunctionComponent<Props> = ({width, height, video, canEditPose}) => {
	const {focusTime} = useTimeFocus()
	const W = video.width * height < video.height * width ? video.width * height / video.height : width
	const H = video.width * height < video.height * width ? height : video.height * width / video.width
	const rect = useMemo(() => ({
		x: (width - W)  / 2,
		y: (height - H) / 2,
		w: W,
		h: H
	}), [W, H, width, height])
	const {affineTransform, handleWheel} = useWheelZoom(rect.x, rect.y, rect.w, rect.h)
	return (
		<div style={{position: 'absolute', width, height}} onWheel={handleWheel}>
			<div className="video-frame" style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h}}>
				<VideoFrameView
					width={rect.w}
					height={rect.h}
					timeSec={focusTime}
					src={video.uri}
					affineTransform={affineTransform}
				/>
			</div>
			<div className="pose-viewport" style={{position: 'absolute', left: rect.x, top: rect.y, width: rect.w, height: rect.h}}>
				<PoseViewport
					width={rect.w}
					height={rect.h}
					videoWidth={video.width}
					videoHeight={video.height}
					canEditPose={canEditPose}
					videoSamplingFrequency={video.samplingFrequency}
					affineTransform={affineTransform}
				/>
			</div>
		</div>
	)
}

export default CameraViewArea
