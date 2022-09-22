import { Vocalization, VocalizationState } from "./VocalizationContext"

type VocalizationAction = {
    type: 'addVocalization'
    vocalization: Vocalization
} | {
    type: 'removeVocalization'
    vocalizationId: string
} | {
    type: 'setVocalizationLabel'
    vocalizationId: string
    label: string
} | {
    type: 'setVocalizationState',
    vocalizationState: VocalizationState
}

export default VocalizationAction