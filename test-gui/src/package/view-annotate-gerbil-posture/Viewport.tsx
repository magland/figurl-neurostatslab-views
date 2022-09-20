import { Scene2d, Scene2dObject } from "@figurl/core-views";
import { FunctionComponent, useCallback, useMemo } from "react";
import FrameImage from "./FrameImage";
import { PostureAnnotation } from "./types";

type Props ={
	width: number
	height: number
	image?: number[][][]
	postureAnnotation?: PostureAnnotation
	onMoveMarker: (o: {key: string, x: number, y: number}) => void
}

const Viewport: FunctionComponent<Props> = ({width, height, image, postureAnnotation, onMoveMarker}) => {
	const viewRect: {x: number, y: number, w: number, h: number} = useMemo(() => {
		if (!image) return {x: 0, y: 0, w: 1, h: 1}
		const N1 = image.length
		const N2 = image[0].length
		if (N1 * height > N2 * width) {
			// constrained by width
			const s = width / N1
			return {x: 0, y: (height - N2 * s) / 2, w: width, h: N2 * s}
		}
		else {
			// constrained by height
			const s = height / N2
			return {x: (width - N1 * s) / 2, y: 0, w: N1 * s, h: height}
		}
	}, [image, width, height])

	const objects: Scene2dObject[] = useMemo(() => {
		if ((!postureAnnotation) || (!image)) return []
		const ret: Scene2dObject[] = []
		postureAnnotation.markers.forEach((mm, ii) => {
			const s = viewRect.w / image.length
			ret.push({
				type: 'marker',
				draggable: true,
				objectId: mm.key,
				x: viewRect.x + mm.x * s,
				y: viewRect.y + mm.y * s,
				attributes: {fillColor: colorForMarkerKey(mm.key)}
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

	return (
		<div>
			{image && <FrameImage
				width={width}
				height={height}
				image={image}
				viewRect={viewRect}
			/>}
			<Scene2d
				width={width}
				height={height}
				objects={objects}
				onDragObject={handleDragObject}
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
