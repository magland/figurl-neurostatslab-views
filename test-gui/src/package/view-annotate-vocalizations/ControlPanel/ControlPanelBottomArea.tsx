import { FunctionComponent } from "react";
import { Vocalization } from "../../context-vocalizations";
import { Command } from "./ControlPanel";

type Props ={
	width: number
	height: number
	onCommand: (c: Command) => void
	errorString: string
	saving: boolean
	dirty: boolean
	hasGithubUri: boolean
	selectedVocalization: Vocalization | undefined
	label: string
}

const topRowHeight = 40
const rowHeight = 60

const labelHeight = 16
const spacing = 10
const labelFontSize = 12

const ControlPanelBottomArea: FunctionComponent<Props> = ({width, height, onCommand, errorString, saving, dirty, hasGithubUri, selectedVocalization, label}) => {
	return (
		<div style={{position: 'absolute', width, height}}>
			<div style={{position: 'absolute'}}>
				<TopRow width={width} height={topRowHeight} label={label} onCommand={onCommand} />
			</div>
			<div style={{position: 'absolute', top: topRowHeight}}>
				<SelectedVocalizationRow width={width} height={rowHeight} onCommand={onCommand} selectedVocalization={selectedVocalization} />
			</div>
			<div style={{position: 'absolute', top: topRowHeight + rowHeight}}>
				<SaveAnnotationsRow width={width} height={rowHeight} onCommand={onCommand} dirty={dirty} saving={saving} hasGithubUri={hasGithubUri} />
			</div>
			<div style={{position: 'absolute', top: topRowHeight + rowHeight * 2, fontSize: labelFontSize}}>
				{
					saving ? (
						<span>Saving...</span>
					) : errorString ? (
						<span style={{color: 'red'}}>{errorString}</span>
					) : (
						<span>Ready</span>
					)
				}
			</div>
		</div>
	)
}

const TopRow: FunctionComponent<{width: number, height: number, label: string, onCommand: (c: Command) => void}> = ({width, height, label, onCommand}) => {
	const elementWidths = [30, 70, 100, 70, 30, 40]
	const titles = ['first vocalization', 'previous vocalization', '', 'next vocalization', 'last vocalization', 'random vocalization without pose']
	const sumWidths = elementWidths.reduce((prev, cur) => (prev + cur), 0)
	const spacing = (width - sumWidths) / (elementWidths.length + 1)
	const elementPositions: number[] = []
	let x0 = spacing
	for (let i = 0; i < elementWidths.length; i++) {
		elementPositions.push(x0)
		x0 += elementWidths[i] + spacing
	}
	const bottomMargin = 15
	const topMargin = 0
	const buttonStyle: React.CSSProperties = {
		height: height - bottomMargin - topMargin,
		top: topMargin
	}
	const elementStyle: React.CSSProperties = {
		position: 'absolute',
		top: topMargin
	}
	return (
		<div style={{position: 'absolute', width, height}}>
			<div title={titles[0]} style={{left: elementPositions[0], ...elementStyle}}>
				<button onClick={() => onCommand('first')} style={{width: elementWidths[0], ...buttonStyle}}>{`<<`}</button>
			</div>
			<div title={titles[1]} style={{left: elementPositions[1], ...elementStyle}}>
				<button onClick={() => onCommand('prev')} style={{width: elementWidths[1], ...buttonStyle}}>{`< prev`}</button>
			</div>
			<div title={titles[2]} style={{left: elementPositions[2], width: elementWidths[2], ...elementStyle, top: topMargin + 4, textAlign: 'center'}}>
				<div style={{marginTop: 3, fontSize: 12}}>
					{label}
				</div>
			</div>
			<div title={titles[3]} onClick={() => onCommand('next')} style={{left: elementPositions[3], ...elementStyle}}>
				<button style={{width: elementWidths[3], ...buttonStyle}}>{`next >`}</button>
			</div>
			<div title={titles[4]} onClick={() => onCommand('last')} style={{left: elementPositions[4], ...elementStyle}}>
				<button style={{width: elementWidths[4], ...buttonStyle}}>{`>>`}</button>
			</div>
			<div title={titles[5]} onClick={() => onCommand('random-without-pose')} style={{left: elementPositions[5], ...elementStyle}}>
				<button style={{width: elementWidths[5], ...buttonStyle}}>{`- r -`}</button>
			</div>
		</div>
	)
}

const SaveAnnotationsRow: FunctionComponent<{width: number, height: number, onCommand: (c: Command) => void, dirty: boolean, saving: boolean, hasGithubUri: boolean}> = ({width, height, onCommand, dirty, saving, hasGithubUri}) => {
	const W = (width - spacing * 4) / 3
	const buttonStyle: React.CSSProperties = {
		height: 25,
		width: W
	}
	return (
		<div>
			<div style={{position: 'absolute', height: labelHeight, width, fontWeight: 'bold', fontSize: labelFontSize}}>
				Save annotations
			</div>
			<div style={{position: 'absolute', top: labelHeight, width}}>
				<div style={{position: 'absolute', left: spacing}}>
					<button disabled={((!dirty) || saving || (!hasGithubUri))} onClick={() => onCommand('save-to-github')} style={buttonStyle}>Save to GitHub</button>
				</div>
				<div style={{position: 'absolute', left: spacing + W + spacing}}>
					<button disabled={(!dirty) || saving} onClick={() => onCommand('save-snapshot')} style={buttonStyle}>Save snapshot</button>
				</div>
				<div style={{position: 'absolute', left: spacing + W + spacing + W + spacing}}>
					<button onClick={() => onCommand('export-as-json')} style={buttonStyle}>Export as JSON</button>
				</div>
			</div>
		</div>
	)
}

const SelectedVocalizationRow: FunctionComponent<{width: number, height: number, onCommand: (c: Command) => void, selectedVocalization: Vocalization | undefined}> = ({width, height, onCommand, selectedVocalization}) => {
	const W = (width - spacing * 5) / 4
	const buttonStyle: React.CSSProperties = {
		height: 25,
		width: W
	}
	return (
		<div>
			<div style={{position: 'absolute', height: labelHeight, width, fontWeight: 'bold', fontSize: labelFontSize}}>
				Selected vocalization
			</div>
			<div style={{position: 'absolute', top: labelHeight, width}}>
				<div style={{position: 'absolute', left: spacing}}>
					<button disabled={!selectedVocalization || selectedVocalization.labels.includes('accept')} onClick={() => onCommand('accept-vocalization')} style={buttonStyle}>Accept</button>
				</div>
				<div style={{position: 'absolute', left: spacing + W + spacing}}>
					<button disabled={!selectedVocalization || !selectedVocalization.labels.includes('accept')} onClick={() => onCommand('unaccept-vocalization')} style={buttonStyle}>Unaccept</button>
				</div>
				<div style={{position: 'absolute', left: spacing + W + spacing + W + spacing}}>
					<button onClick={() => onCommand('accept-all-vocalizations')} style={buttonStyle}>Accept all</button>
				</div>
				<div style={{position: 'absolute', left: spacing + W + spacing + W + spacing + W + spacing}}>
					<button onClick={() => onCommand('unaccept-all-vocalizations')} style={buttonStyle}>Unaccept all</button>
				</div>
			</div>
		</div>
	)
}

export default ControlPanelBottomArea
