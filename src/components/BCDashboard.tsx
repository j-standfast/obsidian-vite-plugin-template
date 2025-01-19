import type { SortingState } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";
import React, { useCallback, useEffect, useReducer, useState } from "react";

import type { BCDataManager } from "src/data/BCDataManager";
import type { CommandMeta, KeybindingMeta, PluginMeta } from "src/types";
import type { BCDashboardView } from "src/views/BCDashboardView";
import { CommandTable } from "./CommandTable";
import { Keeb } from "./Keeb";
import { KeybindingTable } from "./KeybindingTable";
import { PluginTable } from "./PluginTable";

interface UseBCDashboardDataReturn {
	commandData: CommandMeta[];
	pluginData: PluginMeta[];
	keybindingData: KeybindingMeta[];
	refresh: () => void;
}

interface UseBCDashboardDataProps {
	view: BCDashboardView;
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
		const { commandData, pluginData, keybindingData } =
			await dataManager.onDataLoaded((dataManager) =>
				dataManager.getAllData()
			);
		setCommandData(commandData);
		setPluginData(pluginData);
		setKeybindingData(keybindingData);
	}, [dataManager, setCommandData, setPluginData, setKeybindingData]);

	useEffect(() => {
		refresh();
	}, [view]);

	return { commandData, pluginData, keybindingData, refresh };
};

export interface BCDashboardProps {
	view: BCDashboardView;
	dataManager: BCDataManager;
}
export const BCDashboard = ({ view, dataManager }: BCDashboardProps) => {
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
			<h1>Tailor Cuts Dashboard</h1>
			<button
				onClick={() => {
					refresh();
					rerender();
					console.log("dashboard refresh/rerender");
				}}
				className="bc-refresh-button"
				style={{
					color: "red",
					backgroundColor: "white",
					border: "1px solid red",
				}}
			>
				kello?
				{/* <RotateCcw /> */}
			</button>
			<Keeb />
			<CommandTable
				data={commandData}
				// setData={setCmdData}
				sorting={commandSorting}
				setSorting={setCommandSorting}
				className="bc-command-table"
			/>
			<PluginTable
				data={pluginData}
				// setData={setPluginData}
				sorting={pluginSorting}
				setSorting={setPluginSorting}
				className="bc-plugin-table"
			/>
			<KeybindingTable
				data={keybindingData}
				// setData={setKeybindingData}
				sorting={keybindingSorting}
				setSorting={setKeybindingSorting}
				className="bc-keybinding-table"
			/>
		</div>
	);
};
