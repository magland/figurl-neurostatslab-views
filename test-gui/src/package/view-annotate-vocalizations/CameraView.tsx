import { useTimeFocus } from "@figurl/timeseries-views";
import { FunctionComponent } from "react";
import VideoFrameView from "./VideoFrameView";

type Props ={
	width: number
	height: number
}

const CameraView: FunctionComponent<Props> = ({width, height}) => {
	const {focusTime} = useTimeFocus()
	return (
		<VideoFrameView
			width={width}
			height={height}
			timeSec={focusTime}
			src="https://storage.googleapis.com/figurl/tmp/test1"
		/>
	)
}

export default CameraView
