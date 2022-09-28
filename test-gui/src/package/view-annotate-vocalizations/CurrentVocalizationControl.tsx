import { randomAlphaString } from "@figurl/core-utils";
import { useTimeFocus } from "@figurl/timeseries-views";
import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback, useMemo } from "react";
import { useVocalizations } from "../context-vocalizations";
import { formatTimeInterval } from './VocalizationsTable';

type Props ={
	width: number
    height: number
}

const CurrentVocalizationControl: FunctionComponent<Props> = ({width, height}) => {
	const {addVocalization, removeVocalization, addVocalizationLabel, removeVocalizationLabel, setSelectedVocalizationId, selectedVocalization, selectNextVocalization, selectPreviousVocalization} = useVocalizations()
	const {focusTimeInterval, focusTime} = useTimeFocus()
	const handleAddVocalization = useCallback(() => {
		if (!focusTimeInterval) return
		const id = randomAlphaString(10)
		addVocalization({
			vocalizationId: id,
			labels: ['accept'],
			timeIntervalSec: focusTimeInterval
		})
		setSelectedVocalizationId(id)
	}, [focusTimeInterval, addVocalization, setSelectedVocalizationId])
	const addVocalizationEnabled = useMemo(() => {
		if (!focusTimeInterval) return false
		if (selectedVocalization) {
			if ((selectedVocalization.timeIntervalSec[0] === focusTimeInterval[0]) && (selectedVocalization.timeIntervalSec[1] === focusTimeInterval[1])) {
				return false
			}
		}
		return true
	}, [focusTimeInterval, selectedVocalization])
	const handleAcceptVocalization = useCallback(() => {
		if (!selectedVocalization) return
		addVocalizationLabel(selectedVocalization.vocalizationId, 'accept')
		selectNextVocalization()
	}, [selectedVocalization, addVocalizationLabel, selectNextVocalization])
	const handleUnacceptVocalization = useCallback(() => {
		if (!selectedVocalization) return
		removeVocalizationLabel(selectedVocalization.vocalizationId, 'accept')

	}, [selectedVocalization, removeVocalizationLabel])
	const handleDeleteVocalization = useCallback(() => {
		if (!selectedVocalization) return
		removeVocalization(selectedVocalization.vocalizationId)
	}, [removeVocalization, selectedVocalization])
	return (
		<div>
			<h3>Selected time interval</h3>
			{
				focusTimeInterval ? (
					<div>
						{formatTimeInterval(focusTimeInterval)}
					</div>
				) : (
					<div>Use shift+click on the spectrogram</div>
				)
			}
			<Button disabled={!addVocalizationEnabled} onClick={handleAddVocalization}>Add vocalization</Button>
			<hr />
			<h3>Selected vocalization</h3>
			{
				selectedVocalization ? (
					<div>
						<div style={{padding: 5}}>
							ID: {selectedVocalization.vocalizationId}
						</div>
						<div style={{padding: 5}}>
							Time (sec): {formatTimeInterval(selectedVocalization.timeIntervalSec)}
						</div>
						<div style={{padding: 5}}>
							Labels: {selectedVocalization.labels.join(', ')}
						</div>
						<div>
							<Button disabled={selectedVocalization.labels.includes('accept')} onClick={handleAcceptVocalization}>Accept</Button>
							<Button disabled={!selectedVocalization.labels.includes('accept')} onClick={handleUnacceptVocalization}>Unaccept</Button>
							<Button onClick={handleDeleteVocalization}>Delete</Button>
						</div>
						<div>
							<Button onClick={selectPreviousVocalization}>{`<-- `}Previous</Button>
							<Button onClick={selectNextVocalization}>Next{` -->`}</Button>
						</div>
					</div>
				) : (
					<div>None selected</div>
				)
			}
			<hr />
			{
				focusTime !== undefined && (
					<div style={{padding: 5}}>
						Time (sec): {focusTime.toFixed(7)}
					</div>
				)
			}
		</div>
	)
}

export default CurrentVocalizationControl
