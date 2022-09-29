import { FunctionComponent, PropsWithChildren, useMemo, useReducer } from "react";
import PosesContext, { defaultPoseState, poseReducer } from "./PoseContext";

const SetupPoses: FunctionComponent<PropsWithChildren> = (props) => {
	const [poseState, poseDispatch] = useReducer(poseReducer, defaultPoseState)
    const value = useMemo(() => ({poseState, poseDispatch}), [poseState, poseDispatch])
    return (
        <PosesContext.Provider value={value}>
            {props.children}
        </PosesContext.Provider>
    )
}

export default SetupPoses
