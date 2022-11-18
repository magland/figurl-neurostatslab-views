import { FunctionComponent } from "react";
import ControlPanelBottomArea from "./ControlPanelBottomArea";
import ControlPanelTopArea from "./ControlPanelTopArea";

type Props ={
	width: number
	height: number
}

const ControlPanel: FunctionComponent<Props> = ({width, height}) => {
	// wire frame from Claire: https://user-images.githubusercontent.com/3679296/202719295-e69aa895-7a67-4acc-a795-c1ca70d0a783.png
	const topHeight = height / 2
	const bottomHeight = height / 2
	return (
		<div>
			<div style={{position: 'absolute', width, height: topHeight}}>
				<ControlPanelTopArea width={width} height={topHeight} />
			</div>
			<div style={{position: 'absolute', width, height: bottomHeight, top: topHeight}}>
				<ControlPanelBottomArea width={width} height={bottomHeight} />
			</div>
		</div>
	)
}

export default ControlPanel
