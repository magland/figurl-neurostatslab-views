import { randomAlphaString } from "@figurl/core-utils";
import { Splitter } from "@figurl/core-views";
import { useUrlState } from "@figurl/interface";
import { AnnotationContext, useTimeFocus } from "@figurl/timeseries-views";
import { FunctionComponent, KeyboardEventHandler, useCallback, useContext, useEffect, useMemo } from "react";
import { useVocalizations } from "../context-vocalizations";
import { AnnotateVocalizationsViewData } from "./AnnotateVocalizationsViewData";
import ControlWidget from "./ControlWidget";
import ControlWidgetOld from "./ControlWidgetOld";
import SpectrogramWidget from "./SpectrogramWidget";
import { timeIntervalForVocalization } from "./VocalizationsTable";

type Props = {
	data: AnnotateVocalizationsViewData
	width: number
	height: number
}

const AnnotateVocalizationsView: FunctionComponent<Props> = ({data, width, height}) => {
	const {spectrogram, video} = data
	const {vocalizations, vocalizationState, setSelectedVocalizationId, selectNextVocalization, selectPreviousVocalization, selectRandomVocalizationWithoutPose, addVocalizationLabel, removeVocalizationLabel, selectedVocalization, addVocalization} = useVocalizations()
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
	
	const {focusTime, focusTimeInterval} = useTimeFocus()
	const focusFrameInterval = useMemo(() => {
		if (!vocalizationState) return undefined
		if (!focusTimeInterval) return undefined
		return [
			Math.floor(focusTimeInterval[0] * vocalizationState.samplingFrequency),
			Math.ceil(focusTimeInterval[1] * vocalizationState.samplingFrequency)
		]
	}, [vocalizationState, focusTimeInterval])

	useEffect(() => {
		// when focus time changes, set vocalization ID
		if (focusTime === undefined) {
			setSelectedVocalizationId(undefined)
			return
		}
		if (vocalizationState === undefined) return
		const focusFrame = Math.floor(focusTime * vocalizationState.samplingFrequency)
		for (let v of vocalizations) {
			if ((v.startFrame <= focusFrame) && (focusFrame < v.endFrame)) {
				setSelectedVocalizationId(v.vocalizationId)
				return
			}
		}
		setSelectedVocalizationId(undefined)
	}, [focusTime, vocalizations, vocalizationState, setSelectedVocalizationId])

    const handleKeyDown: KeyboardEventHandler<HTMLDivElement> = useCallback((e) => {
		if ((e.key === '>') && (e.shiftKey) && (!e.ctrlKey)) {
			selectNextVocalization()
		}
		if ((e.key === '<') && (e.shiftKey) && (!e.ctrlKey)) {
			selectPreviousVocalization()
		}
		if ((e.key === 'r') && (!e.shiftKey) && (!e.ctrlKey)) {
			selectRandomVocalizationWithoutPose()
		}
		if ((e.key === 'a') && (!e.shiftKey) && (!e.ctrlKey)) {
			if (selectedVocalization) {
				addVocalizationLabel(selectedVocalization.vocalizationId, 'accept')
			}
			else if (focusFrameInterval) {
				const id = randomAlphaString(10)
				addVocalization({
					vocalizationId: id,
					labels: ['accept'],
					startFrame: focusFrameInterval[0],
					endFrame: focusFrameInterval[1]
				})
			}
		}
		if ((e.key === 'u') && (!e.shiftKey) && (!e.ctrlKey)) {
			if (!selectedVocalization) return
			removeVocalizationLabel(selectedVocalization.vocalizationId, 'accept')
		}
		else if (e.key === 'd') {
			updateUrlState({dev: (urlState.dev !== true)})
		}
	}, [selectNextVocalization, selectPreviousVocalization, selectRandomVocalizationWithoutPose, addVocalizationLabel, selectedVocalization, removeVocalizationLabel, urlState, updateUrlState, addVocalization, focusFrameInterval])

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
					urlState.dev === true ? (
						<ControlWidgetOld
							width={0}
							height={0}
							video={video}
							samplingFrequencies={samplingFrequencies}
						/>
					) : (
						<ControlWidget
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
