import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";

import { KeybindingsTable } from "./keybindings/KeybindingsTable";
import { PluginsTable } from "./plugins/PluginsTable";
import { CommandsTable } from "./commands/CommandsTable";
import { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import type { TailorCutsData } from "@/types";

interface DashboardSelectorProps {
	dataManager: TailorCutsDataManager;
}

const DASHBOARD_KINDS = ["plugins", "commands", "keybindings"] as const;
type DashboardKind = (typeof DASHBOARD_KINDS)[number];

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
	const bgColor = isSelected ? "hsl(0, 0%, 90%)" : "transparent";
	return (
		<button
			onClick={() => setSelectedDashboard(kind)}
			style={{ backgroundColor: bgColor }}
		>
			{kind}
		</button>
	);
};

export const DashboardSelector = ({ dataManager }: DashboardSelectorProps) => {
	const componentId = "tailor-cuts-dashboard"; // TODO? dynamic?

	const [dashKind, setDashKind] = useState<DashboardKind>("plugins");
	const [data, setData] = useState<TailorCutsData>({
    plugins: [],
    commands: [],
    keybindings: [],
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
				<h1>Keybindings Dashboard</h1>
        {dashKind === "keybindings" && (
            <KeybindingsTable data={data.keybindings} className="barraclough-tailor-cuts-keybindings-table" />
          )
        }
				{dashKind === "plugins" && (
					<PluginsTable data={data.plugins} className="barraclough-tailor-cuts-plugins-table" />
				)}
				{dashKind === "commands" && (
					<CommandsTable data={data.commands} className="barraclough-tailor-cuts-commands-table" />
				)}
			</div>
		</div>
	);
};
