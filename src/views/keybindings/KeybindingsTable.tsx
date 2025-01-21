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

import { HotkeyTableDatum } from "@/types";
import { boolCellOption, ColumnFilter } from "@/components/shared-table"; 

export interface KeybindingsTableProps {
	data: HotkeyTableDatum[];
	// setData: (data: CommandMeta[]) => void;
	className: string;
}

export const KeybindingsTable = ({
	data,
	className,
}: KeybindingsTableProps) => {
	const [sorting, setSorting] = useState<SortingState>([
		{
			id: "commandId",
			desc: false,
		},
	]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

	const columns = useMemo<ColumnDef<HotkeyTableDatum>[]>(
		() => [
			{
				id: "commandId",
				header: "Command ID",
				accessorKey: "commandId",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "obsidianModifiers",
				header: "Obsidian Modifiers",
				accessorKey: "obsidianModifiers",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "obsidianKey",
				header: "Obsidian Key",
				accessorKey: "obsidianKey",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "isDefault",
				header: "Is Default",
				accessorFn: (row) => row.isDefault,
				cell: (info) => boolCellOption(info),   
				filterFn: "includesString",
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
