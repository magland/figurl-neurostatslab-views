import { useTimeFocus } from "@figurl/timeseries-views"
import React, { useCallback, useContext, useMemo } from "react"
import PoseAction from "./PoseAction"

export const timeForPose = (p: Pose, videoSamplingFrequency: number) => {
    return p.frame / videoSamplingFrequency
}

export type Pose = {
    frame: number
    points: {x: number, y: number}[]
}

export type PoseState = {
    poses: Pose[]
}

export const defaultPoseState: PoseState = {
    poses: []
}

export const poseReducer = (s: PoseState, a: PoseAction): PoseState => {
    if (a.type === 'addPose') {
        return {
            ...s,
            poses: sortPoses([...s.poses, a.pose])
        }
    }
    else if (a.type === 'removePose') {
        return {
            ...s,
            poses: sortPoses(s.poses.filter(x => (x.frame !== a.frame)))
        }
    }
    else if (a.type === 'setPoseState') {
        return {
            ...a.poseState
        }
    }
    else if (a.type === 'addPosePoint') {
        if (!s.poses.map(p => (p.frame)).includes(a.frame)) {
            return {
                ...s,
                poses: sortPoses([...s.poses, {frame: a.frame, points: [a.point]}])
            }
        }
        else {
            return {
                ...s,
                poses: s.poses.map(p => (p.frame === a.frame ? {...p, points: [...p.points, a.point]} : p))
            }
        }
    }
    else if (a.type === 'movePosePoint') {
        return {
            ...s,
            poses: s.poses.map(p => (p.frame === a.frame ? {...p, points: movePoint(p.points, a.pointIndex, a.newPoint)} : p))
        }
    }
    else return s
}

const sortPoses = (x: Pose[]) => {
    return [...x].sort((a, b) => (a.frame - b.frame))
}

const movePoint = (points: {x: number, y: number}[], i: number, p: {x: number, y: number}) => {
    if (i >= points.length) return points
    const ret = [...points]
    ret[i] = p
    return ret
}

const PoseContext = React.createContext<{
    poseState?: PoseState,
    poseDispatch?: (action: PoseAction) => void
}>({})

export const usePoses = (videoSamplingFrequency: number) => {
    const {poseState, poseDispatch} = useContext(PoseContext)
    const {focusTime, setTimeFocus} = useTimeFocus()
    const addPose = useCallback((pose: Pose) => {
        poseDispatch && poseDispatch({
            type: 'addPose',
            pose
        })
    }, [poseDispatch])
    const removePose = useCallback((frame: number) => {
        poseDispatch && poseDispatch({
            type: 'removePose',
            frame
        })
    }, [poseDispatch])
    const poses: Pose[] = useMemo(() => (
        poseState?.poses || []
    ), [poseState])
    const focusFrame = useMemo(() => {
        if (!focusTime) return undefined
        return Math.floor(focusTime * videoSamplingFrequency)
    }, [focusTime, videoSamplingFrequency])
    const selectedPose: Pose | undefined = useMemo(() => (
        poses.filter(v => (v.frame === focusFrame))[0] as (Pose | undefined)
    ), [poses, focusFrame])
    const setSelectedPose = useCallback((frame: number) => {
        if (!poseState) return
        setTimeFocus(frame / videoSamplingFrequency)
    }, [poseState, setTimeFocus, videoSamplingFrequency])
    const addPosePoint = useCallback((p: {x: number, y: number}) => {
        if (focusFrame === undefined) return
        poseDispatch && poseDispatch({
            type: 'addPosePoint',
            frame: focusFrame,
            point: p
        })
    }, [focusFrame, poseDispatch])
    const movePosePoint = useCallback((pointIndex: number, newPoint: {x: number, y: number}) => {
        if (focusFrame === undefined) return
        poseDispatch && poseDispatch({
            type: 'movePosePoint',
            frame: focusFrame,
            pointIndex,
            newPoint
        })
    }, [focusFrame, poseDispatch])
    return useMemo(() => ({
        poseState,
        poses,
        addPose,
        removePose,
        selectedPose,
        setSelectedPose,
        addPosePoint,
        movePosePoint
    }), [poses, addPose, removePose, selectedPose, poseState, setSelectedPose, addPosePoint, movePosePoint])
}

export default PoseContext