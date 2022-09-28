import React, { FunctionComponent, useEffect, useMemo, useRef } from "react";

type Props ={
	src: string
	timeSec: number | undefined
	width: number
	height: number
}

const VideoFrameView: FunctionComponent<Props> = ({src, timeSec, width, height}) => {
	const canvasRef = useRef<any>(null)
	const video = useMemo(() => {
		const v = document.createElement('video')
		v.addEventListener('seeked', () => {
			const ctx: CanvasRenderingContext2D | undefined = canvasRef.current?.getContext('2d')
			if (!ctx) return
			const W = video.videoWidth
			const H = video.videoHeight
			const W2 = W * height < H * width ? W * height / H : width
			const H2 = W * height < H * width ? height : H * width / W
			ctx.clearRect(0, 0, width, height)
			ctx.drawImage(video, (width - W2) / 2, (height - H2) / 2, W2, H2)
		})
		v.src = src
		return v
	}, [src, width, height])
	useEffect(() => {
		if (timeSec !== undefined) {
			video.currentTime = timeSec
		}
	}, [video, timeSec])
	return (
		<canvas
			ref={canvasRef}
			width={width}
			height={height}
		/>
	)
}

export default VideoFrameView
