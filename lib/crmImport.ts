import type { Row } from "read-excel-file/browser";

export type ImportLead = {
  row: number;
  leadId: string;
  name: string;
  phone: string;
  email: string;
  source: string;
  creditedAgent: string;
  assignedDate: string;
  clientId: string;
  note: string;
  doNotCall: boolean;
};
export type ImportOutcome = {
  row: number;
  leadId: string;
  caller: string;
  occurredAt: string;
  outcome: string;
  followUpAt: string;
  callId: string;
  note: string;
};

const phoneHeaders = ["hashmiphone", "phone", "phonenumber", "mobilenumber", "mobile", "contactnumber", "number", "contactphone"];
const headerKey = (value: Row[number]) => String(value ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

function csvDelimiter(firstLine: string) {
  const stripped = firstLine.replace(/"(?:[^"]|"")*"/g, "");
  return [",", "\t", ";"].reduce((best, candidate) =>
    stripped.split(candidate).length > stripped.split(best).length ? candidate : best);
}

function parseCsv(input: string): Row[] {
  const text = input.replace(/^\uFEFF/, "");
  const delimiter = csvDelimiter(text.split(/\r?\n/, 1)[0]);
  const rows: Row[] = [];
  let row: Row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (char === '"' && (quoted || !field)) {
      if (quoted && text[index + 1] === '"') { field += '"'; index++; }
      else quoted = !quoted;
    } else if (quoted) field += char;
    else if (char === delimiter) { row.push(field); field = ""; }
    else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++;
      rows.push([...row, field]);
      row = [];
      field = "";
    } else field += char;
  }
  if (quoted) throw new Error("The CSV contains an unfinished quoted field.");
  if (row.length || field) rows.push([...row, field]);
  return rows;
}

function dateField(value: Row[number]) {
  if (value instanceof Date && Number.isFinite(+value)) return value.toISOString().slice(0, 10);
  const raw = String(value ?? "").trim();
  if (!raw || /^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const dayFirst = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (dayFirst) return dayFirst[3] + "-" + dayFirst[2].padStart(2, "0") + "-" + dayFirst[1].padStart(2, "0");
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString().slice(0, 10) : raw;
}

function findHeader(rows: Row[]) {
  return rows.slice(0, 30).findIndex(row => row.some(value => phoneHeaders.includes(headerKey(value))));
}

function findCallHeader(rows: Row[]) {
  return rows.slice(0, 30).findIndex(row => {
    const keys = row.map(headerKey);
    return keys.includes("leadid") && keys.includes("caller") && (keys.includes("calltimedubai") || keys.includes("calltime"));
  });
}

function columnsFor(row: Row) {
  const keys = row.map(headerKey);
  return (...aliases: string[]) => aliases.map(key => keys.indexOf(key)).find(index => index >= 0) ?? -1;
}

const cellText = (row: Row, index: number) => String(row[index] ?? "").trim();

function parseLeads(rows: Row[]): ImportLead[] {
  const header = findHeader(rows);
  if (header < 0) return [];
  const find = columnsFor(rows[header]);
  const columns = {
    phone: find(...phoneHeaders),
    leadId: find("leadid", "externalid"),
    name: find("customername", "fullname", "name", "contactname"),
    email: find("email", "emailaddress"),
    source: find("leadsource", "source", "campaign"),
    agent: find("creditedagent", "assignedagent", "assignedto", "agent"),
    assigned: find("assigneddate"),
    client: find("bdfxclientid", "clientid"),
    note: find("blockerornextstep", "note", "notes"),
    optOut: find("donotcall", "optout", "status"),
  };
  const leads: ImportLead[] = [];
  rows.slice(header + 1).forEach((row, index) => {
    if (!Object.values(columns).some(column => cellText(row, column))) return;
    leads.push({
      row: header + index + 2,
      phone: cellText(row, columns.phone),
      leadId: cellText(row, columns.leadId),
      name: cellText(row, columns.name),
      email: cellText(row, columns.email),
      source: cellText(row, columns.source),
      creditedAgent: cellText(row, columns.agent),
      assignedDate: dateField(row[columns.assigned]),
      clientId: cellText(row, columns.client),
      note: cellText(row, columns.note),
      doNotCall: ["donotcall", "optedout", "true", "yes"].includes(headerKey(row[columns.optOut])),
    });
  });
  return leads;
}

function callTime(value: Row[number]) {
  if (value instanceof Date && Number.isFinite(+value)) return value.toISOString().slice(0, 19) + "+04:00";
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  if (/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:\d{2})$/.test(raw)) return raw;
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(?::\d{2})?$/.test(raw)) return raw.replace(" ", "T") + "+04:00";
  const local = raw.replace(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/, (_match, day, month, year) =>
    year + "-" + month.padStart(2, "0") + "-" + day.padStart(2, "0"));
  const time = new Date(local + " GMT+0400");
  return Number.isFinite(+time) ? time.toISOString() : raw;
}

