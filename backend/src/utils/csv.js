function escapeCell(value) {
  const text = value === null || value === undefined ? "" : String(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function toCsv(rows, columns) {
  const header = columns.map((column) => escapeCell(column.label)).join(",");
  const body = rows.map((row) =>
    columns.map((column) => escapeCell(row[column.key])).join(","),
  );

  return [header, ...body].join("\r\n");
}
