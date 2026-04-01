import { NextResponse } from "next/server";
import {
  MOCK_EVENTS_1500,
  SHEET_CSV_URL,
  parseEventsFromSheetCsv,
} from "@/lib/sheet-events";

export const revalidate = 120;

export async function GET() {
  try {
    const res = await fetch(SHEET_CSV_URL, {
      next: { revalidate: 120 },
      headers: { Accept: "text/csv" },
    });
    if (!res.ok) {
      return NextResponse.json(
        { events: MOCK_EVENTS_1500, source: "mock", error: "sheet_fetch_failed" },
        { status: 200 },
      );
    }
    const text = await res.text();
    const events = parseEventsFromSheetCsv(text);
    return NextResponse.json({ events, source: "sheet" });
  } catch {
    return NextResponse.json(
      { events: MOCK_EVENTS_1500, source: "mock", error: "sheet_parse_failed" },
      { status: 200 },
    );
  }
}
