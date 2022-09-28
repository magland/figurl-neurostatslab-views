import { randomAlphaString } from "@figurl/core-utils"
import { useTimeFocus } from "@figurl/timeseries-views"
import React, { useCallback, useContext, useMemo } from "react"
import VocalizationAction from "./VocalizationAction"

export type Vocalization = {
    vocalizationId: string
    labels: string[]
    timeIntervalSec: [number, number]
}

export type VocalizationState = {
    vocalizations: Vocalization[]
}

export const defaultVocalizationState: VocalizationState = {
    vocalizations: []
}

export const vocalizationReducer = (s: VocalizationState, a: VocalizationAction): VocalizationState => {
    if (a.type === 'addVocalization') {
        return {
            ...s,
            vocalizations: sortVocalizations([...s.vocalizations, a.vocalization])
        }
    }
    else if (a.type === 'removeVocalization') {
        return {
            ...s,
            vocalizations: sortVocalizations(s.vocalizations.filter(x => (x.vocalizationId !== a.vocalizationId)))
        }
    }
    else if (a.type === 'setVocalizationLabel') {
        return {
            ...s,
            vocalizations: sortVocalizations(s.vocalizations.map(x => (x.vocalizationId === a.vocalizationId ? {...x, label: a.label} : x)))
        }
    }
    else if (a.type === 'setVocalizationState') {
        return {
            ...a.vocalizationState
        }
    }
    else if (a.type === 'addVocalizationLabel') {
        return {
            ...s,
            vocalizations: s.vocalizations.map(v => (v.vocalizationId === a.vocalizationId ? (addLabel(v, a.label)) : v))
        }
    }
    else if (a.type === 'removeVocalizationLabel') {
        return {
            ...s,
            vocalizations: s.vocalizations.map(v => (v.vocalizationId === a.vocalizationId ? (removeLabel(v, a.label)) : v))
        }
    }
    else return s
}

const addLabel = (v: Vocalization, label: string): Vocalization => {
    return {
        ...v,
        labels: v.labels.includes(label) ? v.labels : [...v.labels, label].sort()
    }
}

const removeLabel = (v: Vocalization, label: string): Vocalization => {
    return {
        ...v,
        labels: v.labels.filter(x => (x !== label))
    }
}

const sortVocalizations = (x: Vocalization[]) => {
    return [...x].sort((a, b) => (a.timeIntervalSec[0] - b.timeIntervalSec[1]))
}

export type VocalizationSelection = {
    selectedVocalizationId: string | undefined
}

export type VocalizationSelectionAction = {
    type: 'setSelectedVocalization'
    vocalizationId: string | undefined
}

export const defaultVocalizationSelection: VocalizationSelection = {
    selectedVocalizationId: undefined
}

export const vocalizationSelectionReducer = (s: VocalizationSelection, a: VocalizationSelectionAction): VocalizationSelection => {
    if (a.type === 'setSelectedVocalization') {
        return {...s, selectedVocalizationId: a.vocalizationId}
    }
    else return s
}

const VocalizationContext = React.createContext<{
    vocalizationState?: VocalizationState,
    vocalizationDispatch?: (action: VocalizationAction) => void
    vocalizationSelection?: VocalizationSelection,
    vocalizationSelectionDispatch?: (action: VocalizationSelectionAction) => void
}>({})

export const useVocalizations = () => {
    const {vocalizationState, vocalizationDispatch, vocalizationSelection, vocalizationSelectionDispatch} = useContext(VocalizationContext)
    const {setTimeFocus} = useTimeFocus()
    const addVocalization = useCallback((vocalization: Vocalization) => {
        if (!vocalization.vocalizationId) {
            vocalization.vocalizationId = randomAlphaString(10)
        }
        vocalizationDispatch && vocalizationDispatch({
            type: 'addVocalization',
            vocalization
        })
    }, [vocalizationDispatch])
    const removeVocalization = useCallback((vocalizationId: string) => {
        vocalizationDispatch && vocalizationDispatch({
            type: 'removeVocalization',
            vocalizationId
        })
    }, [vocalizationDispatch])
    const setVocalizationLabel = useCallback((vocalizationId: string, label: string) => {
        vocalizationDispatch && vocalizationDispatch({
            type: 'setVocalizationLabel',
            vocalizationId,
            label
        })
    }, [vocalizationDispatch])
    const vocalizations: Vocalization[] = useMemo(() => (
        vocalizationState?.vocalizations || []
    ), [vocalizationState])
    const selectedVocalization: Vocalization | undefined = useMemo(() => (
        vocalizations.filter(v => (v.vocalizationId === vocalizationSelection?.selectedVocalizationId))[0] as (Vocalization | undefined)
    ), [vocalizations, vocalizationSelection?.selectedVocalizationId])
    const setSelectedVocalizationId = useCallback((id: string | undefined) => {
        vocalizationSelectionDispatch && vocalizationSelectionDispatch({
            type: 'setSelectedVocalization',
            vocalizationId: id
        })
        const sv = vocalizations.find(v => (v.vocalizationId === id))
        if (sv) {
            setTimeFocus(sv.timeIntervalSec[0], {autoScrollVisibleTimeRange: true})
        }
    }, [vocalizationSelectionDispatch, setTimeFocus, vocalizations])
    const selectPreviousVocalization = useCallback(() => {
        if (!selectedVocalization) return
        const i = vocalizations.map(v => (v.vocalizationId)).indexOf(selectedVocalization.vocalizationId)
        if (i < 0) return
        if (i - 1 < 0) return
        setSelectedVocalizationId(vocalizations[i - 1].vocalizationId)
	}, [selectedVocalization, vocalizations, setSelectedVocalizationId])
	const selectNextVocalization = useCallback(() => {
		if (!selectedVocalization) return
        const i = vocalizations.map(v => (v.vocalizationId)).indexOf(selectedVocalization.vocalizationId)
        if (i < 0) return
        if (i + 1 >= vocalizations.length) return
        setSelectedVocalizationId(vocalizations[i + 1].vocalizationId)
	}, [selectedVocalization, vocalizations, setSelectedVocalizationId])
    const addVocalizationLabel = useCallback((vocalizationId: string, label: string) => {
        vocalizationDispatch && vocalizationDispatch({type: 'addVocalizationLabel', vocalizationId, label})
    }, [vocalizationDispatch])
    const removeVocalizationLabel = useCallback((vocalizationId: string, label: string) => {
        vocalizationDispatch && vocalizationDispatch({type: 'removeVocalizationLabel', vocalizationId, label})
    }, [vocalizationDispatch])
    return useMemo(() => ({
        vocalizations,
        addVocalization,
        removeVocalization,
        setVocalizationLabel,
        selectedVocalization,
        setSelectedVocalizationId,
        selectPreviousVocalization,
        selectNextVocalization,
        addVocalizationLabel,
        removeVocalizationLabel
    }), [vocalizations, addVocalization, removeVocalization, setVocalizationLabel, selectedVocalization, setSelectedVocalizationId, selectNextVocalization, selectPreviousVocalization, addVocalizationLabel, removeVocalizationLabel])
}

export default VocalizationContext