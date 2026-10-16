export function parseDelimitedRows(text: string) {
  const normalized = text.replace(/^\uFEFF/, "");
  const firstLine = normalized.split(/\r?\n/, 1)[0] ?? "";
  const delimiter = (firstLine.match(/;/g)?.length || 0) > (firstLine.match(/,/g)?.length || 0) ? ";" : ",";

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  const pushCell = () => {
    row.push(cell.trim());
    cell = "";
  };

  const pushRow = () => {
    pushCell();
    if (row.some((value) => value.length > 0)) rows.push(row);
    row = [];
  };

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];

    if (char === '"') {
      if (quoted && normalized[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === delimiter && !quoted) {
      pushCell();
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && normalized[index + 1] === "\n") index += 1;
      pushRow();
    } else {
      cell += char;
    }
  }

  if (cell.length || row.length) pushRow();
  if (rows.length < 2) return [];

  const headers = rows[0];
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

function validIsoDateParts(year: number, month: number, day: number) {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function normalizedTradeDate(value: unknown) {
  const text = String(value ?? "").trim();
  if (!text) return "";

  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s]|$)/);
  if (iso) {
    const year = Number(iso[1]);
    const month = Number(iso[2]);
    const day = Number(iso[3]);
    return validIsoDateParts(year, month, day) ? `${iso[1]}-${iso[2]}-${iso[3]}` : "";
  }

  const br = text.match(/^(\d{2})[\/-](\d{2})[\/-](\d{4})(?:[T\s]|$)/);
  if (br) {
    const day = Number(br[1]);
    const month = Number(br[2]);
    const year = Number(br[3]);
    return validIsoDateParts(year, month, day) ? `${br[3]}-${br[2]}-${br[1]}` : "";
  }

  return "";
}
