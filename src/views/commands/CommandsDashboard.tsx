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
import { PluginTable } from "@/views/plugins/PluginsTable";

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
				justifyContent: "center",
				gap: "10px",
			}}
		>
			<h1>Commands (Plugins for now) Dashboard</h1>
			<button
				onClick={() => {
					console.log("commands dashboard button click", {
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
			<PluginTable
				data={data}
				// setData={setPluginData}
				sorting={sorting}
				setSorting={setSorting}
				className="bc-plugin-table"
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
