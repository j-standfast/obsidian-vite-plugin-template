import React, {
	ReactNode,
	useEffect,
	useState,
} from "react";
import { RotateCcw } from "lucide-react";

import type { TailorCutsDataManager } from "@/DataManager/TailorCutsDataManager";
import type { PluginMeta } from "@/types";
import { PluginsTable } from "./PluginsTable";

export interface PluginsDashboardProps {
	dataManager: TailorCutsDataManager;
}
export const PluginsDashboard = ({
	dataManager,
}: PluginsDashboardProps): ReactNode => {
	console.log("PluginsDashboard rerender");

	// const [todoWhatIsThis, rerender] = useReducer(() => ({}), {});
	const [data, setData] = useState<PluginMeta[]>([]);

	useEffect(() => {
		const unsubscribe = dataManager.subscribe({
			callback: ({ plugins: data }) => {  
				setData(data);
			},
			name: "plugins-dashboard",
			interestedIn: { plugins: true },
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
					console.log("PluginsDashboard refresh button onClick", {
						pluginData: data,
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
			<PluginsTable
				data={data}
				className="barraclough-tailor-cuts-plugins-table"
			/>
		</div>
	);
};
