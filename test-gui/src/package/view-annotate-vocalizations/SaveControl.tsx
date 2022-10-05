import { randomAlphaString } from '@figurl/core-utils';
import { Hyperlink } from '@figurl/core-views';
import { getFileData, storeFileData, useSignedIn } from "@figurl/interface";
import { Button } from "@material-ui/core";
import { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Props ={
	uri: string | undefined
	setUri: (uri: string) => void
	object: {[key: string]: any} | undefined
	setObject: (object: any) => void
}

type SaveState = {
	savedObjectJson?: string
	savedUri?: string
}

const SaveControl: FunctionComponent<Props> = ({uri, setUri, object, setObject}) => {
	const [errorString, setErrorString] = useState<string>('')

	const [saving, setSaving] = useState<boolean>(false)

	const {userId} = useSignedIn()

	const [saveState, setSaveState] = useState<SaveState>({})

	const handleSaveSnapshot = useCallback(() => {
		if (!object) return
		const x = JSONStringifyDeterministic(object)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				const newUri = await storeFileData(x)
				setUri(newUri)
				setSaveState({
					savedObjectJson: x,
					savedUri: newUri
				})
			}
			catch(err: any) {
				setErrorString(`Problem saving file data: ${err.message}`)
			}
			finally {
				setSaving(false)
			}
		})()
	}, [object, setUri])

	const handleSaveJot = useCallback((o: {new?: boolean}={}) => {
		if (!object) return
		const jotId = uri && uri.startsWith('jot://') && (!o.new) ? uri.split('?')[0].split('/')[2] : randomAlphaString(12)
		const x = JSONStringifyDeterministic(object)
		setSaving(true)
		setErrorString('')
		;(async () => {
			try {
				await storeFileData(x, {jotId})
				const newUri = `jot://${jotId}`
				setUri(newUri)
				setSaveState({
					savedObjectJson: x,
					savedUri: newUri
				})
			}
			catch(err: any) {
				setErrorString(`Problem saving file data: ${err.message}`)
			}
			finally {
				setSaving(false)
			}
		})()
	}, [object, setUri, uri])

    ///////////////////////////////////////////////////////////////
	const first = useRef<boolean>(true)
	useEffect(() => {
		if (!first.current) return
		if (uri) {
			getFileData(uri, () => {}).then((x) => {
				if (!x) {
					console.warn('Empty state')
					return
				}
				setObject(x)
				setSaveState({
					savedObjectJson: JSONStringifyDeterministic(x),
					savedUri: uri
				})
			}).catch((err: Error) => {
				console.warn('Problem getting state')
				console.warn(err)
			})
		}
		first.current = false
	}, [uri, first, setObject])

	const uriStartsWithJot = (uri || '').startsWith('jot://')
	const jotId = uriStartsWithJot ? (uri || '').split('?')[0].split('/')[2] : ''
	const buttonStyle: React.CSSProperties = useMemo(() => ({textTransform: 'none'}), [])

	const saveAsJotEnabled = useMemo(() => {
		if (saving) return false
		if (!userId) return false
		if (!uri?.startsWith('jot://')) return false
		if ((uri === saveState.savedUri) && (JSONStringifyDeterministic(object || {}) === saveState.savedObjectJson)) {
			return false
		}
		return true
	}, [uri, object, saveState, saving, userId])

	const saveSnapshotEnabled = useMemo(() => {
		if (saving) return false
		if (((uri || '').startsWith('sha1://')) && (uri === saveState.savedUri) && (JSONStringifyDeterministic(object || {}) === saveState.savedObjectJson)) {
			return false
		}
		return true
	}, [uri, object, saveState, saving])

	const saveAsNewJotEnabled = useMemo(() => {
		if (saving) return false
		if (!userId) return false
		return true
	}, [saving, userId])

	return (
		<div>
			<p>URI: {uri}</p>
			<div>
				{
					uriStartsWithJot && (
						<span>
							<Button style={buttonStyle} disabled={!saveAsJotEnabled} onClick={() => handleSaveJot({new: false})}>Save as {uri}</Button>
							{userId && <Hyperlink href={`https://jot.figurl.org/jot/${jotId}`} target="_blank">manage</Hyperlink>}
						</span>
					)
				}
				<br />
				<Button style={buttonStyle} disabled={!saveSnapshotEnabled} onClick={handleSaveSnapshot}>Save as snapshot</Button>
				<br />
				<Button style={buttonStyle} disabled={!saveAsNewJotEnabled} onClick={() => handleSaveJot({new: true})}>Save as new jot</Button>
				<br />
				{
					saving && 'Saving...'
				}
				{
					!userId && <span style={{fontStyle: 'italic', color: 'gray'}}>You are not signed in</span>
				}
			</div>
			{errorString && <div style={{color: 'red'}}>{errorString}</div>}
		</div>
	)
}

// Thanks: https://stackoverflow.com/questions/16167581/sort-object-properties-and-json-stringify
export const JSONStringifyDeterministic = ( obj: Object, space: string | number | undefined =undefined ) => {
    var allKeys: string[] = [];
    JSON.stringify( obj, function( key, value ){ allKeys.push( key ); return value; } )
    allKeys.sort();
    return JSON.stringify( obj, allKeys, space );
}

export default SaveControl
