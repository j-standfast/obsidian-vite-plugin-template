import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { DASHBOARD_KINDS } from "@/constants/plugin";
import { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import type { DashboardKind, TailorCutsData } from "@/types";
import { CommandsTable } from "./CommandsTable";
import { KeybindingsTable } from "./KeybindingsTable2";
import { PluginsTable } from "./PluginsTable";

interface TailorCutsDashboardProps {
	dataManager: TailorCutsDataManager;
}

const DashboardKindButton = ({
	kind,
	selectedDashboard,
	setSelectedDashboard,
}: {
	kind: DashboardKind;
	selectedDashboard: DashboardKind;
	setSelectedDashboard: (kind: DashboardKind) => void;
}) => {
	const isSelected = selectedDashboard === kind;
	const bgColor = isSelected ? "hsl(0, 0%, 25%)" : "transparent";
	return (
		<button
			onClick={() => setSelectedDashboard(kind)}
			style={{ backgroundColor: bgColor }}
		>
			{kind}
		</button>
	);
};

export const TailorCutsDashboard = ({
	dataManager,
}: TailorCutsDashboardProps) => {
	const componentId = "tailor-cuts-dashboard"; // TODO? dynamic?

	const [dashKind, setDashKind] = useState<DashboardKind>("keybindings");
	const [data, setData] = useState<TailorCutsData>({
		plugins: [],
		commands: [],
		keybindings: {
      hotkeyTableData: [],
      hotkeyMeta: [],
    },
	});
	useEffect(() => {
		const unsubscribe = dataManager.subscribe({
			callback: (data) => {
				setData(data);
			},
			name: componentId,
			interestedIn: { commands: true, keybindings: true, plugins: true },
		});
		return () => {
			unsubscribe();
		};
	}, [dataManager]);

	return (
		<div>
			<div>
				{DASHBOARD_KINDS.map((kind) => (
					<DashboardKindButton
						key={kind}
						kind={kind}
						selectedDashboard={dashKind}
						setSelectedDashboard={setDashKind}
					/>
				))}
				<button
					onClick={() => {
						console.log("refresh button onClick", {
							data,
							dataManager,
							app: dataManager.plugin.app,
							plugins: dataManager.plugin.app.plugins.plugins,
						});
						setDashKind(dashKind);
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
			</div>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					alignItems: "center",
					justifyContent: "start",
					gap: "10px",
				}}
			>
				<h1>{dashKind.charAt(0).toUpperCase() + dashKind.slice(1)}</h1>
				{dashKind === "keybindings" && (
					<KeybindingsTable
						data={data.keybindings.hotkeyMeta}
						className="barraclough-tailor-cuts-keybindings-table"
					/>
				)}
				{dashKind === "plugins" && (
					<PluginsTable
						data={data.plugins}
						className="barraclough-tailor-cuts-plugins-table"
					/>
				)}
				{dashKind === "commands" && (
					<CommandsTable
						data={data.commands}
						className="barraclough-tailor-cuts-commands-table"
					/>
				)}
			</div>
		</div>
	);
};