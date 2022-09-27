import { Splitter } from '@figurl/core-views';
import { FunctionComponent } from 'react';
import CurrentVocalizationControl from './CurrentVocalizationControl';
import SaveControl from './SaveControl';
import VocalizationsTable from './VocalizationsTable';

type Props = {
    width: number
    height: number
}

const ControlWidget: FunctionComponent<Props> = ({width, height}) => {
    // const {recordingSelection} = useRecordingSelection()
    // const {focusTimeIntervalSeconds} = recordingSelection
    // const {vocalizations, addVocalization, removeVocalization} = useVocalizations()
    // const [, setSaveEnabled] = useState(true)

    // const handleAddTimeInterval = useCallback(() => {
    //     focusTimeIntervalSeconds !== undefined && addVocalization({vocalizationId: '', label: ``, timeIntervalSec: focusTimeIntervalSeconds})
    // }, [focusTimeIntervalSeconds, addVocalization])

    // const handleDelete = useCallback((vocalizationId: string) => {
    //     removeVocalization(vocalizationId)
    // }, [removeVocalization])

    // const {updateUrlState} = useUrlState()

    // const handleSave = useCallback(() => {
    //     const savedTimesJson = JSONStringifyDeterministic({vocalizations})
    //     setSaveEnabled(false)
    //     storeFileData(savedTimesJson).then((uri) => {
    //         setSaveEnabled(true)
    //         updateUrlState({vocalizations: uri})
    //     }).catch((err: Error) => {
    //         console.warn(err)
    //         alert(`Problem saving vocalizations: ${err.message}`)
    //     }).finally(() => {
    //         setSaveEnabled(true)
    //     })
    // }, [vocalizations, updateUrlState])

    return (
        <Splitter
            width={width}
            height={height}
            initialPosition={300}
        >
            <VocalizationsTable
                width={0}
                height={0}
            />
            <Splitter
                width={0}
                height={0}
                initialPosition={300}
            >
                <CurrentVocalizationControl
                    width={0}
                    height={0}
                />
                <SaveControl />
            </Splitter>
        </Splitter>
        // <div style={{margin: 20}}>
        //     <h3>Vocalizations</h3>
        //     <hr />

        //     <h4>Time intervals</h4>
        //     <pre>(Use shift+click)</pre>
        //     Selected (sec): {focusTimeIntervalSeconds !== undefined ? formatTimeInterval(focusTimeIntervalSeconds) : 'undefined'}
        //     <Button disabled={focusTimeIntervalSeconds === undefined} onClick={handleAddTimeInterval}>Add time interval</Button>
        //     <div style={{overflowY: 'auto', height: 160}}>
        //         <NiceTable
        //             rows={timeIntervalRows}
        //             columns={timeIntervalColumns}
        //             onDeleteRow={handleDelete}
        //         />
        //     </div>
        //     <hr />

        //     <Button disabled={!saveEnabled} onClick={handleSave}>Save vocalizations</Button>
        // </div>
    )
}


// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: Object, space: string | number | undefined =undefined ) => {
    var allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}

export default ControlWidget