import { Splitter } from "@figurl/core-views";
import { getFileData, storeFileData, useUrlState } from "@figurl/interface";
import { FunctionComponent, useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { AnnotateGerbilPostureViewData } from "./AnnotateGerbilPostureViewData";
import ControlPanel from "./ControlPanel";
import { PostureAnnotation, postureAnnotationsReducer } from "./types";
import Viewport from "./Viewport";

type Props ={
	data: AnnotateGerbilPostureViewData
	width: number
	height: number
}

const AnnotateGerbilPostureView: FunctionComponent<Props> = ({data, width, height}) => {
	const {frames} = data

	const [postureAnnotations, postureAnnotationsDispatch] = useReducer(postureAnnotationsReducer, [])

	const {urlState, updateUrlState} = useUrlState()
	const [initialized, setInitialized] = useState(false)

	useEffect(() => {
		if (initialized) return
		setInitialized(true)
		const uri = urlState.postureAnnotations
		if (uri) {
			getFileData(uri, () => {}).then(x => {
				console.log('--- x', x)
				postureAnnotationsDispatch({type: 'setPostureAnnotations', postureAnnotations: x})
			})
		}
	}, [urlState, initialized])

	const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
	const currentFrameId: string | undefined = useMemo(() => (
		frames[currentFrameIndex]?.frameId
	), [frames, currentFrameIndex])
	const currentPostureAnnotation: PostureAnnotation | undefined = useMemo(() => (
		postureAnnotations.filter(x => (x.frameId === currentFrameId))[0]
	), [postureAnnotations, currentFrameId])
	useEffect(() => {
		if ((currentFrameId) && (!currentPostureAnnotation)) {
			postureAnnotationsDispatch({
				type: 'setPostureAnnotation',
				frameId: currentFrameId,
				markers: [
					{x: 100, y: 100, key: 'A'},
					{x: 200, y: 100, key: 'B'}
				]
			})
		}
	}, [currentPostureAnnotation, currentFrameId])
	const image: number[][][] | undefined = useMemo(() => (
		frames[currentFrameIndex]?.image
	), [frames, currentFrameIndex])

	const handleMoveMarker = useCallback((o: {key: string, x: number, y: number}) => {
		postureAnnotationsDispatch({
			type: 'setPostureAnnotationMarker',
			frameId: currentFrameId,
			marker: {
				key: o.key,
				x: o.x,
				y: o.y
			}
		})
    }, [currentFrameId])

	const handleSavePostureAnnotations = useCallback(() => {
		const x = JSONStringifyDeterministic(postureAnnotations)
		storeFileData(x).then((uri) => {
			updateUrlState({postureAnnotations: uri})
		})
	}, [postureAnnotations, updateUrlState])

	return (
		<Splitter
			width={width}
			height={height}
			initialPosition={Math.min(400, width / 2)}
		>
			<ControlPanel
				width={0}
				height={0}
				numFrames={frames.length}
				currentFrameIndex={currentFrameIndex}
				currentFrameId={currentFrameId}
				setCurrentFrameIndex={setCurrentFrameIndex}
				onSavePostureAnnotations={handleSavePostureAnnotations}
			/>
			<Viewport
				width={0}
				height={0}
				image={image}
				postureAnnotation={currentPostureAnnotation}
				onMoveMarker={handleMoveMarker}
			/>
		</Splitter>
	)
}

// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: Object, space: string | number | undefined =undefined ) => {
    var allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}

export default AnnotateGerbilPostureView
