import type {
	ColumnDef,
	SortingState,
	ColumnFiltersState,
	filterFns,
} from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
	getFilteredRowModel,
} from "@tanstack/react-table";
import { SetStateAction, useMemo, useReducer, useState } from "react";

import { CommandData } from "@/_DataManager/types";

export interface CommandTableProps {
	data: CommandData[];
	// setData: (data: CommandMeta[]) => void;
	className: string;
}

import { boolCellOption, ColumnFilter } from "@/components/shared-table";

export const CommandTable = ({ data, className }: CommandTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "name",
			desc: false,
		},
		{
			id: "isListed",
			desc: true,
		},
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const columns = useMemo<ColumnDef<CommandData>[]>(
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
				id: "pluginType",
				header: "pluginType",
				accessorFn: (row) => row.pluginType ?? "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "pluginId",
				header: "pluginId",
				accessorFn: (row) => row.pluginId ?? "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "pluginEnabled",
				header: "pluginEnabled",
				accessorFn: (row) => row.pluginEnabled,
				cell: (info) => boolCellOption(info),
				filterFn: "includesString",
				sortUndefined: "last",
			},
			{
				id: "idContext",
				header: "idContext",
				accessorFn: (row) => row.idContext?.join(", ") ?? "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "nameContext",
				header: "nameContext",
				accessorFn: (row) => row.nameContext?.join(", ") ?? "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "isListed",
				header: "isListed",
				accessorFn: (row) => row.isIn.listedCommand,
				cell: (info) => boolCellOption(info),
				filterFn: "includesString",
				sortUndefined: "last",
			},
			{
				id: "isFound",
				header: "isFound",
				accessorFn: (row) => row.isIn.foundCommand,
				cell: (info) => boolCellOption(info),
				filterFn: "includesString",
				sortUndefined: "last",
			},
			{
				id: "isCorePluginCommand",
				header: "isCorePluginCommand",
				accessorFn: (row) => row.isIn.internalPluginCommand,
				cell: (info) => boolCellOption(info),
				filterFn: "includesString",
				sortUndefined: "last",
			},
			{
				id: "isCommandCommand",
				header: "isCommandCommand",
				accessorFn: (row) => row.isIn.appCommand,
				filterFn: "includesString",
				cell: (info) => boolCellOption(info),
				sortUndefined: "last",
			},
			{
				id: "hasCallback",
				header: "hasCallback",
				accessorFn: (row) => row.callbacks.callback,
				filterFn: "includesString",
				cell: (info) => boolCellOption(info),
				sortUndefined: "last",
			},
			{
				id: "hasCheckCallback",
				header: "hasCheckCallback",
				accessorFn: (row) => row.callbacks.checkCallback,
				filterFn: "includesString",
				cell: (info) => boolCellOption(info),
				sortUndefined: "last",
			},
			{
				id: "isEditorCommand",
				header: "isEditorCommand",
				accessorFn: (row) => row.isIn.appEditorCommand,
				filterFn: "includesString",
				cell: (info) => boolCellOption(info),
				sortUndefined: "last",
			},
			{
				id: "hasEditorCallback",
				header: "hasEditorCallback",
				accessorFn: (row) => row.callbacks.editorCallback,
				filterFn: "includesString",
				cell: (info) => boolCellOption(info),
				sortUndefined: "last",
			},
			{
				id: "hasEditorCheckCallback",
				header: "hasEditorCheckCallback",
				accessorFn: (row) => row.callbacks.editorCheckCallback,
				filterFn: "includesString",
				cell: (info) => boolCellOption(info),
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
		getFilteredRowModel: getFilteredRowModel(),
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		filterFns: {},
		state: {
			sorting,
			columnFilters,
		},
	});
	const [todoWhatIsThis, rerender] = useReducer(() => ({}), {});

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
												<>
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
															header.column
																.columnDef
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
													{header.column.getCanFilter() ? (
														<div>
															<ColumnFilter
																column={
																	header.column
																}
															/>
														</div>
													) : null}
												</>
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
