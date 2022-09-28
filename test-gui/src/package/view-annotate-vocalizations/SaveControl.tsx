import { getFileData, storeFileData, useUrlState } from "@figurl/interface";
import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useVocalizations, VocalizationContext } from "../context-vocalizations";
import { VocalizationState } from "../context-vocalizations/VocalizationContext";
import { JSONStringifyDeterministic } from "./ControlWidget";

type Props ={
}

const SaveControl: FunctionComponent<Props> = () => {
	const {urlState, updateUrlState} = useUrlState()
	const [saving, setSaving] = useState<boolean>(false)
	const {vocalizationState, vocalizationDispatch} = useContext(VocalizationContext)
	const uri = useMemo(() => (urlState['vocalizations']), [urlState])
	const {vocalizations} = useVocalizations()
	const acceptedVocalizations = useMemo(() => (vocalizations.filter(v => (v.labels.includes('accept')))), [vocalizations])
	const handleSaveSnapshot = useCallback(() => {
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

	///////////////////////////////////////////////////////////////
	const first = useRef<boolean>(true)
	useEffect(() => {
		if (!first.current) return
		if (!vocalizationDispatch) return
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
		first.current = false
	}, [urlState.vocalizations, first, vocalizationDispatch])
	/////////////////////////////////////////////////////////////////////
	return (
		<div>
			<h3>Save vocalization annotations</h3>
			<p>{vocalizations.length} vocalizations ({acceptedVocalizations.length} accepted)</p>
			<p>URI: {uri}</p>
			<div>
				<Button disabled={saving} onClick={handleSaveSnapshot}>Save snapshot</Button>
			</div>
		</div>
	)
}

export default SaveControl
