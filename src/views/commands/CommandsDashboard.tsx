import type { SortingState } from "@tanstack/react-table";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from "react";
import { RotateCcw } from "lucide-react";

import type { PluginMeta } from "@/types";
import type { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import { PluginsTable } from "@/views/plugins/PluginsTable";

export interface CommandsDashboardProps {
	dataManager: TailorCutsDataManager;
}

export const CommandsDashboard = ({
	dataManager,
}: CommandsDashboardProps): ReactNode => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [data, setData] = useState<PluginMeta[]>([]);
	useEffect(() => {
		const unsubscribe = dataManager.subscribePluginChange((plugins) => {
			setData(plugins);
		});
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
			{/* <Keeb /> */}
			{/* <CommandTable
				data={commandData}
				// setData={setCmdData}
				sorting={commandSorting}
				setSorting={setCommandSorting}
				className="bc-command-table"
			/> */}
			<PluginsTable
				data={data}
				// setData={setPluginData}
				className="barraclough-tailor-cuts-commands-table"
			/>
			{/* <KeybindingTable
				data={keybindingData}
				// setData={setKeybindingData}
				sorting={keybindingSorting}
				setSorting={setKeybindingSorting}
				className="bc-keybinding-table"
			/> */}
		</div>
	);
};
