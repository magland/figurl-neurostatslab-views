import { useUrlState } from '@figurl/interface';
import { FunctionComponent, useCallback, useContext } from 'react';
import { useVocalizations, VocalizationContext } from '../context-vocalizations';
import { VocalizationState } from '../context-vocalizations/VocalizationContext';
import SaveControl from './SaveControl';

type Props = {
    videoSamplingFrequency: number
}

const SavePanel: FunctionComponent<Props> = ({videoSamplingFrequency}) => {
    const {vocalizationState} = useVocalizations()
    const {vocalizationDispatch} = useContext(VocalizationContext)
    const {urlState, updateUrlState} = useUrlState()

    const setVocalizationsUri = useCallback((x: string) => {
        updateUrlState({vocalizations: x})
    }, [updateUrlState])

    const setVocalizationState = useCallback((x: any) => {
        vocalizationDispatch && vocalizationDispatch({type: 'setVocalizationState', vocalizationState: x as any as VocalizationState})
    }, [vocalizationDispatch])

    return (
        <div>
            <h3>Save vocalizations</h3>
            <SaveControl
                uri={urlState.vocalizations}
                setUri={setVocalizationsUri}
                object={vocalizationState}
                setObject={setVocalizationState}
            />
        </div>
    )
}

export default SavePanel