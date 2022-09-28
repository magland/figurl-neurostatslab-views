import { Splitter } from "@figurl/core-views";
import { AnnotationContext, useTimeFocus } from "@figurl/timeseries-views";
import { FunctionComponent, useContext, useEffect } from "react";
import { useVocalizations } from "../context-vocalizations";
import { AnnotateVocalizationsViewData } from "./AnnotateVocalizationsViewData";
import ControlWidget from "./ControlWidget";
import SpectrogramWidget from "./SpectrogramWidget";

type Props ={
	data: AnnotateVocalizationsViewData
	width: number
	height: number
}

const AnnotateVocalizationsView: FunctionComponent<Props> = ({data, width, height}) => {
	const {spectrogram} = data
	const {vocalizations, setSelectedVocalizationId} = useVocalizations()
	const {focusTime} = useTimeFocus()
	const {annotationDispatch} = useContext(AnnotationContext)
	useEffect(() => {
		if (!annotationDispatch) return
		annotationDispatch({
			type: 'setAnnotationState',
			annotationState: {
				annotations: vocalizations.map(v => ({
					type: 'time-interval',
					annotationId: v.vocalizationId,
					label: '',
					timeIntervalSec: v.timeIntervalSec,
					fillColor: v.labels.includes('accept') ? 'rgb(180, 255, 180)' : 'rgb(245, 240, 200)',
					strokeColor: v.labels.includes('accept') ? 'rgb(150, 255, 150)' : 'rgb(235, 230, 200)'
				}))
			}
		})
	}, [vocalizations, annotationDispatch])
	useEffect(() => {
		// when focus time changes, set vocalization ID
		if (focusTime === undefined) return
		for (let v of vocalizations) {
			const a = v.timeIntervalSec
			if ((a[0] <= focusTime) && (focusTime <= a[1])) {
				setSelectedVocalizationId(v.vocalizationId)
				return
			}
		}
	}, [focusTime, vocalizations, setSelectedVocalizationId])
	return (
		<Splitter
			width={width}
			height={height}
			direction="vertical"
			initialPosition={400}
			adjustable={true}
		>
			<SpectrogramWidget
				width={0}
				height={0}
				spectrogram={spectrogram}
			/>
			<ControlWidget
				width={0}
				height={0}
			/>
		</Splitter>
	)
}

export default AnnotateVocalizationsView
