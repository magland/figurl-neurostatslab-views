import { getFileData, useUrlState } from "@figurl/interface";
import { useRecordingSelection, useTimeFocus } from "@figurl/timeseries-views";
import { FunctionComponent, PropsWithChildren, useEffect, useMemo, useReducer, useRef } from "react";
import VocalizationsContext, { defaultVocalizationSelection, defaultVocalizationState, vocalizationReducer, vocalizationSelectionReducer } from "./VocalizationContext";

const SetupVocalizations: FunctionComponent<PropsWithChildren> = (props) => {
	const [vocalizationState, vocalizationDispatch] = useReducer(vocalizationReducer, defaultVocalizationState)
	const [vocalizationSelection, vocalizationSelectionDispatch] = useReducer(vocalizationSelectionReducer, defaultVocalizationSelection)
	const {recordingSelectionDispatch} = useRecordingSelection()
	const {focusTime} = useTimeFocus()
    const value = useMemo(() => ({vocalizationState, vocalizationDispatch, vocalizationSelection, vocalizationSelectionDispatch}), [vocalizationState, vocalizationDispatch, vocalizationSelection, vocalizationSelectionDispatch])
	const {urlState} = useUrlState()
	const first = useRef<boolean>(true)
	useEffect(() => {
		if (!first.current) return
		const uri = urlState.vocalizations
		if (uri) {
			getFileData(uri, () => {}).then((x) => {
				vocalizationDispatch({type: 'setVocalizationState', vocalizationState: x})
			}).catch((err: Error) => {
				console.warn('Problem getting vocalization state')
				console.warn(err)
			})
		}
		first.current = false
	}, [urlState.vocalizations, first])
	const selectedVocalizationId = useMemo(() => (
		vocalizationSelection.selectedVocalizationId
	), [vocalizationSelection])
	useEffect(() => {
		if (!selectedVocalizationId) return
		const sv = vocalizationState.vocalizations.filter(v => (v.vocalizationId === selectedVocalizationId))[0]
		if (!sv) return
		recordingSelectionDispatch({
			type: 'setFocusTimeInterval',
			focusTimeIntervalSec: sv.timeIntervalSec,
			autoScrollVisibleTimeRange: true
		})
	}, [selectedVocalizationId, recordingSelectionDispatch, vocalizationState.vocalizations])
	useEffect(() => {
		if (focusTime === undefined) return
		for (let v of vocalizationState.vocalizations) {
			const a = v.timeIntervalSec
			if ((a[0] <= focusTime) && (focusTime <= a[1])) {
				vocalizationSelectionDispatch({
					type: 'setSelectedVocalization',
					vocalizationId: v.vocalizationId
				})
			}
		}
	}, [focusTime, vocalizationState.vocalizations])
    return (
        <VocalizationsContext.Provider value={value}>
            {props.children}
        </VocalizationsContext.Provider>
    )
}

export default SetupVocalizations
