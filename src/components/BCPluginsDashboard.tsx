import type { SortingState } from "@tanstack/react-table";
import React, {
	ReactNode,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from "react";
import { RotateCcw } from "lucide-react";

import type { BCDataManager } from "src/data/BCDataManager";
import type { CommandMeta, KeybindingMeta, PluginMeta } from "src/types";
import type { BCPluginsView } from "src/views/BCPluginsView";
import { CommandTable } from "./CommandTable";
import { Keeb } from "./Keeb";
import { KeybindingTable } from "./KeybindingTable";
import { PluginTable } from "./PluginTable";
import { PropertyWatcher } from "src/propertyWatcher";

interface UseBCDashboardDataReturn {
	commandData: CommandMeta[];
	pluginData: PluginMeta[];
	keybindingData: KeybindingMeta[];
	refresh: () => void;
}

interface UseBCDashboardDataProps {
	view: BCPluginsView;
	dataManager: BCDataManager;
}

const useDashboardData = ({
	view,
	dataManager,
}: UseBCDashboardDataProps): UseBCDashboardDataReturn => {
	const [commandData, setCommandData] = useState<CommandMeta[]>([]);
	const [pluginData, setPluginData] = useState<PluginMeta[]>([]);
	const [keybindingData, setKeybindingData] = useState<KeybindingMeta[]>([]);

	const refresh = useCallback(async () => {
		dataManager.onDataLoaded(async (dataManager) => {
			const { commandData, pluginData, keybindingData } =
				dataManager.getAllData();
			setCommandData(commandData);
			setPluginData(pluginData);
			setKeybindingData(keybindingData);
		}, true);
	}, [
		view,
		dataManager,
		dataManager.app,
		dataManager.app.plugins,
		setCommandData,
		setPluginData,
		setKeybindingData,
	]);

	useEffect(() => {
		const watcher = new PropertyWatcher(
			() => dataManager.app.plugins.plugins,
			() => {
				console.log("plugins changed - PropertyWatcher 1");
				refresh();
			},
			100
		);
        // note - the plugins object is mutated on enable/disable, so this is a bit of a hack
		const watcher2 = new PropertyWatcher(
			() => Object.values(dataManager.app.plugins.plugins).map((p) => p.manifest.id).join(','),
			(prev, curr) => {
				console.log("plugins changed - PropertyWatcher 2", { prev, curr });    
				refresh();
			},
			250
		);
        watcher.start();
        watcher2.start();
		refresh();
		return () => {
			watcher.stop();
			watcher2.stop();
		};
	}, [view, refresh, dataManager]);

	return { commandData, pluginData, keybindingData, refresh };
};

export interface BCDashboardProps {
	view: BCPluginsView;
	dataManager: BCDataManager;
}
export const BCPluginsDashboard = ({
	view,
	dataManager,
}: BCDashboardProps): ReactNode => {
	const [todoWhatIsThis, rerender] = useReducer(() => ({}), {});
	const { commandData, pluginData, keybindingData, refresh } =
		useDashboardData({ view, dataManager });
	const [commandSorting, setCommandSorting] = useState<SortingState>([]);
	const [pluginSorting, setPluginSorting] = useState<SortingState>([]);
	const [keybindingSorting, setKeybindingSorting] = useState<SortingState>(
		[]
	);

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
					refresh();
					rerender();
					console.log("plugins dashboard refresh/rerender");
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
