import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { SetStateAction, useMemo, useReducer } from "react";

import { CommandData } from "@/types";

export interface CommandTableProps {
	data: CommandData[];
	// setData: (data: CommandMeta[]) => void;
	sorting: SortingState;
	setSorting: (value: SetStateAction<SortingState>) => void;
	className: string;
}

export const CommandTable = ({
	data,
	// setData,
	sorting,
	setSorting,
	className,
}: CommandTableProps) => {
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
				id: "isListed",
				header: "Listed",
				accessorKey: "isListed",
				cell: (info) => info.getValue() ? 'T' : '',
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
