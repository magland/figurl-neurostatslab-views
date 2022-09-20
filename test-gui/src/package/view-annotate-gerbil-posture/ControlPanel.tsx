import { Button, Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import { FunctionComponent } from "react";

type Props ={
	width: number
	height: number
	numFrames: number
	currentFrameIndex: number
	currentFrameId: string
	setCurrentFrameIndex: (x: number) => void
	onSavePostureAnnotations: () => void
}

const ControlPanel: FunctionComponent<Props> = ({width, height, numFrames, currentFrameIndex, currentFrameId, setCurrentFrameIndex, onSavePostureAnnotations}) => {
	return (
		<div style={{position: 'absolute', width, height, background: 'pink'}}>
			<Table>
				<TableBody>
					<TableRow>
						<TableCell>Frame index:</TableCell>
						<TableCell>{currentFrameIndex} / {numFrames}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Frame ID:</TableCell>
						<TableCell>{currentFrameId}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<hr />
			<Button onClick={() => setCurrentFrameIndex(currentFrameIndex - 1)} disabled={currentFrameIndex <= 0}>{`<<`} Previous frame</Button>
			<Button onClick={() => setCurrentFrameIndex(currentFrameIndex + 1)} disabled={currentFrameIndex >= numFrames - 1}>Next frame {`>>`}</Button>
			<hr />
			<Button onClick={onSavePostureAnnotations}>Save posture annotations</Button>
		</div>
	)
}

export default ControlPanel
