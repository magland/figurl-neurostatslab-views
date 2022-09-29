import { getFileData, storeFileData, useUrlState } from "@figurl/interface";
import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePoses } from "../context-poses";
import PoseContext, { PoseState } from "../context-poses/PoseContext";
import { useVocalizations, VocalizationContext } from "../context-vocalizations";
import { VocalizationState } from "../context-vocalizations/VocalizationContext";
import { JSONStringifyDeterministic } from "./ControlWidget";

type Props ={
	videoSamplingFrequency: number
}

const SaveControl: FunctionComponent<Props> = ({videoSamplingFrequency}) => {
	const {urlState, updateUrlState} = useUrlState()
	const [saving, setSaving] = useState<boolean>(false)
	const {vocalizationState, vocalizationDispatch} = useContext(VocalizationContext)
	const {poseState, poseDispatch} = useContext(PoseContext)
	const uri = useMemo(() => (urlState['vocalizations']), [urlState])
	const {vocalizations} = useVocalizations()
	const {poses} = usePoses(videoSamplingFrequency)
	const acceptedVocalizations = useMemo(() => (vocalizations.filter(v => (v.labels.includes('accept')))), [vocalizations])
	const handleSaveVocalizations = useCallback(() => {
		if (!vocalizationState) return
		const x = JSONStringifyDeterministic(vocalizationState)
		setSaving(true)
		;(async () => {
			try {
				const uri = await storeFileData(x)
				updateUrlState({vocalizations: uri})
			}
			finally {
				setSaving(false)
			}
		})()
	}, [updateUrlState, vocalizationState])

	const handleSavePoses = useCallback(() => {
		if (!poseState) return
		const x = JSONStringifyDeterministic(poseState)
		setSaving(true)
		;(async () => {
			try {
				const uri = await storeFileData(x)
				updateUrlState({poses: uri})
			}
			finally {
				setSaving(false)
			}
		})()
	}, [updateUrlState, poseState])

	///////////////////////////////////////////////////////////////
	const first = useRef<boolean>(true)
	useEffect(() => {
		if (!first.current) return
		if (!vocalizationDispatch) return
		if (!poseDispatch) return
		{
			const uri = (urlState.vocalizations || '') as string
			if (uri) {
				getFileData(uri, () => {}).then((x) => {
					if (!x) {
						console.warn('Empty vocalization state')
						return
					}
					vocalizationDispatch({type: 'setVocalizationState', vocalizationState: x as any as VocalizationState})
				}).catch((err: Error) => {
					console.warn('Problem getting vocalization state')
					console.warn(err)
				})
			}
		}
		{
			const uri = (urlState.poses || '') as string
			if (uri) {
				getFileData(uri, () => {}).then((x) => {
					if (!x) {
						console.warn('Empty pose state')
						return
					}
					poseDispatch({type: 'setPoseState', poseState: x as any as PoseState})
				}).catch((err: Error) => {
					console.warn('Problem getting pose state')
					console.warn(err)
				})
			}
		}
		first.current = false
	}, [urlState.vocalizations, urlState.poses, first, vocalizationDispatch, poseDispatch])
	/////////////////////////////////////////////////////////////////////
	return (
		<div>
			<h3>Save vocalizations</h3>
			<p>{vocalizations.length} vocalizations ({acceptedVocalizations.length} accepted)</p>
			<p>URI: {uri}</p>
			<div>
				<Button disabled={saving} onClick={handleSaveVocalizations}>Save vocalizations snapshot</Button>
			</div>
			<h3>Save poses</h3>
			<p>{poses.length} poses</p>
			<p>URI: {uri}</p>
			<div>
				<Button disabled={saving} onClick={handleSavePoses}>Save poses snapshot</Button>
			</div>
		</div>
	)
}

export default SaveControl
