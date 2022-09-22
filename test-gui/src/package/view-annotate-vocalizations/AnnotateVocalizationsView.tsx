import { Splitter } from "@figurl/core-views";
import { AnnotationContext } from "@figurl/timeseries-views";
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
	const {vocalizations} = useVocalizations()
	const {annotationDispatch} = useContext(AnnotationContext)
	useEffect(() => {
		if (!annotationDispatch) return
		annotationDispatch({
			type: 'setAnnotationState',
			annotationState: {
				annotations: vocalizations.map(v => ({
					type: 'time-interval',
					annotationId: v.vocalizationId,
					label: v.label,
					timeIntervalSec: v.timeIntervalSec
				}))
			}
		})
	}, [vocalizations, annotationDispatch])
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
