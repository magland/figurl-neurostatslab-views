import { Table, TableBody, TableCell, TableRow } from "@material-ui/core";
import { FunctionComponent } from "react";

type Props ={
}

const HelpWindow: FunctionComponent<Props> = () => {
	return (
		<div>
			<h3>TODO: instructions go here</h3>
			<h3>Keyboard shortcuts</h3>
			<Table>
				<TableBody>
					<TableRow>
						<TableCell>{`<`}</TableCell>
						<TableCell>Select previous vocalization</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>{`>`}</TableCell>
						<TableCell>Select next vocalization</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>{`r`}</TableCell>
						<TableCell>Select random vocalization without a pose</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>{`a`}</TableCell>
						<TableCell>Accept the selected vocalization or add and accept a new vocalization based on the selected time interval</TableCell>
					</TableRow>
					<TableRow>
						<TableCell>{`u`}</TableCell>
						<TableCell>Unaccept current vocalization</TableCell>
					</TableRow>
				</TableBody>
			</Table>
		</div>
	)
}

export default HelpWindow
