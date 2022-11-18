import { Hyperlink } from "@figurl/core-views";
import { FunctionComponent } from "react";

type Props ={
	width: number
	height: number
}

const ControlPanelTopArea: FunctionComponent<Props> = () => {
	return (
		<div>
			Control panel top area. <Hyperlink href="https://user-images.githubusercontent.com/3679296/202719295-e69aa895-7a67-4acc-a795-c1ca70d0a783.png" target="_blank">See this wireframe</Hyperlink>
		</div>
	)
}

export default ControlPanelTopArea
