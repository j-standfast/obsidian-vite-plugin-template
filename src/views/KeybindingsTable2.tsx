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

import { CommandId, HotkeyMeta } from "@/types";
import { boolCellOption, ColumnFilter } from "@/components/shared-table";

interface KeybindingsTableProps {
	data: HotkeyMeta[];
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

	const summaryStats = useMemo(() => {
		if (!data) return { totalBaked: 0, totalShouldBeBaked: 0, nRows: 0 };  // TODO
		return data.reduce(
			(acc, row) => {
				acc.totalBaked += row.isBaked ? 1 : 0;
				acc.nRows += 1;
				return acc;
			},
			{ totalBaked: 0, totalShouldBeBaked: 0, nRows: 0 }
		);
	}, [data]);

	const columns = useMemo<ColumnDef<HotkeyMeta>[]>(
		() => [
			{
				id: "keysig",
				header: "Keysig",
				accessorKey: "keysig",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "commandId",
				header: "Command ID",
				accessorKey: "commandId",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "isBaked",
				header: "isBaked",
				accessorFn: (row) => row.isBaked,
				cell: (info) => boolCellOption(info),
				filterFn: "includesString",
				sortUndefined: "last",
			},
			{
				id: "bakedIdx",
				header: "bakedIdx",
				accessorFn: (row) => row.bakedIdx,
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "bakedKeysig",
				header: "bakedKeysig",
				accessorFn: (row) => row.bakedKeysig,
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "bakedKeysigCheck",
				header: "bakedKeysigCheck",
				accessorFn: (row) =>
					row.bakedKeysig === (row.isBaked ? row.keysig : undefined),
				cell: (info) => boolCellOption(info),
				sortUndefined: "last",
			},
			{
				id: "bakedCommandIdsForKeysig",
				header: "bakedIds",
				accessorKey: "bakedCommandIdsForKeysig",
				cell: (info) =>
					((info.getValue() ?? []) as CommandId[]).join(", "),
				sortUndefined: "last",
			},
			{
				id: "isCustom",
				header: "isCustom",
				accessorFn: (row) => row.isCustom,
				cell: (info) => boolCellOption(info),
				filterFn: "includesString",
				sortUndefined: "last",
			},
			{
				id: "conflictingHotkeyMetaIds",
				header: "conflicts",
				accessorFn: (row) =>
					row.conflictingHotkeyMetaIds
						? row.conflictingHotkeyMetaIds.join(", ")
						: "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "preConflictingHotkeyMetaIds",
				header: "preConflicts",
				accessorFn: (row) =>
					row.preConflictingHotkeyMetaIds
						? row.preConflictingHotkeyMetaIds.join(", ")
						: "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "remappedHotkeyMetaIds",
				header: "remapped",
				accessorFn: (row) =>
					row.remappedHotkeyMetaIds
						? row.remappedHotkeyMetaIds.join(", ")
						: "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
      {
				id: "preRemappedHotkeyMetaIds",
				header: "preRemapped",
				accessorFn: (row) =>
					row.preRemappedHotkeyMetaIds
						? row.preRemappedHotkeyMetaIds.join(", ")
						: "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
      {
				id: "shadowHotkeyMetaIds",
				header: "shadow",
				accessorFn: (row) =>
					row.shadowHotkeyMetaIds
						? row.shadowHotkeyMetaIds.join(", ")
						: "-",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "preShadowHotkeyMetaIds",
				header: "preShadow",
				accessorFn: (row) =>
					row.preShadowHotkeyMetaIds
						? row.preShadowHotkeyMetaIds.join(", ")
						: "-",
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
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "10px",
				}}
			>
				<div>Total Baked: {summaryStats.totalBaked}</div>
				<div>
					Total Should Be Baked: {summaryStats.totalShouldBeBaked}
				</div>
				<div>Total Rows: {summaryStats.nRows}</div>
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
