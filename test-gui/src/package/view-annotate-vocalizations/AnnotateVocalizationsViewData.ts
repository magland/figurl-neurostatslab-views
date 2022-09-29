import { isEqualTo, isNumber, isString, optional, validateObject } from "@figurl/core-utils"

export type AnnotateVocalizationsViewData = {
    type: 'neurostatslab.AnnotateVocalizations',
    spectrogram: {
        data: number[][]
        samplingFrequency: number
    },
    video?: {
        uri: string
        samplingFrequency: number
        width: number
        height: number
    }
}

export const isAnnotateVocalizationsViewData = (x: any): x is AnnotateVocalizationsViewData => {
    return validateObject(x, {
        type: isEqualTo('neurostatslab.AnnotateVocalizations'),
        spectrogram: y => (validateObject(y, {
            data: () => (true),
            samplingFrequency: isNumber
        })),
        video: optional((y: any) => (validateObject(y, {
            uri: isString,
            samplingFrequency: isNumber,
            width: isNumber,
            height: isNumber
        })))
    })
}