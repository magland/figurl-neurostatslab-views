import { Hyperlink, NiceTable, NiceTableColumn, NiceTableRow } from "@figurl/core-views";
import { FunctionComponent, useCallback, useMemo } from "react";
import { useVocalizations } from "../context-vocalizations";
import EditableTextField from "./EditableTextField";

type Props ={
	width: number
	height: number
}

const columns: NiceTableColumn[] = [
    {
        key: 'label',
        label: 'Label'
    },
    {
        key: 'interval',
        label: 'Interval'
    }
]

const VocalizationsTable: FunctionComponent<Props> = ({width, height}) => {
	const {vocalizations, setVocalizationLabel, removeVocalization, selectedVocalization, setSelectedVocalizationId} = useVocalizations()
	const rows: NiceTableRow[] = useMemo(() => {
        return vocalizations.map((x, i) => {
			const handleClick = () => {
				setSelectedVocalizationId(x.vocalizationId)
			}
            return {
                key: x.vocalizationId,
                columnValues: {
                    label: {
                        element: <EditableTextField onChange={newLabel => setVocalizationLabel(x.vocalizationId, newLabel)} value={x.label} />
                    },
                    interval: {
						// element: <Hyperlink onClick={() => recordingSelectionDispatch({type: 'setFocusTimeInterval', focusTimeIntervalSec: x.timeIntervalSec, autoScrollVisibleTimeRange: true})}>{formatTimeInterval(x.timeIntervalSec)}</Hyperlink>
                        element: <Hyperlink onClick={handleClick}>{formatTimeInterval(x.timeIntervalSec)}</Hyperlink>
                    }
                }
            }
        })
    }, [vocalizations, setVocalizationLabel, setSelectedVocalizationId])
	const handleDelete = useCallback((vocalizationId: string) => {
        removeVocalization(vocalizationId)
    }, [removeVocalization])
	const selectedVocalizationIds = useMemo(() => (
		selectedVocalization ? [selectedVocalization.vocalizationId] : []
	), [selectedVocalization])
	return (
		<div style={{position: 'absolute', width, height, overflowY: 'auto'}}>
			<NiceTable
				columns={columns}
				rows={rows}
				onDeleteRow={handleDelete}
				selectedRowKeys={selectedVocalizationIds}
				selectionMode="single"
				onSelectedRowKeysChanged={(keys: string[]) => setSelectedVocalizationId(keys[0])}
			/>
		</div>
	)
}


export const formatTimeInterval = (x: [number, number]) => {
    return `[${x[0].toFixed(7)}, ${x[1].toFixed(7)}]`
}

export default VocalizationsTable