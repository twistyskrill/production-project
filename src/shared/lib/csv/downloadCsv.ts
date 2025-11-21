export interface CsvColumn<T> {
	key: keyof T;
	label: string;
	format?: (value: T[keyof T], row: T) => string | number;
}

export function buildCsvString<T>(rows: T[], columns: CsvColumn<T>[]) {
	const header = columns.map((col) => col.label).join(",");
	const body = rows
		.map((row) =>
			columns
				.map((col) => {
					const raw = col.format
						? col.format(row[col.key], row)
						: (row[col.key] as string | number);
					const value = typeof raw === "string" ? raw.replace(/"/g, '""') : raw;
					return `"${value ?? ""}"`;
				})
				.join(",")
		)
		.join("\n");
	return `${header}\n${body}`;
}

export function downloadCsv<T>(
	filename: string,
	rows: T[],
	columns: CsvColumn<T>[]
) {
	const content = buildCsvString(rows, columns);
	const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
