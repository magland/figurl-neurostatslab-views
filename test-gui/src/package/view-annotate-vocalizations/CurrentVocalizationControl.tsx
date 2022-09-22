import { randomAlphaString } from "@figurl/core-utils";
import { useTimeFocus } from "@figurl/timeseries-views";
import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback } from "react";
import { useVocalizations } from "../context-vocalizations";
import { formatTimeInterval } from './VocalizationsTable';

type Props ={
	width: number
    height: number
}

const CurrentVocalizationControl: FunctionComponent<Props> = ({width, height}) => {
	const {addVocalization, setSelectedVocalizationId} = useVocalizations()
	const {focusTimeInterval} = useTimeFocus()
	const handleAddVocalization = useCallback(() => {
		if (!focusTimeInterval) return
		const id = randomAlphaString(10)
		addVocalization({
			vocalizationId: id,
			label: '',
			timeIntervalSec: focusTimeInterval
		})
		setSelectedVocalizationId(id)
	}, [focusTimeInterval, addVocalization, setSelectedVocalizationId])
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
			<Button disabled={!focusTimeInterval} onClick={handleAddVocalization}>Add vocalization</Button>
		</div>
	)
}

export default CurrentVocalizationControl
