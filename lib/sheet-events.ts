import { parseCSV } from "./csv";

export const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1_iUBANkDBxQa_xgnv6l0zoBAx5U3YhTZ60fZrQ2u38A/export?format=csv&gid=1192187993";

export type EventCard = {
  eventId: string;
  title: string;
  date: string;
  startTimeDisplay: string;
  venue: string;
  description: string;
  imageUrl: string;
};

function headerIndex(headers: string[], name: string): number {
  const i = headers.indexOf(name);
  if (i === -1) throw new Error(`Missing column: ${name}`);
  return i;
}

/** ¥1,500 / 1500 / ¥3,000 → integer yen */
export function parseParticipationFeeYen(raw: string): number | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : null;
}

export function formatStartTimeForDisplay(raw: string): string {
  const m = raw.match(/(\d{1,2})時(\d{1,2})分/);
  if (m) {
    const h = m[1].padStart(2, "0");
    const min = m[2].padStart(2, "0");
    return `${h}:${min}`;
  }
  return raw.trim() || "—";
}

function rowToEvent(
  row: string[],
  idx: Record<string, number>,
): EventCard | null {
  const eventId = row[idx["イベントID"]]?.trim();
  const title = row[idx["イベント名"]]?.trim();
  const date = row[idx["開催日"]]?.trim();
  if (!eventId || !title || !date) return null;

  const feeRaw = row[idx["参加費"]] ?? "";
  const yen = parseParticipationFeeYen(feeRaw);
  if (yen !== 1500) return null;

  const startRaw = row[idx["開始時刻"]] ?? "";
  return {
    eventId,
    title,
    date,
    startTimeDisplay: formatStartTimeForDisplay(startRaw),
    venue: (row[idx["会場名"]] ?? "").trim() || "—",
    description: (row[idx["イベント説明"]] ?? "").trim() || "",
    imageUrl: (row[idx["画像URL"]] ?? "").trim(),
  };
}

export function parseEventsFromSheetCsv(csvText: string): EventCard[] {
  const trimmed = csvText.replace(/^\uFEFF/, "");
  const rows = parseCSV(trimmed);
  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim());
  const idx: Record<string, number> = {
    イベントID: headerIndex(headers, "イベントID"),
    イベント名: headerIndex(headers, "イベント名"),
    開催日: headerIndex(headers, "開催日"),
    開始時刻: headerIndex(headers, "開始時刻"),
    会場名: headerIndex(headers, "会場名"),
    参加費: headerIndex(headers, "参加費"),
    イベント説明: headerIndex(headers, "イベント説明"),
    画像URL: headerIndex(headers, "画像URL"),
  };

  const events: EventCard[] = [];
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every((c) => !c?.trim())) continue;
    const ev = rowToEvent(row, idx);
    if (ev) events.push(ev);
  }
  return events;
}

export const MOCK_EVENTS_1500: EventCard[] = [
  {
    eventId: "ENV036",
    title: "売らない交流会|協力者が増える60分✨",
    date: "2026/04/03",
    startTimeDisplay: "13:00",
    venue: "ふれあい貸し会議室 東京A",
    description:
      "売らない交流会✨その場で次の約束まで進む設計。雑談〜仕事までOK☕",
    imageUrl:
      "https://res.cloudinary.com/deyc8gz2k/image/upload/v1774973106/wxvex9bl4pr80zlgp8ed.jpg",
  },
];