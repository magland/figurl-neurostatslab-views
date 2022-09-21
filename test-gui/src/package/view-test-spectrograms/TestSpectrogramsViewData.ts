import { isArrayOf, isEqualTo, isNumber, isString, validateObject } from "@figurl/core-utils"

export type TSEvent = {
    eventId: string
    t: number
    spectrograms: number[][][]
    cameraImage: number[][][]
}

export type TestSpectrogramsViewData = {
    type: 'neurostatslab.TestSpectrograms',
    events: TSEvent[]
}

export const isTestSpectrogramsViewData = (x: any): x is TestSpectrogramsViewData => {
    return validateObject(x, {
        type: isEqualTo('neurostatslab.TestSpectrograms'),
        events: isArrayOf(y => (validateObject(y, {
            eventId: isString,
            t: isNumber,
            spectrograms: () => (true),
            cameraImage: () => (true)
        })))
    })
}