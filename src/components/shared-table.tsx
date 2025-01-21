import type { CellContext, Column } from "@tanstack/react-table";
import React, { useState, useEffect } from "react";

import type { PluginMeta } from "@/types";

type Booleanish = boolean | null | undefined;
type BooleanishOptions = { null?: Booleanish; undefined?: Booleanish };

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

export const boolCellOption = (
	info: CellContext<any, unknown>, // TODO: fix this
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

export const DebouncedInput = ({
	value: initialValue,
	onChange,
	debounce = 500,
	...props
}: {
	value: string | number;
	onChange: (value: string | number) => void;
	debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) => {
	const [value, setValue] = useState(initialValue);

	useEffect(() => {
		setValue(initialValue);
	}, [initialValue]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			onChange(value);
		}, debounce);
		return () => clearTimeout(timeout);
	}, [value]);

	return (
		<input
			{...props}
			value={value}
			onChange={(e) => {
				console.log("DebouncedInput onChange", e.target.value);
				setValue(e.target.value);
			}}
		/>
	);
};

export function ColumnFilter({ column }: { column: Column<any, unknown> }) {
	const columnFilterValue = column.getFilterValue();
	const { filterVariant } = column.columnDef.meta ?? {
		filterVariant: "text",
	};

	return filterVariant === "range" ? (
		<div>
			<div className="flex space-x-2">
				{/* See faceted column filters example for min max values functionality */}
				<DebouncedInput
					type="number"
					value={(columnFilterValue as [number, number])?.[0] ?? ""}
					onChange={(value) => {
						console.log("ColumnFilter / range min onChange", value);
						column.setFilterValue((old: [number, number]) => [
							value,
							old?.[1],
						]);
					}}
					placeholder={`Min`}
					className="w-24 border shadow rounded"
				/>
				<DebouncedInput
					type="number"
					value={(columnFilterValue as [number, number])?.[1] ?? ""}
					onChange={(value) => {
						console.log(
							"ColumnFilter / number range: max onChange",
							value
						);
						column.setFilterValue((old: [number, number]) => [
							old?.[0],
							value,
						]);
					}}
					placeholder={`Max`}
					className="w-24 border shadow rounded"
				/>
			</div>
			<div className="h-1" />
		</div>
	) : filterVariant === "select" ? (
		<select
			onChange={(e) => {
				console.log("ColumnFilter / select onChange", e.target.value);
				column.setFilterValue(e.target.value);
			}}
			value={columnFilterValue?.toString()}
		>
			{/* See faceted column filters example for dynamic select options */}
			<option value="">All</option>
			<option value="complicated">complicated</option>
			<option value="relationship">relationship</option>
			<option value="single">single</option>
		</select>
	) : (
		<DebouncedInput
			className="w-36 border shadow rounded"
			onChange={(value) => {
				console.log("ColumnFilter / text onChange", value);
				column.setFilterValue(value);
			}}
			placeholder={`Search...`}
			type="text"
			value={(columnFilterValue ?? "") as string}
		/>
		// See faceted column filters example for datalist search suggestions
	);
}
