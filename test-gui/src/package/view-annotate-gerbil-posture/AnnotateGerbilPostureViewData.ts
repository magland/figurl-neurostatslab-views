import { isArrayOf, isEqualTo, isString, validateObject } from "@figurl/core-utils"

type Frame = {
    frameId: string,
    image: number[][][]
}

export type AnnotateGerbilPostureViewData = {
    type: 'neurostatslab.AnnotateGerbilPosture',
    frames: Frame[]
}

export const isAnnotateGerbilPostureViewData = (x: any): x is AnnotateGerbilPostureViewData => {
    return validateObject(x, {
        type: isEqualTo('neurostatslab.AnnotateGerbilPosture'),
        frames: isArrayOf(y => (validateObject(y, {
            frameId: isString,
            image: () => (true)
        })))
    })
}