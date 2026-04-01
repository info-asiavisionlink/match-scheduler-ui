import { NextResponse } from "next/server";

import type { SelectedEventPayload } from "@/lib/sheet-events";

const WEBHOOK_BASE =
  "https://nextasia.app.n8n.cloud/webhook/83237847-6c11-4459-a849-d9f1b83f05cb";

const EVENT_KEYS: (keyof SelectedEventPayload)[] = [
  "event_id",
  "title",
  "date",
  "start_time",
  "end_time",
  "venue_name",
  "venue_address",
  "price",
  "image_url",
];

function isCompleteEvent(e: unknown): e is SelectedEventPayload {
  if (!e || typeof e !== "object") return false;
  const o = e as Record<string, unknown>;
  if (
    !EVENT_KEYS.every((k) => {
      const v = o[k];
      return typeof v === "string" && v.trim().length > 0 && v.trim() !== "—";
    })
  ) {
    return false;
  }
  return true;
}

type Body = {
  match_id?: string;
  from?: string;
  from_name?: string;
  to?: string;
  to_name?: string;
  selected_events?: unknown[];
};

function buildWebhookUrl(params: Record<string, string>): string {
  const qs = Object.entries(params)
    .map(
      ([k, v]) =>
        `${encodeURIComponent(k)}=${encodeURIComponent(v)}`,
    )
    .join("&");
  return `${WEBHOOK_BASE}?${qs}`;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const match_id = body.match_id ?? "";
  const from = body.from ?? "";
  const from_name = body.from_name ?? "";
  const to = body.to ?? "";
  const to_name = body.to_name ?? "";
  const raw = Array.isArray(body.selected_events) ? body.selected_events : [];

  if (raw.length === 0) {
    return NextResponse.json({ ok: false, error: "no_selection" }, { status: 400 });
  }
  if (raw.length > 3) {
    return NextResponse.json({ ok: false, error: "too_many" }, { status: 400 });
  }

  const selected: SelectedEventPayload[] = [];
  for (const item of raw) {
    if (!isCompleteEvent(item)) {
      return NextResponse.json(
        { ok: false, error: "incomplete_event_data" },
        { status: 400 },
      );
    }
    selected.push({
      event_id: item.event_id.trim(),
      title: item.title.trim(),
      date: item.date.trim(),
      start_time: item.start_time.trim(),
      end_time: item.end_time.trim(),
      venue_name: item.venue_name.trim(),
      venue_address: item.venue_address.trim(),
      price: item.price.trim(),
      image_url: item.image_url.trim(),
    });
  }

  const selectedJson = JSON.stringify(selected);
  const url = buildWebhookUrl({
    match_id,
    from,
    from_name,
    to,
    to_name,
    selected_events: selectedJson,
  });

  try {
    const wh = await fetch(url, { method: "GET", cache: "no-store" });
    if (!wh.ok) {
      return NextResponse.json(
        { ok: false, error: "webhook_failed", status: wh.status },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "webhook_unreachable" }, { status: 502 });
  }
}
