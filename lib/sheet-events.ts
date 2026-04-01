import { parseCSV } from "./csv";

export const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1_iUBANkDBxQa_xgnv6l0zoBAx5U3YhTZ60fZrQ2u38A/export?format=csv&gid=1192187993";

/** スプレッドシート1行・UI・Webhookで共通（欠損なし） */
export type EventCard = {
  event_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  venue_name: string;
  venue_address: string;
  price: string;
  image_url: string;
};

/** selected_events の1要素（n8n向け） */
export type SelectedEventPayload = EventCard;

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

/** 「13時00分00秒」→「13:00」（表示・送信共通） */
export function formatSheetTimeToHHmm(raw: string): string {
  const m = raw.match(/(\d{1,2})時(\d{1,2})分/);
  if (m) {
    const h = m[1].padStart(2, "0");
    const min = m[2].padStart(2, "0");
    return `${h}:${min}`;
  }
  const t = raw.trim();
  return t.length > 0 ? t : "—";
}

function rowToEvent(
  row: string[],
  idx: Record<string, number>,
): EventCard | null {
  const event_id = row[idx["イベントID"]]?.trim();
  const title = row[idx["イベント名"]]?.trim();
  const date = row[idx["開催日"]]?.trim();
  if (!event_id || !title || !date) return null;

  const feeRaw = row[idx["参加費"]] ?? "";
  const yen = parseParticipationFeeYen(feeRaw);
  if (yen !== 1500) return null;

  const startRaw = row[idx["開始時刻"]] ?? "";
  const endRaw = row[idx["終了時刻"]] ?? "";
  const start_time = formatSheetTimeToHHmm(startRaw);
  const end_time = formatSheetTimeToHHmm(endRaw);
  const venue_name = (row[idx["会場名"]] ?? "").trim();
  const venue_address = (row[idx["会場住所"]] ?? "").trim();
  const price = feeRaw.trim();
  const image_url = (row[idx["画像URL"]] ?? "").trim();

  if (
    !venue_name ||
    !venue_address ||
    !price ||
    !image_url ||
    start_time === "—" ||
    end_time === "—"
  ) {
    return null;
  }

  return {
    event_id,
    title,
    date,
    start_time,
    end_time,
    venue_name,
    venue_address,
    price,
    image_url,
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
    終了時刻: headerIndex(headers, "終了時刻"),
    会場名: headerIndex(headers, "会場名"),
    会場住所: headerIndex(headers, "会場住所"),
    参加費: headerIndex(headers, "参加費"),
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
    event_id: "ENV036",
    title: "売らない交流会|協力者が増える60分✨",
    date: "2026/04/03",
    start_time: "13:00",
    end_time: "14:00",
    venue_name: "ふれあい貸し会議室 東京A",
    venue_address: "東京都中央区八重洲2-8-10",
    price: "¥1,500",
    image_url:
      "https://res.cloudinary.com/deyc8gz2k/image/upload/v1774973106/wxvex9bl4pr80zlgp8ed.jpg",
  },
];
