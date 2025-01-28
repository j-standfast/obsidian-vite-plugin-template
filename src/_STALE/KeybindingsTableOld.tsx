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

import { CommandId, HotkeyTableDatum } from "@/types";
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

  const summaryStats = useMemo(() => {
    return data.reduce((acc, row) => {
      acc.totalBaked += row.isBaked ? 1 : 0;
      acc.totalShouldBeBaked += row.probablyShouldBeBaked ? 1 : 0;
      acc.nRows += 1;
      return acc;
    }, { totalBaked: 0, totalShouldBeBaked: 0, nRows: 0 });
  }, [data]);

	const columns = useMemo<ColumnDef<HotkeyTableDatum>[]>(
		() => [
      {
        id: "keysig",
        header: "Keysig",
        accessorKey: "keysig",
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
        id: "probablyShouldBeBaked",
        header: "shouldBeBaked",
        accessorFn: (row) => row.probablyShouldBeBaked,
        cell: (info) => boolCellOption(info),
        filterFn: "includesString",
        sortUndefined: "last",
      },
      {
        id: "bakedCommandIdsForKeysig",
        header: "bakedIds",
        accessorKey: "bakedCommandIdsForKeysig",
        cell: (info) => ((info.getValue() ?? []) as CommandId[]).join(", "),
        sortUndefined: "last",
      },
      {
        id: "isEffectiveHotkey",
        header: "Effective?",
        accessorFn: (row) => row.isEffectiveHotkey,
        cell: (info) => boolCellOption(info),
        filterFn: "includesString",
        sortUndefined: "last",
      },    
			{
				id: "isDefaultHotkey",
				header: "isDefault",
				accessorFn: (row) => row.isDefaultHotkey,
				cell: (info) => boolCellOption(info),   
				filterFn: "includesString",
				sortUndefined: "last",
			},
      {
        id: "isOverridden",
        header: "isOverridden",
        accessorFn: (row) => row.isOverridden,
        cell: (info) => boolCellOption(info),
        filterFn: "includesString",
        sortUndefined: "last",
      },
      {
        id: "keysigsOverriddenBy",
        header: "Keysigs Overridden By",
        accessorKey: "keysigsOverriddenBy",
        cell: (info) => info.getValue(),
        sortUndefined: "last",
      },
      {
        id: "isOverriding",
        header: "Is Overriding",
        accessorFn: (row) => row.isOverriding,
        cell: (info) => boolCellOption(info),
        filterFn: "includesString",
        sortUndefined: "last",
      },
      {
        id: "keysigsOverriding",
        header: "Keysigs Overriding",
        accessorKey: "keysigsOverriding",
        cell: (info) => info.getValue(),
        sortUndefined: "last",
      },
      {
        id: "conflictingCommandIds",
        header: "Conflicting Command IDs",
        accessorKey: "conflictingCommandIds",
        cell: (info) => ((info.getValue() ?? []) as CommandId[]).join(", "),
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
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div>Total Baked: {summaryStats.totalBaked}</div>
        <div>Total Should Be Baked: {summaryStats.totalShouldBeBaked}</div>
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
