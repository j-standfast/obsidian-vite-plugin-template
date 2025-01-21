import { useState } from "react";
import { KeybindingsDashboard } from "./keybindings/KeybindingsDashboard";
import { PluginsDashboard } from "./plugins/PluginsDashboard";
import { CommandsDashboard } from "./commands/CommandsDashboard";
import { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";

interface DashboardSelectorProps {
	dataManager: TailorCutsDataManager;
}

export const DashboardSelector = ({ dataManager }: DashboardSelectorProps) => {
	const [selectedDashboard, setSelectedDashboard] =
		useState<string>("plugins");

	return (
		<div>
			<div>
				<button onClick={() => setSelectedDashboard("plugins")}>
					Plugins
				</button>
				<button onClick={() => setSelectedDashboard("commands")}>
					Commands
				</button>
				<button onClick={() => setSelectedDashboard("keybindings")}>
					Keybindings
				</button>
			</div>
			<div>
				{selectedDashboard === "plugins" && (
					<PluginsDashboard dataManager={dataManager} />
				)}
				{selectedDashboard === "commands" && (
					<CommandsDashboard dataManager={dataManager} />
				)}
				{selectedDashboard === "keybindings" && (
					<KeybindingsDashboard dataManager={dataManager} />
				)}
			</div>
		</div>
	);
};
