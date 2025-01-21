import type { SortingState } from "@tanstack/react-table";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from "react";
import { RotateCcw } from "lucide-react";

import type { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import { KeybindingsTable } from "./KeybindingsTable";
import type { KeybindingMeta } from "@/types";

export interface KeybindingsDashboardProps {
	dataManager: TailorCutsDataManager;
}

export const KeybindingsDashboard = ({
	dataManager,
}: KeybindingsDashboardProps): ReactNode => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [data, setData] = useState<KeybindingMeta[]>([]);
	useEffect(() => {
		const unsubscribe = dataManager.subscribeKeybindingChange(
			(keybindingsData) => {
				setData(keybindingsData);
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
			<h1>Keybindings Dashboard</h1>
			<button
				onClick={() => {
					console.log("KeybindingsDashboard refresh button onClick", {
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
			<KeybindingsTable
				data={data}
				className="barraclough-tailor-cuts-keybindings-table"
			/>
		</div>
	);
};
