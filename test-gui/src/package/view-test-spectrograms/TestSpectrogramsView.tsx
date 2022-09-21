import { Splitter } from "@figurl/core-views";
import { getFileData, storeFileData, useUrlState } from "@figurl/interface";
import { JSONStringifyDeterministic } from "@figurl/interface/dist/viewInterface/kacheryTypes";
import { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import ControlPanel from "./ControlPanel";
import SpectrogramsWidget from "./SpectrogramsWidget";
import { TestSpectrogramsViewData } from "./TestSpectrogramsViewData";
import { PostureAnnotation, postureAnnotationsReducer } from "./types";
import Viewport from "./Viewport";

type Props ={
	data: TestSpectrogramsViewData
	width: number
	height: number
}

const TestSpectrogramsView: FunctionComponent<Props> = ({data, width, height}) => {
	const {events} = data

	const [currentEventIndex, setCurrentEventIndex] = useState(0)
	const currentEvent = useMemo(() => (
		events[currentEventIndex]
	), [events, currentEventIndex])
	const currentEventId = currentEvent.eventId

	//////////////////////////////////////////////////////////////////////////////////////
	// Posture annotations
	const [postureAnnotations, postureAnnotationsDispatch] = useReducer(postureAnnotationsReducer, [])

	const {urlState, updateUrlState} = useUrlState()
	const [initialized, setInitialized] = useState(false)

	useEffect(() => {
		if (initialized) return
		setInitialized(true)
		const uri = urlState.postureAnnotations
		if (uri) {
			getFileData(uri, () => {}).then(x => {
				postureAnnotationsDispatch({type: 'setPostureAnnotations', postureAnnotations: x})
			})
		}
	}, [urlState, initialized])
	const currentPostureAnnotation: PostureAnnotation | undefined = useMemo(() => (
		postureAnnotations.filter(x => (x.eventId === currentEventId))[0]
	), [postureAnnotations, currentEventId])
	useEffect(() => {
		if ((currentEventId) && (!currentPostureAnnotation)) {
			postureAnnotationsDispatch({
				type: 'setPostureAnnotation',
				eventId: currentEventId,
				markers: []
			})
		}
	}, [currentPostureAnnotation, currentEventId])
	const handleMoveMarker = useCallback((o: {key: string, x: number, y: number}) => {
		postureAnnotationsDispatch({
			type: 'setPostureAnnotationMarker',
			eventId: currentEventId,
			marker: {
				key: o.key,
				x: o.x,
				y: o.y
			}
		})
    }, [currentEventId])
	const handleClick = useCallback((o: {x: number, y: number}) => {
		postureAnnotationsDispatch({
			type: 'addPostureAnnotationMarker',
			eventId: currentEventId,
			x: o.x,
			y: o.y
		})
	}, [currentEventId])
	const handleSavePostureAnnotations = useCallback(() => {
		const x = JSONStringifyDeterministic(postureAnnotations)
		storeFileData(x).then((uri) => {
			updateUrlState({postureAnnotations: uri})
		})
	}, [postureAnnotations, updateUrlState])
	//////////////////////////////////////////////////////////////////////////////////////
	
	return (
		<Splitter
			width={width}
			height={height}
			initialPosition={400}
			adjustable={false}
		>
			<ControlPanel
				width={0}
				height={0}
				numEvents={events.length}
				currentEventIndex={currentEventIndex}
				currentEvent={currentEvent}
				setCurrentEventIndex={setCurrentEventIndex}
				onSavePostureAnnotations={handleSavePostureAnnotations}
			/>
			<Splitter
				width={0}
				height={0}
				initialPosition={(width - 400) / 2}
			>
				<SpectrogramsWidget
					width={0}
					height={0}
					spectrograms={currentEvent.spectrograms}
				/>
				<Viewport
					width={0}
					height={0}
					image={currentEvent.cameraImage}
					postureAnnotation={currentPostureAnnotation}
					onMoveMarker={handleMoveMarker}
					onClick={handleClick}
				/>
			</Splitter>
		</Splitter>
	)
}

export default TestSpectrogramsView
