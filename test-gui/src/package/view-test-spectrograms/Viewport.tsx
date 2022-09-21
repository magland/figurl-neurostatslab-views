import React, { FunctionComponent, useCallback, useMemo } from "react";
import { PostureAnnotation } from "./types";
import FrameImage, {useImageViewRect} from './FrameImage'
import { useWheelZoom } from "@figurl/spike-sorting-views";
import { Scene2d, Scene2dObject } from "../component-scene2d";

type Props ={
	width: number
	height: number
	image?: number[][][]
	postureAnnotation?: PostureAnnotation
	onMoveMarker: (o: {key: string, x: number, y: number}) => void
	onClick: (o: {x: number, y: number}) => void
}

const Viewport: FunctionComponent<Props> = ({width, height, image, postureAnnotation, onMoveMarker, onClick}) => {
	const viewRect = useImageViewRect({width, height, image})

	const {affineTransform, handleWheel} = useWheelZoom(width, height)

	const objects: Scene2dObject[] = useMemo(() => {
		if ((!postureAnnotation) || (!image)) return []
		const ret: Scene2dObject[] = []
		postureAnnotation.markers.forEach((mm, ii) => {
			const s = viewRect.w / image.length
			ret.push({
				type: 'marker',
				draggable: true,
				objectId: mm.key,
				x: viewRect.x + (mm.x + 0.5) * s,
				y: viewRect.y + (mm.y + 0.5) * s,
				attributes: {fillColor: colorForMarkerKey(mm.key), radius: 3}
			})
			if (ii > 0) {
				const mmPrev = postureAnnotation.markers[ii - 1]
				ret.push({
					type: 'connector',
					objectId: `connector-${ii}`,
					objectId1: mmPrev.key,
					objectId2: mm.key,
					attributes: {color: 'yellow', dash: [5, 5]}
				})
			}
		}, [])
		return ret
	}, [postureAnnotation, viewRect, image])

	const handleDragObject = useCallback((objectId: string, p: {x: number, y: number}, e: React.MouseEvent) => {
        // change object position when it is dragged
        console.info('DRAG OBJECT', objectId, p, e.ctrlKey, e.shiftKey)
		const x = Math.floor((p.x - viewRect.x) / viewRect.w * (image?.length || 0))
		const y = Math.floor((p.y - viewRect.y) / viewRect.h * ((image || [])[0]?.length || 0))
		onMoveMarker({
			key: objectId,
			x,
			y
		})
    }, [onMoveMarker, image, viewRect])

	const handleClick = useCallback((p: {x: number, y: number}, e: React.MouseEvent) => {
		const x = Math.floor((p.x - viewRect.x) / viewRect.w * (image?.length || 0))
		const y = Math.floor((p.y - viewRect.y) / viewRect.h * ((image || [])[0]?.length || 0))
		onClick({
			x,
			y
		})
    }, [onClick, image, viewRect])

	return (
		<div
			onWheel={handleWheel}
		>
			{image && <FrameImage
				width={width}
				height={height}
				image={image}
				affineTransform={affineTransform}
			/>}
			<Scene2d
				width={width}
				height={height}
				objects={objects}
				onDragObject={handleDragObject}
				onClick={handleClick}
				affineTransform={affineTransform}
			/>
		</div>
	)
}

const colorForMarkerKey = (key: string) => {
	if (key === 'A') return 'orange'
	else if (key === 'B') return 'magenta'
	else return 'yellow'
}

export default Viewport
