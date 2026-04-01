"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { EventCard } from "@/lib/sheet-events";

const MAX = 3;

type Props = {
  matchId: string;
  from: string;
  fromName: string;
  to: string;
  toName: string;
};

type SelectedPayload = { event_id: string; date: string; title: string };

export function ScheduleClient({
  matchId,
  from,
  fromName,
  to,
  toName,
}: Props) {
  const [events, setEvents] = useState<EventCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [limitError, setLimitError] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/events", { cache: "no-store" });
        const data = (await res.json()) as { events?: EventCard[] };
        if (!cancelled) {
          setEvents(Array.isArray(data.events) ? data.events : []);
          setLoadError(null);
        }
      } catch {
        if (!cancelled) {
          setLoadError("イベント一覧の取得に失敗しました。しばらくしてから再度お試しください。");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggle = useCallback(
    (ev: EventCard) => {
      setSubmitError(null);
      setLimitError(false);
      if (selectedSet.has(ev.eventId)) {
        setSelectedIds((prev) => prev.filter((id) => id !== ev.eventId));
        return;
      }
      if (selectedIds.length >= MAX) {
        setLimitError(true);
        return;
      }
      setSelectedIds((prev) => [...prev, ev.eventId]);
    },
    [selectedIds.length, selectedSet],
  );

  const selectedEventsPayload: SelectedPayload[] = useMemo(() => {
    const byId = new Map(events.map((e) => [e.eventId, e]));
    return selectedIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((e) => ({
        event_id: e!.eventId,
        date: e!.date,
        title: e!.title,
      }));
  }, [events, selectedIds]);

  const submit = async () => {
    setSubmitError(null);
    setLimitError(false);
    if (selectedIds.length === 0) {
      setSubmitError("日程を1つ以上選んでください。");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/submit-candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          match_id: matchId,
          from,
          from_name: fromName,
          to,
          to_name: toName,
          selected_events: selectedEventsPayload,
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(
          j.error === "webhook_failed"
            ? "送信に失敗しました。時間をおいて再度お試しください。"
            : "送信に失敗しました。通信状況をご確認ください。",
        );
        return;
      }
      setDone(true);
    } catch {
      setSubmitError("送信に失敗しました。通信状況をご確認ください。");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto flex min-h-[100dvh] max-w-lg flex-col items-center justify-center gap-4 px-4 pb-28 pt-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-9 w-9"
            aria-hidden
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-900">送信完了しました</h1>
        <p className="text-sm leading-relaxed text-slate-600">
          ご希望の候補日を受け付けました。担当よりLINEにてご連絡いたします。
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-slate-50 to-white pb-36 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
            日程のご相談
          </p>
          <h1 className="text-lg font-bold leading-snug text-slate-900">
            参加したい交流会を選ぶ
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            最大{MAX}つまで選択できます（参加費 ¥1,500 の日程）
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-lg px-4 py-4">
        {(fromName || toName) && (
          <div className="mb-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <dl className="grid gap-2 text-sm">
              {fromName ? (
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-slate-500">ご希望の方</dt>
                  <dd className="text-right font-medium text-slate-800">{fromName}</dd>
                </div>
              ) : null}
              {toName ? (
                <div className="flex justify-between gap-3">
                  <dt className="shrink-0 text-slate-500">広告主</dt>
                  <dd className="text-right font-medium text-slate-800">{toName}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        )}

        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white shadow-md">
          <span className="text-sm font-medium">選択中</span>
          <span className="tabular-nums text-lg font-bold">
            {selectedIds.length}/{MAX}
          </span>
        </div>

        {limitError && (
          <p
            className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
            role="alert"
          >
            最大{MAX}つまでしか選べません。不要な日程のチェックを外してください。
          </p>
        )}
        {submitError && (
          <p
            className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900"
            role="alert"
          >
            {submitError}
          </p>
        )}
        {loadError && (
          <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {loadError}
          </p>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-16">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
              aria-hidden
            />
            <p className="text-sm text-slate-600">読み込み中…</p>
          </div>
        ) : events.length === 0 ? (
          <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600 shadow-sm">
            現在、表示できる日程がありません。
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {events.map((ev) => {
              const checked = selectedSet.has(ev.eventId);
              return (
                <li key={ev.eventId}>
                  <label
                    className={`group block cursor-pointer overflow-hidden rounded-2xl border-2 bg-white shadow-md transition-all ${
                      checked
                        ? "border-emerald-500 ring-2 ring-emerald-500/30"
                        : "border-transparent hover:border-slate-200"
                    }`}
                  >
                    <div className="relative aspect-[16/10] w-full bg-slate-100">
                      {ev.imageUrl ? (
                        <Image
                          src={ev.imageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 512px) 100vw, 512px"
                        />
                      ) : null}
                      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-white/95 px-2 py-1 shadow-sm backdrop-blur">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(ev)}
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          aria-label={`${ev.title}を候補に追加`}
                          aria-describedby={`desc-${ev.eventId}`}
                        />
                        <span className="text-xs font-semibold text-slate-800">
                          候補に追加
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 p-4">
                      <h2 className="text-base font-bold leading-snug text-slate-900">
                        {ev.title}
                      </h2>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                          {ev.date}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                          開始 {ev.startTimeDisplay}
                        </span>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-800">
                          ¥1,500
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500">{ev.venue}</p>
                      <p
                        id={`desc-${ev.eventId}`}
                        className="text-sm leading-relaxed text-slate-600 line-clamp-4"
                      >
                        {ev.description}
                      </p>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md">
        <div className="mx-auto max-w-lg">
          <button
            type="button"
            onClick={submit}
            disabled={submitting || loading}
            className="flex w-full items-center justify-center rounded-2xl bg-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/25 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "送信中…" : "候補日を送信する"}
          </button>
        </div>
      </div>
    </div>
  );
}
