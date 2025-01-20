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
import type {
	PluginMeta,
} from "@/types";
import { PluginTable } from "./PluginsTable";

export interface PluginsDashboardProps {
	dataManager: TailorCutsDataManager;
}
export const PluginsDashboard = ({
	dataManager,
}: PluginsDashboardProps): ReactNode => {
	const [todoWhatIsThis, rerender] = useReducer(() => ({}), {});
	const [pluginSorting, setPluginSorting] = useState<SortingState>([]);
    const [pluginData, setPluginData] = useState<PluginMeta[]>([]);

    useEffect(() => {
        const unsubscribe = dataManager.subscribePluginChange((plugins) => {
            setPluginData(plugins);
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
			<h1>Plugins Dashboard</h1>
			<button
				onClick={() => {
					console.log("commands dashboard button click", {
						pluginData,
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
				data={pluginData}
				// setData={setPluginData}
				sorting={pluginSorting}
				setSorting={setPluginSorting}
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
