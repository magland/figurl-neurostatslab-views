import { ViewComponentProps } from "@figurl/core-views"
import { FunctionComponent } from "react"
import { AnnotateVocalizationsView, isAnnotateVocalizationsViewData } from "./view-annotate-vocalizations"
import { isTestSpectrogramsViewData, TestSpectrogramsView } from "./view-test-spectrograms"

const loadView = (o: {data: any, width: number, height: number, opts: any, ViewComponent: FunctionComponent<ViewComponentProps>}) => {
    const {data, width, height} = o
    if (isTestSpectrogramsViewData(data)) {
        return <TestSpectrogramsView data={data} width={width} height={height} />
    }
    else if (isAnnotateVocalizationsViewData(data)) {
        return <AnnotateVocalizationsView data={data} width={width} height={height} />
    }
    else return undefined
}

export default loadView