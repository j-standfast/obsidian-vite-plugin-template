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
import React, { SetStateAction, useMemo, useReducer, useState } from "react";

import type { PluginMeta } from "@/types";

export interface PluginTableProps {
	data: PluginMeta[];
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

type Booleanish = boolean | null | undefined;
type BooleanishOptions = { null?: Booleanish; undefined?: Booleanish };
const boolCellOption = (
	info: CellContext<PluginMeta, unknown>,
	options?: BooleanishOptions
) => {
	let value = info.getValue() as Booleanish;
	if (value === null && options?.null !== undefined) {
		value = options.null;
	} else if (value === undefined && options?.undefined !== undefined) {
		value = options.undefined;
	}
	return <BoolCell value={value} />;
};

export const PluginTable = ({ data, className }: PluginTableProps) => {
	// initial sorting state; see:
    // https://tanstack.com/table/latest/docs/guide/sorting#initial-sorting-state
    const [sorting, setSorting] = useState<SortingState>([
        {
            id: 'isEnabled',
            desc: true,
        },
        {
            id: 'isCore',
            desc: true,
        },
        {
            id: 'name',
            desc: false,
        }
    ]);

	const columns = useMemo<ColumnDef<PluginMeta>[]>(
		() => [
            {
				id: "name",
				header: "Name",
				accessorKey: "name",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "id",
				header: "ID",
				accessorKey: "id",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "isCore",
				header: "Core?",
				accessorKey: "isCore",
				cell: (info) =>
					boolCellOption(info, { null: false, undefined: false }),
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
				cell: (info) =>
					boolCellOption(info, { null: false, undefined: false }),
				sortUndefined: "last",
			},
			{
				id: "isUserDisabled",  // should never be true (2025-01-20) because data refresh waits for plugin to be removed (transition state lasting <10ms)
				header: "User Disabled",
				accessorKey: "isUserDisabled",
				cell: boolCellOption,
				sortUndefined: "last",
			},
			{
				id: "isInstantiated",
				header: "Instantiated",
				accessorKey: "isInstantiated",
				cell: (info) =>
					boolCellOption(info, { null: false, undefined: true }),
				sortUndefined: "last",
			},
			{
				id: "lastDataModifiedTime",
				header: "Modified",
				accessorKey: "lastDataModifiedTime",
				cell: (info) => {
					const date = info.getValue();
					return date === null || date === undefined
						? "--"
						: date.valueOf() === 0
						? "-"
						: date.toLocaleString();
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
			sorting,
		},
        initialState: {
            columnVisibility: {
                name: true,
                id: true,
                isCore: true,
                isInstantiated: false,
                isLoaded: false,
                isEnabled: true,
                isUserDisabled: false,
                lastDataModifiedTime: true,
            },
            // initial sorting state in useState call; see https://tanstack.com/table/latest/docs/guide/sorting#initial-sorting-state
        }
	});

	return (
		<div className={className}>
			<div>
				<label>
					<input
						{...{
							type: "checkbox",
							checked: table.getIsAllColumnsVisible(),
							onChange:
								table.getToggleAllColumnsVisibilityHandler(),
						}}
					/>{" "}
					Toggle All
				</label>
				{table.getAllLeafColumns().map((col) => {
					return (
						<div key={col.id}>
							<label>
								<input
									{...{
										type: "checkbox",
										checked: col.getIsVisible(),
										onChange:
											col.getToggleVisibilityHandler(),
									}}
								/>{" "}
								{col.id}
							</label>
						</div>
					);
				})}
			</div>
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
