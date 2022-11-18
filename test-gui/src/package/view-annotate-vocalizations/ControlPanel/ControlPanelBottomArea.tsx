import { FunctionComponent } from "react";

type Props ={
	width: number
	height: number
}

const ControlPanelBottomArea: FunctionComponent<Props> = () => {
	// I recommend using material ui Grid, because we already have it installed
	// See https://mui.com/material-ui/react-grid/
	return (
		<div>
			Control panel bottom area. Recommend Material UI Grid.
		</div>
	)
}

export default ControlPanelBottomArea
