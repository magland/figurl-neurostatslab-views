import { isEqualTo, isNumber, validateObject } from "@figurl/core-utils"

export type AnnotateVocalizationsViewData = {
    type: 'neurostatslab.AnnotateVocalizations',
    spectrogram: {
        data: number[][]
        samplingFrequency: number
    }
}

export const isAnnotateVocalizationsViewData = (x: any): x is AnnotateVocalizationsViewData => {
    return validateObject(x, {
        type: isEqualTo('neurostatslab.AnnotateVocalizations'),
        spectrogram: y => (validateObject(y, {
            data: () => (true),
            samplingFrequency: isNumber
        }))
    })
}