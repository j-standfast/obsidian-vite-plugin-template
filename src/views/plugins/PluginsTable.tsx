import type {
	CellContext,
	ColumnDef,
	SortingState,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import React, { SetStateAction, useMemo, useReducer } from "react";

import type { PluginMeta } from "@/types";

export interface PluginTableProps {
	data: PluginMeta[];
	// setData: (data: PluginMeta[]) => void;
	sorting: SortingState;
	setSorting: (value: SetStateAction<SortingState>) => void;
	className: string;
}

const BoolCircle = ({ value }: { value: boolean | null | undefined }) => {
	const fill =
		value === undefined
			? undefined
			: value === null
			? "gray"
			: value
			? "green"
			: "red";
	return (
		<div
			style={{
				backgroundColor: fill,
				border: "1px solid black",
				width: "5px",
				height: "5px",
				borderRadius: "9999px",
			}}
		/>
	);
};

const BoolCell = ({ value }: { value: boolean | null | undefined }) => {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<BoolCircle value={value} />
		</div>
	);
};

const boolCellOption: ColumnDef<
	PluginMeta,
	unknown // boolean | null | undefined
>["cell"] = (info: CellContext<PluginMeta, unknown>) => (
	<BoolCell value={info.getValue() as boolean | null | undefined} />
);

export const PluginTable = ({
	data,
	// setData,
	sorting,
	setSorting,
	className,
}: PluginTableProps) => {
    const columns = useMemo<ColumnDef<PluginMeta>[]>(
		() => [
			{
				id: "id",
				header: "ID",
				accessorKey: "id",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "name",
				header: "Name",
				accessorKey: "name",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "isInternal",
				header: "Internal",
				accessorKey: "isInternal",
				cell: boolCellOption,
				sortUndefined: "last",
			},
			{
				id: "isEnabled",
				header: "Enabled",
				accessorKey: "isEnabled",
				cell: boolCellOption,
				sortUndefined: "last",
			},
			{
				id: "isLoaded",
				header: "Loaded",
				accessorKey: "isLoaded",
				cell: boolCellOption,
				sortUndefined: "last",
			},
			{
				id: "isUserDisabled",
				header: "User Disabled",
				accessorKey: "isUserDisabled",
				cell: boolCellOption,
				sortUndefined: "last",
			},
			{
				id: "isInstantiated",
				header: "Instantiated",
				accessorKey: "isInstantiated",
				cell: boolCellOption,
				sortUndefined: "last",
			},
			{
				id: "lastDataModifiedTime",
				header: "Last Data Modified Time",
				accessorKey: "lastDataModifiedTime",
				cell: (info) => {
					const date = info.getValue();
					// console.log({date});
					if (date === null || date === undefined)
						return String(date);
					if (date.valueOf() === 0) return "-";
					return date.toLocaleString();
				},
				sortUndefined: "last",
			},
		],
		[]
	);
	const table = useReactTable({
		data: data,
		columns: columns,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting: sorting,
		},
	});
	

	return (
		<div className={className}>
			<table>
				<thead>
					{table.getHeaderGroups().map((headerGroup) => {
						// console.log({ headerGroup });
						return (
							<tr key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									// console.log({ header });
									return (
										<th
											key={header.id}
											colSpan={header.colSpan}
										>
											{header.isPlaceholder ? null : (
												<div
													className={
														header.column.getCanSort()
															? "cursor-pointer select-none"
															: ""
													}
													onClick={header.column.getToggleSortingHandler()}
													title={
														header.column.getCanSort()
															? header.column.getNextSortingOrder() ===
															  "asc"
																? "Sort ascending"
																: header.column.getNextSortingOrder() ===
																  "desc"
																? "Sort descending"
																: "Clear sort"
															: undefined
													}
												>
													{flexRender(
														header.column.columnDef
															.header,
														header.getContext()
													)}
													{{
														asc: " 🔼",
														desc: " 🔽",
													}[
														header.column.getIsSorted() as string
													] ?? null}
												</div>
											)}
										</th>
									);
								})}
							</tr>
						);
					})}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => {
						return (
							<tr key={row.id}>
								{row.getVisibleCells().map((cell) => (
									<td key={cell.id}>
										{flexRender(
											cell.column.columnDef.cell,
											cell.getContext()
										)}
									</td>
								))}
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
};
