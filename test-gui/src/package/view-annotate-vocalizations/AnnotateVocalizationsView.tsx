import { Splitter } from "@figurl/core-views";
import { FunctionComponent } from "react";
import { AnnotateVocalizationsViewData } from "./AnnotateVocalizationsViewData";
import AnnotationsControl from "./AnnotationsControl";
import SpectrogramWidget from "./SpectrogramWidget";

type Props ={
	data: AnnotateVocalizationsViewData
	width: number
	height: number
}

const AnnotateVocalizationsView: FunctionComponent<Props> = ({data, width, height}) => {
	const {spectrogram} = data	
	return (
		<Splitter
			width={width}
			height={height}
			initialPosition={400}
			adjustable={false}
		>
			<AnnotationsControl
				width={0}
				height={0}
			/>
			<SpectrogramWidget
				width={0}
				height={0}
				spectrogram={spectrogram}
			/>
		</Splitter>
	)
}

export default AnnotateVocalizationsView
