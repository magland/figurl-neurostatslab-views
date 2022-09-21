import { Button, Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import React, { FunctionComponent } from "react";
import { TSEvent } from "./TestSpectrogramsViewData";

type Props ={
	width: number
	height: number
	numEvents: number
	currentEventIndex: number
	currentEvent: TSEvent
	setCurrentEventIndex: (x: number) => void
	onSavePostureAnnotations: () => void
}

const ControlPanel: FunctionComponent<Props> = ({width, height, numEvents, currentEventIndex, currentEvent, setCurrentEventIndex, onSavePostureAnnotations}) => {
	return (
		<div style={{position: 'absolute', width: width - 40, height: height - 40, background: 'pink', padding: 20}}>
			<Table>
				<TableBody>
					<TableRow>
						<TableCell>Event index:</TableCell>
						<TableCell>{currentEventIndex} / {numEvents}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Timepoint:</TableCell>
						<TableCell>{currentEvent.t}</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>Event ID:</TableCell>
						<TableCell>{currentEvent.eventId}</TableCell>
					</TableRow>
				</TableBody>
			</Table>
			<hr />
			<Button onClick={() => setCurrentEventIndex(currentEventIndex - 1)} disabled={currentEventIndex <= 0}>{`<<`} Previous Event</Button>
			<Button onClick={() => setCurrentEventIndex(currentEventIndex + 1)} disabled={currentEventIndex >= numEvents - 1}>Next Event {`>>`}</Button>
			<hr />
			<Button onClick={onSavePostureAnnotations}>Save posture annotations</Button>
			<hr />
			<h3>Notes</h3>
			<ul>
				<li>Click image to set first and second markers</li>
				<li>Click-drag to adjust positions of the markers</li>
				<li>Use Shift+[mouse-wheel] to zoom in on the image</li>
				<li>Click "NEXT" above to advance to the next event</li>
				<li>Click "SAVE" above to save the annotations in the cloud. The shareable URL in the address bar will update.</li>
			</ul>
		</div>
	)
}

export default ControlPanel
