import { getFileDataUrl } from "@figurl/interface";
import React, { FunctionComponent, useEffect, useMemo, useRef, useState } from "react";

type Props ={
	src: string
	timeSec: number | undefined
	width: number
	height: number
}

const VideoFrameView: FunctionComponent<Props> = ({src, timeSec, width, height}) => {
	const [srcUrl, setSrcUrl] = useState<string>()
	useEffect(() => {
		if (src.startsWith('sha1://')) {
			getFileDataUrl(src).then((url) => {
				setSrcUrl(url)
			}).catch(err => {
				console.warn(`Problem getting file data url for ${src}`)
			})
		}
		else {
			setSrcUrl(src)
		}
	}, [src])
	const canvasRef = useRef<any>(null)
	const video = useMemo(() => {
		if (!srcUrl) return undefined
		const v = document.createElement('video')
		v.addEventListener('seeked', () => {
			const ctx: CanvasRenderingContext2D | undefined = canvasRef.current?.getContext('2d')
			if (!ctx) return
			const W = v.videoWidth
			const H = v.videoHeight
			const W2 = W * height < H * width ? W * height / H : width
			const H2 = W * height < H * width ? height : H * width / W
			ctx.clearRect(0, 0, width, height)
			ctx.drawImage(v, (width - W2) / 2, (height - H2) / 2, W2, H2)
		})
		v.src = srcUrl
		return v
	}, [srcUrl, width, height])
	useEffect(() => {
		if (!video) return
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
