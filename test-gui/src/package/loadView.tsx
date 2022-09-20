import { ViewComponentProps } from "@figurl/core-views"
import { FunctionComponent } from "react"
import { AnnotateGerbilPostureView, isAnnotateGerbilPostureViewData } from "./view-annotate-gerbil-posture"

const loadView = (o: {data: any, width: number, height: number, opts: any, ViewComponent: FunctionComponent<ViewComponentProps>}) => {
    const {data, width, height} = o
    if (isAnnotateGerbilPostureViewData(data)) {
        return <AnnotateGerbilPostureView data={data} width={width} height={height} />
    }
    else return undefined
}

export default loadView