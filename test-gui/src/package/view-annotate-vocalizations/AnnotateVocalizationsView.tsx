import { Splitter } from "@figurl/core-views";
import { useUrlState } from "@figurl/interface";
import { AnnotationContext, useTimeFocus } from "@figurl/timeseries-views";
import { FunctionComponent, KeyboardEventHandler, useCallback, useContext, useEffect, useMemo } from "react";
import { useVocalizations } from "../context-vocalizations";
import { AnnotateVocalizationsViewData } from "./AnnotateVocalizationsViewData";
import ControlWidget from "./ControlWidget";
import ControlWidgetDev from "./ControlWidgetDev";
import SpectrogramWidget from "./SpectrogramWidget";
import { timeIntervalForVocalization } from "./VocalizationsTable";

type Props = {
	data: AnnotateVocalizationsViewData
	width: number
	height: number
}

const AnnotateVocalizationsView: FunctionComponent<Props> = ({data, width, height}) => {
	const {spectrogram, video} = data
	const {vocalizations, setSelectedVocalizationId, vocalizationState, selectNextVocalization, selectPreviousVocalization, selectRandomVocalizationWithoutPose, addVocalizationLabel, selectedVocalization, removeVocalizationLabel} = useVocalizations()
	const {focusTime} = useTimeFocus()
	const {annotationDispatch} = useContext(AnnotationContext)
	const {urlState, updateUrlState} = useUrlState()
	const samplingFrequencies = useMemo(() => ({
		audio: spectrogram.samplingFrequency,
		video: video?.samplingFrequency || 1
	}), [spectrogram, video])
	useEffect(() => {
		if (!annotationDispatch) return
		annotationDispatch({
			type: 'setAnnotationState',
			annotationState: {
				annotations: vocalizations.map(v => {
					const timeIntervalSec = timeIntervalForVocalization(vocalizationState, v)
					if (timeIntervalSec === undefined) throw Error('unexpected')
					return {
						type: 'time-interval',
						annotationId: v.vocalizationId,
						label: '',
						timeIntervalSec,
						fillColor: v.labels.includes('accept') ? ((v.pose && v.pose.points.length >= 2) ? 'rgb(180, 255, 180)' : 'rgb(255, 255, 180)') : 'rgb(245, 240, 200)',
						strokeColor: v.labels.includes('accept') ? ((v.pose && v.pose.points.length >= 2) ? 'rgb(180, 255, 100)' : 'rgb(255, 255, 100)') : 'rgb(235, 230, 200)'
					}
				})
			}
		})
	}, [vocalizations, annotationDispatch, vocalizationState])
	useEffect(() => {
		// when focus time changes, set vocalization ID
		if (focusTime === undefined) return
		if (vocalizationState === undefined) return
		const focusFrame = Math.floor(focusTime * vocalizationState.samplingFrequency)
		for (let v of vocalizations) {
			if ((v.startFrame <= focusFrame) && (focusFrame < v.endFrame)) {
				setSelectedVocalizationId(v.vocalizationId)
				return
			}
		}
	}, [focusTime, vocalizations, vocalizationState, setSelectedVocalizationId])
	const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback((e) => {
		if ((!e.ctrlKey) && (!e.shiftKey)) {
			if (e.key === 'n') {
				selectNextVocalization()
			}
			else if (e.key === 'p') {
				selectPreviousVocalization()
			}
			else if (e.key === 'r') {
				selectRandomVocalizationWithoutPose()
			}
			else if (e.key === 'a') {
				if (!selectedVocalization) return
				addVocalizationLabel(selectedVocalization.vocalizationId, 'accept')
			}
			else if (e.key === 'u') {
				if (!selectedVocalization) return
				removeVocalizationLabel(selectedVocalization.vocalizationId, 'accept')
			}
			else if (e.key === 'd') {
				updateUrlState({dev: (urlState.dev !== true)})
			}
		}
	}, [selectNextVocalization, selectPreviousVocalization, selectRandomVocalizationWithoutPose, addVocalizationLabel, selectedVocalization, removeVocalizationLabel, urlState, updateUrlState])
	return (
		<div
			onKeyDown={handleKeyDown}
			tabIndex={0}
		>
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
				{
					urlState.dev !== true ? (
						<ControlWidget
							width={0}
							height={0}
							video={video}
							samplingFrequencies={samplingFrequencies}
						/>
					) : (
						<ControlWidgetDev
							width={0}
							height={0}
							video={video}
							samplingFrequencies={samplingFrequencies}
						/>
					)
				}
			</Splitter>
		</div>
	)
}

export default AnnotateVocalizationsView
