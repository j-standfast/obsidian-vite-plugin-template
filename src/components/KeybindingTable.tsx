import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { SetStateAction, useMemo, useReducer } from "react";

import { KeybindingMeta } from "src/types";

export interface KeybindingTableProps {
	data: KeybindingMeta[];
	// setData: (data: KeybindingMeta[]) => void;
	sorting: SortingState;
	setSorting: (value: SetStateAction<SortingState>) => void;
    className: string;
}

export const KeybindingTable = ({
	data,
	// setData,
	sorting,
	setSorting,
	className,
}: KeybindingTableProps) => {
	const columns = useMemo<ColumnDef<KeybindingMeta>[]>(
		() => [
			{
				id: "commandId",
				header: "Command ID",
				accessorKey: "commandId",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
			{
				id: "commandName",
				header: "Command Name",
				accessorKey: "commandName",
				cell: (info) => info.getValue(),
				sortUndefined: "last",
			},
            {
				id: "isListed",
				header: "Listed",
				accessorKey: "isListed",
				cell: (info) => info.getValue() ? 'T' : '',
				sortUndefined: "last",
			},
            {
                id: "isDefault",
                header: "Default",
                accessorKey: "isDefault",
                cell: (info) => info.getValue() ? 'T' : '',
                sortUndefined: "last",
            },
			{
				id: "keysig",
				header: "Keys",
				accessorKey: "keysig",
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
		onSortingChange: setSorting,
		state: {
			sorting: sorting,
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
