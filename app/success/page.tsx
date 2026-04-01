"use client";

import { useCallback, useEffect, useState } from "react";

export default function SuccessPage() {
  const [phase, setPhase] = useState<"loading" | "done">("loading");
  const [closeHint, setCloseHint] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("done"), 1000);
    return () => window.clearTimeout(t);
  }, []);

  const handleClose = useCallback(() => {
    setCloseHint(false);
    window.close();
    window.setTimeout(() => setCloseHint(true), 450);
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10">
      {/* 背景グラデーション + 装飾オーブ */}
      <div
        className="success-bg-breathe pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-600 via-indigo-700 to-sky-900"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-fuchsia-400/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-20 bottom-1/4 h-80 w-80 rounded-full bg-amber-300/25 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-64 w-[120%] -translate-x-1/2 bg-gradient-to-b from-white/15 to-transparent blur-2xl"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-[2px]"
        aria-hidden
      />

      {phase === "loading" ? (
        <div
          className="relative z-10 flex w-full max-w-sm flex-col items-center rounded-2xl border border-white/25 bg-white/10 p-8 shadow-xl backdrop-blur-md"
          role="status"
          aria-live="polite"
        >
          <div className="relative mb-6 flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full border-2 border-white/30" />
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white/90 border-r-white/40" />
            <span className="h-2 w-2 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
          </div>
          <p className="text-center text-sm font-medium tracking-wide text-white/95">
            送信中です
          </p>
          <p className="mt-2 text-center text-xs text-white/65">
            しばらくお待ちください…
          </p>
        </div>
      ) : (
        <div
          className="success-animate-card relative z-10 w-full max-w-sm"
          role="status"
          aria-live="polite"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/95 p-8 shadow-xl shadow-indigo-950/25 backdrop-blur-xl">
            <div
              className="success-shine pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent"
              aria-hidden
            />

            <div className="relative flex flex-col items-center text-center">
              <div className="relative mb-6 flex h-[5.5rem] w-[5.5rem] items-center justify-center">
                <span
                  className="success-animate-ring absolute inset-0 rounded-full bg-gradient-to-br from-violet-500/40 to-indigo-600/30"
                  aria-hidden
                />
                <span
                  className="absolute inset-2 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-600/40"
                  aria-hidden
                />
                <div className="success-animate-icon relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md shadow-indigo-900/10 ring-1 ring-white/80">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-8 w-8 text-indigo-600"
                    aria-hidden
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                送信完了しました
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-[0.9375rem]">
                相手の確認後、LINEで結果が届きます
              </p>

              <div className="mt-8 w-full space-y-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/35 transition hover:brightness-110 active:scale-[0.98]"
                >
                  この画面を閉じる
                </button>
                {closeHint ? (
                  <p
                    className="rounded-xl border border-amber-200/80 bg-amber-50/95 px-4 py-3 text-center text-sm font-medium text-amber-900"
                    role="alert"
                  >
                    LINEに戻ってください
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs font-medium text-white/70">
            この画面は閉じて問題ありません
          </p>
        </div>
      )}
    </div>
  );
}
