import { BaseCanvas } from "@figurl/core-views";
import { FunctionComponent, useCallback, useMemo } from "react";

type Props ={
	width: number
	height: number
	image: number[][][]
	viewRect: {x: number, y: number, w: number, h: number}
}

const emptyDrawData = {}

const FrameImage: FunctionComponent<Props> = ({width, height, image, viewRect}) => {
	const imageData = useMemo(() => {
		const N1 = image.length
		const N2 = image[0].length
        const data: number[] = []
		for (let y = 0; y < N2; y++) {
			for (let x = 0; x < N1; x++) {
				const c = [image[x][y][0], image[x][y][1], image[x][y][2], 255]
				data.push(...c)
			}
		}
        const clampedData = Uint8ClampedArray.from(data)
        const imageData = new ImageData(clampedData, N1, N2)
        return imageData
    }, [image])
	const offscreenCanvas = useMemo(() => (
		document.createElement('canvas')
	), [])
	const paint = useCallback((context: CanvasRenderingContext2D) => {
		offscreenCanvas.width = imageData.width
        offscreenCanvas.height = imageData.height
        const c = offscreenCanvas.getContext('2d')
        if (!c) return
        c.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height)
        c.putImageData(imageData, 0, 0)

        // Scaling the offscreen canvas can be done when it's drawn in, which avoids having to deal with transforms and some margin issues.
        context.clearRect(0, 0, context.canvas.width, context.canvas.height)
        context.drawImage(offscreenCanvas, viewRect.x, viewRect.y, viewRect.w, viewRect.h)
    }, [offscreenCanvas, imageData, viewRect])
	return (
		<BaseCanvas
			width={width}
			height={height}
			draw={paint}
			drawData={emptyDrawData}
		/>
	)
}

export default FrameImage
