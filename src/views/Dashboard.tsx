import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { DataManager } from "@/_DataManager/DataManager";
import type { TailoredCutsData } from "@/types";
import { CommandTable } from "./CommandTable";
import { KeybindingTable } from "./KeybindingTable";
import { PluginTable } from "./PluginTable";

export const DASHBOARD_TYPES = ["plugins", "commands", "keybindings"] as const;
export type DashboardType = (typeof DASHBOARD_TYPES)[number];

interface DashboardProps {
	dataManager: DataManager;
}

const DashboardTypeButton = ({
	dashboardType: dashboardType,
	selectedDashboard,
	setSelectedDashboard,
}: {
	dashboardType: DashboardType;
	selectedDashboard: DashboardType;
	setSelectedDashboard: (dashboardType: DashboardType) => void;
}) => {
	const isSelected = selectedDashboard === dashboardType;
	const bgColor = isSelected ? "hsl(0, 0%, 25%)" : "transparent";
	return (
		<button
			onClick={() => setSelectedDashboard(dashboardType)}
			style={{ backgroundColor: bgColor }}
		>
			{dashboardType}
		</button>
	);
};

export const Dashboard = ({ dataManager }: DashboardProps) => {
	const componentId = "tailored-cuts-dashboard"; // TODO? dynamic?

	const [dashType, setDashType] = useState<DashboardType>("keybindings");
	const [data, setData] = useState<TailoredCutsData>({
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
				{DASHBOARD_TYPES.map((dashboardType) => (
					<DashboardTypeButton
						key={dashboardType}
						dashboardType={dashboardType}
						selectedDashboard={dashType}
						setSelectedDashboard={setDashType}
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
						setDashType(dashType);
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
				<h1>{dashType.charAt(0).toUpperCase() + dashType.slice(1)}</h1>
				{dashType === "keybindings" && (
					<KeybindingTable
						data={data.keybindings.hotkeyMeta}
						className="barraclough-tailored-cuts-keybindings-table"
					/>
				)}
				{dashType === "plugins" && (
					<PluginTable
						data={data.plugins}
						className="barraclough-tailored-cuts-plugins-table"
					/>
				)}
				{dashType === "commands" && (
					<CommandTable
						data={data.commands}
						className="barraclough-tailored-cuts-commands-table"
					/>
				)}
			</div>
		</div>
	);
};
