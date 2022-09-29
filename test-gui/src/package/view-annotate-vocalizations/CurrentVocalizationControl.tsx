import { randomAlphaString } from "@figurl/core-utils";
import { useTimeFocus } from "@figurl/timeseries-views";
import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback, useMemo } from "react";
import { useVocalizations } from "../context-vocalizations";
import { formatTimeInterval, timeIntervalForVocalization } from './VocalizationsTable';

type Props ={
	width: number
    height: number
}

const CurrentVocalizationControl: FunctionComponent<Props> = ({width, height}) => {
	const {addVocalization, removeVocalization, addVocalizationLabel, removeVocalizationLabel, setSelectedVocalizationId, selectedVocalization, selectNextVocalization, selectPreviousVocalization, vocalizationState} = useVocalizations()
	const {focusTimeInterval, focusTime} = useTimeFocus()
	const focusFrameInterval = useMemo(() => {
		if (!vocalizationState) return undefined
		if (!focusTimeInterval) return undefined
		return [
			Math.floor(focusTimeInterval[0] * vocalizationState.samplingFrequency),
			Math.ceil(focusTimeInterval[1] * vocalizationState.samplingFrequency)
		]
	}, [vocalizationState, focusTimeInterval])
	const handleAddVocalization = useCallback(() => {
		if (!focusFrameInterval) return
		const id = randomAlphaString(10)
		addVocalization({
			vocalizationId: id,
			labels: ['accept'],
			startFrame: focusFrameInterval[0],
			endFrame: focusFrameInterval[1]
		})
		setSelectedVocalizationId(id)
	}, [focusFrameInterval, addVocalization, setSelectedVocalizationId])
	const addVocalizationEnabled = useMemo(() => {
		if (!focusFrameInterval) return false
		if (selectedVocalization) {
			if ((selectedVocalization.startFrame === focusFrameInterval[0]) && (selectedVocalization.endFrame === focusFrameInterval[1])) {
				return false
			}
		}
		return true
	}, [focusFrameInterval, selectedVocalization])
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
							Time (sec): {formatTimeInterval(timeIntervalForVocalization(vocalizationState, selectedVocalization))}
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
