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

import { KeybindingMeta } from "@/types";

export interface KeybindingsTableProps {
	data: KeybindingMeta[];
	// setData: (data: CommandMeta[]) => void;
	className: string;
}

import { boolCellOption, ColumnFilter } from "@/components/shared-table";

export const KeybindingsTable = ({
	data,
	className,
}: KeybindingsTableProps) => {
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

	const columns = useMemo<ColumnDef<KeybindingMeta>[]>(
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
