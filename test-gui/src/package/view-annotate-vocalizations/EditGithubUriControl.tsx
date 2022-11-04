import { Button, Input } from "@material-ui/core";
import { FunctionComponent, useCallback, useMemo, useState } from "react";

type Props ={
	onSubmit: (uri: string) => void
	onCancel: () => void
}

const EditGithubUriControl: FunctionComponent<Props> = ({onSubmit, onCancel}) => {
	const [value, setValue] = useState('')
	const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement> = useCallback((e) => {
        setValue(e.target.value as string)
    }, [])
	const valid = useMemo(() => {
		if (!value.startsWith('gh://')) return false
		if (value.split('/').length < 6) return false
		return true
	}, [value])
	return (
		<div>
			<p>Github URI in the form <pre>gh://user/repo/branch/file</pre></p>
			<Input type="text" value={value} onChange={handleChange} />
			<Button onClick={() => onSubmit(value)} disabled={!valid}>Submit</Button>
			<Button onClick={onCancel}>Cancel</Button>
		</div>
	)
}

export default EditGithubUriControl