function parseOutcomes(rows: Row[]): ImportOutcome[] {
  const header = findCallHeader(rows);
  if (header < 0) return [];
  const find = columnsFor(rows[header]);
  const columns = {
    lead: find("leadid"), caller: find("caller"), time: find("calltimedubai", "calltime"),
    outcome: find("result", "outcome"), callback: find("callbackdue"), closed: find("callbackclosed"),
    callId: find("hashmicallidoptional", "hashmicallid", "callid"), note: find("nextactionornote", "notes", "note"),
  };
  return rows.slice(header + 1).flatMap((row, index) => {
    if (!Object.values(columns).some(column => cellText(row, column))) return [];
    return [{
      row: header + index + 2,
      leadId: cellText(row, columns.lead),
      caller: cellText(row, columns.caller),
      occurredAt: callTime(row[columns.time]),
      outcome: cellText(row, columns.outcome).toLowerCase().replace(/[\s-]+/g, "_"),
      followUpAt: cellText(row, columns.closed) ? "" : callTime(row[columns.callback]),
      callId: cellText(row, columns.callId),
      note: cellText(row, columns.note),
    }];
  });
}

export async function readCrmFile(file: File) {
  let leads: ImportLead[];
  let outcomes: ImportOutcome[];
  if (/\.xlsx$/i.test(file.name)) {
    const { default: readExcelFile } = await import("read-excel-file/browser");
    const sheets = await readExcelFile(file);
    const leadSheet = sheets.find(item => item.sheet.trim().toLowerCase() === "leads") ||
      sheets.find(item => findHeader(item.data) >= 0);
    const callSheet = sheets.find(item => item.sheet.trim().toLowerCase() === "calls") ||
      sheets.find(item => findCallHeader(item.data) >= 0);
    leads = parseLeads(leadSheet?.data || []);
    outcomes = parseOutcomes(callSheet?.data || []);
  } else if (/\.csv$/i.test(file.name)) {
    const rows = parseCsv(await file.text());
    leads = parseLeads(rows);
    outcomes = parseOutcomes(rows);
  } else throw new Error("Choose an Excel .xlsx or .csv file.");
  if (!leads.length && !outcomes.length) {
    throw new Error("Choose a lead list with a Phone column or a Calls export with a Lead ID and call time.");
  }
  return { leads, outcomes };
}

export function* importBatches<T extends { row: number }>(rows: T[]) {
  const encoder = new TextEncoder();
  let batch: T[] = [];
  let bytes = 0;
  for (const row of rows) {
    const size = encoder.encode(JSON.stringify(row)).length + 1;
    if (size > 64_000) throw new Error("Row " + row.row + " is too large. Shorten its note and retry.");
    if (batch.length >= 100 || bytes + size > 64_000) {
      yield batch;
      batch = [];
      bytes = 0;
    }
    batch.push(row);
    bytes += size;
  }
  if (batch.length) yield batch;
}
