import type { SortingState } from "@tanstack/react-table";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from "react";
import { RotateCcw } from "lucide-react";

import type { CommandData } from "@/types";
import type { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import { CommandsTable } from "./CommandsTable";

export interface CommandsDashboardProps {
	dataManager: TailorCutsDataManager;
}

export const CommandsDashboard = ({
	dataManager,
}: CommandsDashboardProps): ReactNode => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [data, setData] = useState<CommandData[]>([]);
	useEffect(() => {
		const unsubscribe = dataManager.subscribeCommandChange(
			(commandsData) => {
				setData(commandsData);
			}
		);
		return () => {
			unsubscribe();
		};
	}, [dataManager]);

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "start",
				gap: "10px",
			}}
		>
			<h1>Commands Dashboard</h1>
			<button
				onClick={() => {
					console.log("CommandsDashboard refresh button onClick", {
						data,
						dataManager,
						app: dataManager.plugin.app,
						plugins: dataManager.plugin.app.plugins.plugins,
					});
				}}
				className="bc-refresh-button"
				style={{
					color: "red",
					backgroundColor: "white",
					border: "1px solid red",
				}}
			>
				<RotateCcw />
			</button>
			<CommandsTable
				data={data}
				className="barraclough-tailor-cuts-commands-table"
			/>
		</div>
	);
};
