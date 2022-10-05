import { useUrlState } from '@figurl/interface';
import { FunctionComponent, useCallback, useContext } from 'react';
import { PosesContext } from '../context-poses';
import { PoseState, usePoses } from '../context-poses/PoseContext';
import { useVocalizations, VocalizationContext } from '../context-vocalizations';
import { VocalizationState } from '../context-vocalizations/VocalizationContext';
import SaveControl from './SaveControl';

type Props = {
    videoSamplingFrequency: number
}

const SavePanel: FunctionComponent<Props> = ({videoSamplingFrequency}) => {
    const {vocalizationState} = useVocalizations()
    const {vocalizationDispatch} = useContext(VocalizationContext)
    const {poseState} = usePoses(videoSamplingFrequency)
    const {poseDispatch} = useContext(PosesContext)
    const {urlState, updateUrlState} = useUrlState()

    const setVocalizationsUri = useCallback((x: string) => {
        updateUrlState({vocalizations: x})
    }, [updateUrlState])

    const setVocalizationState = useCallback((x: any) => {
        vocalizationDispatch && vocalizationDispatch({type: 'setVocalizationState', vocalizationState: x as any as VocalizationState})
    }, [vocalizationDispatch])

    const setPosesUri = useCallback((x: string) => {
        updateUrlState({poses: x})
    }, [updateUrlState])

    const setPoseState = useCallback((x: any) => {
        poseDispatch && poseDispatch({type: 'setPoseState', poseState: x as any as PoseState})
    }, [poseDispatch])

    return (
        <div>
            <h3>Save vocalizations</h3>
            <SaveControl
                uri={urlState.vocalizations}
                setUri={setVocalizationsUri}
                object={vocalizationState}
                setObject={setVocalizationState}
            />
            <h3>Save poses</h3>
            <SaveControl
                uri={urlState.poses}
                setUri={setPosesUri}
                object={poseState}
                setObject={setPoseState}
            />
        </div>
    )
}

export default SavePanel