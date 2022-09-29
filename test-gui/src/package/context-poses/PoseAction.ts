import { Pose, PoseState } from "./PoseContext"

type PoseAction = {
    type: 'addPose'
    pose: Pose
} | {
    type: 'removePose'
    frame: number
} | {
    type: 'setPoseState'
    poseState: PoseState
} | {
    type: 'addPosePoint'
    frame: number
    point: {x: number, y: number}
} | {
    type: 'movePosePoint'
    frame: number
    pointIndex: number
    newPoint: {x: number, y: number}
}

export default PoseAction