import { BaseCanvas } from "@figurl/core-views";
import { FunctionComponent, useCallback, useMemo } from "react";

type Props ={
	width: number
	height: number
	spectrograms: number[][][]
}

const emptyDrawData = {}

const SpectrogramsWidget: FunctionComponent<Props> = ({width, height, spectrograms}) => {
	const images = useMemo(() => {
		const ret: ImageData[] = []
		for (let spectrogram of spectrograms) {
			const nTimepoints = spectrogram.length
			const nFrequencies = spectrogram[0].length
			const data: number[] = []
			for (let ii = 0; ii < nFrequencies; ii++) {
				for (let it = 0; it < nTimepoints; it++) {
					const color = colorForSpectrogramValue(spectrogram[it][ii])
					const c = [color[0], color[1], color[2], 255]
					data.push(...c)
				}
			}
			const clampedData = Uint8ClampedArray.from(data)
			const imageData = new ImageData(clampedData, nTimepoints, nFrequencies)
			ret.push(imageData)
		}
        return ret
    }, [spectrograms])
	const paint = useCallback((context: CanvasRenderingContext2D) => {
		context.clearRect(0, 0, width, height)
		const spacing = 10
		const H = (height - (images.length - 1) * spacing) / (images.length)
		images.forEach((image, ii) => {
			const offscreenCanvas = document.createElement('canvas')
			offscreenCanvas.width = image.width
			offscreenCanvas.height = image.height
			const c = offscreenCanvas.getContext('2d')
			if (!c) return
			c.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height)
			c.putImageData(image, 0, 0)

			const rect = {
				x: 0,
				y: (H + spacing) * ii,
				w: width,
				h: H
			}

			context.drawImage(offscreenCanvas, rect.x, rect.y, rect.w, rect.h)
		})
    }, [images, width, height])
	
	return (
		<BaseCanvas
			width={width}
			height={height}
			draw={paint}
			drawData={emptyDrawData}
		/>
	)
}

const colorForSpectrogramValue = (v: number) => {
	return [50 + v, 50 + v, 50]
}

export default SpectrogramsWidget
