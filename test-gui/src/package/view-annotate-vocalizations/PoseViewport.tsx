import { Scene2d } from "@figurl/core-views";
import { FunctionComponent, useCallback, useMemo } from "react";
import { Scene2dObject } from "../component-scene2d";
import { usePoses } from "../context-poses";

type Props ={
	width: number
	height: number
	videoWidth: number
	videoHeight: number
	canEditPose: boolean
    videoSamplingFrequency: number
}

const PoseViewport: FunctionComponent<Props> = ({width, height, videoWidth, videoHeight, canEditPose, videoSamplingFrequency}) => {
	const {selectedPose, addPosePoint, movePosePoint} = usePoses(videoSamplingFrequency)

	const objects: Scene2dObject[] = useMemo(() => {
		if (!selectedPose) return []
		const ret: Scene2dObject[] = []
		selectedPose.points.forEach((pp, ii) => {
			const qq = {x: (pp.x + 0.5) / videoWidth * width, y: (pp.y + 0.5) / videoHeight * height}
			ret.push({
				type: 'marker',
				draggable: canEditPose ? true : false,
				objectId: `pt-${ii}`,
				x: qq.x,
				y: qq.y,
				attributes: {fillColor: colorForPointIndex(ii), radius: 5}
			})
			if (ii > 0) {
				ret.push({
					type: 'connector',
					objectId: `connector-${ii}`,
					objectId1: `pt-${ii - 1}`,
					objectId2: `pt-${ii}`,
					attributes: {color: 'yellow', dash: [5, 5]}
				})
			}
		}, [])
		return ret
	}, [selectedPose, width, height, videoWidth, videoHeight, canEditPose])

	const handleClick = useCallback((p: {x: number, y: number}, e: React.MouseEvent) => {
		if (!canEditPose) return
		const x = Math.floor(p.x / width * videoWidth)
		const y = Math.floor(p.y / height * videoHeight)
		if ((selectedPose?.points.length || 0) < 2) {
			addPosePoint({
				x,
				y
			})
		}
    }, [addPosePoint, selectedPose, width, height, videoWidth, videoHeight, canEditPose])

	const handleDragObject = useCallback((objectId: string, p: {x: number, y: number}, e: React.MouseEvent) => {
		if (!canEditPose) return
		const x = Math.floor(p.x / width * videoWidth)
		const y = Math.floor(p.y / height * videoHeight)
		const pointIndex = parseInt(objectId.slice(`pt-`.length))
		movePosePoint(pointIndex, {x, y})
    }, [width, height, videoWidth, videoHeight, movePosePoint, canEditPose])

	return (
		<Scene2d
			width={width}
			height={height}
			objects={objects}
			onDragObject={handleDragObject}
			onClick={handleClick}
		/>
	)
}

const colorForPointIndex = (ii: number) => {
	if (ii === 0) return 'orange'
	else if (ii === 1) return 'magenta'
	else return 'blue'
}

export default PoseViewport
