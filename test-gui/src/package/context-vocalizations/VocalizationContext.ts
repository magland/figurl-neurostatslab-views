import { randomAlphaString } from "@figurl/core-utils"
import { useTimeFocus } from "@figurl/timeseries-views"
import React, { useCallback, useContext, useMemo } from "react"
import { timeIntervalForVocalization } from "../view-annotate-vocalizations/VocalizationsTable"
import VocalizationAction from "./VocalizationAction"

export type VocalizationPose = {
    points: {x: number, y: number}[]
}

export type Vocalization = {
    vocalizationId: string
    labels: string[]
    startFrame: number
    endFrame: number
    pose?: VocalizationPose
}

export type VocalizationState = {
    samplingFrequency: number
    vocalizations: Vocalization[]
}

export const defaultVocalizationState: VocalizationState = {
    samplingFrequency: 1,
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
    else if (a.type === 'setPose') {
        return {
            ...s,
            vocalizations: s.vocalizations.map(v => (v.vocalizationId === a.vocalizationId) ? {...v, pose: a.pose} : v)
        }
    }
    else if (a.type === 'addPosePoint') {
        return {
            ...s,
            vocalizations: s.vocalizations.map(v => (v.vocalizationId === a.vocalizationId) ? {...v, pose: addPosePoint(v.pose, a.point)} : v)
        }
    }
    else if (a.type === 'movePosePoint') {
        return {
            ...s,
            vocalizations: s.vocalizations.map(v => (v.vocalizationId === a.vocalizationId) ? {...v, pose: movePosePoint(v.pose, a.pointIndex, a.newPoint)} : v)
        }
    }
    else if (a.type === 'removePose') {
        return {
            ...s,
            vocalizations: s.vocalizations.map(v => (v.vocalizationId === a.vocalizationId ? ({...v, pose: undefined}) : v))
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
    return [...x].sort((a, b) => (a.startFrame - b.startFrame))
}

const addPosePoint = (pose: VocalizationPose | undefined, point: {x: number, y: number}): VocalizationPose => {
    if (!pose) return {
        points: [point]
    }
    if (pose.points.length >= 2) return pose
    return {...pose, points: [...pose.points, point]}
}

const movePosePoint = (pose: VocalizationPose | undefined, pointIndex: number, newPoint: {x: number, y: number}) => {
    if (!pose) return undefined
    const newPoints = [...pose.points]
    if (pointIndex >= newPoints.length) return pose
    newPoints[pointIndex] = newPoint
    return {...pose, points: newPoints}
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
            const timeIntervalSec = timeIntervalForVocalization(vocalizationState, sv)
            if (timeIntervalSec) {
                setTimeFocus(timeIntervalSec[0], {autoScrollVisibleTimeRange: true})
            }
        }
    }, [vocalizationSelectionDispatch, vocalizationState, setTimeFocus, vocalizations])
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
    const setPose = useCallback((vocalizationId: string, pose: VocalizationPose) => {
        vocalizationDispatch && vocalizationDispatch({type: 'setPose', vocalizationId, pose})
    }, [vocalizationDispatch])
    const addPosePoint = useCallback((vocalizationId: string, point: {x: number, y: number}) => {
        vocalizationDispatch && vocalizationDispatch({type: 'addPosePoint', vocalizationId, point})
    }, [vocalizationDispatch])
    const movePosePoint = useCallback((vocalizationId: string, pointIndex: number, newPoint: {x: number, y: number}) => {
        vocalizationDispatch && vocalizationDispatch({type: 'movePosePoint', vocalizationId, pointIndex, newPoint})
    }, [vocalizationDispatch])
    const removePose = useCallback((vocalizationId: string) => {
        vocalizationDispatch && vocalizationDispatch({type: 'removePose', vocalizationId})
    }, [vocalizationDispatch])
    return useMemo(() => ({
        vocalizationState,
        vocalizations,
        addVocalization,
        removeVocalization,
        setVocalizationLabel,
        selectedVocalization,
        setSelectedVocalizationId,
        selectPreviousVocalization,
        selectNextVocalization,
        addVocalizationLabel,
        removeVocalizationLabel,
        setPose,
        addPosePoint,
        movePosePoint,
        removePose
    }), [vocalizations, addVocalization, removeVocalization, setVocalizationLabel, selectedVocalization, setSelectedVocalizationId, selectNextVocalization, selectPreviousVocalization, addVocalizationLabel, removeVocalizationLabel, vocalizationState, setPose, addPosePoint, movePosePoint, removePose])
}

export default VocalizationContext