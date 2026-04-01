import { NextResponse } from "next/server";

const WEBHOOK_BASE =
  "https://nextasia.app.n8n.cloud/webhook/83237847-6c11-4459-a849-d9f1b83f05cb";

type SelectedEvent = { event_id: string; date: string; title: string };

type Body = {
  match_id?: string;
  from?: string;
  from_name?: string;
  to?: string;
  to_name?: string;
  selected_events?: SelectedEvent[];
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
  const selected = Array.isArray(body.selected_events) ? body.selected_events : [];

  if (selected.length === 0) {
    return NextResponse.json({ ok: false, error: "no_selection" }, { status: 400 });
  }
  if (selected.length > 3) {
    return NextResponse.json({ ok: false, error: "too_many" }, { status: 400 });
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
