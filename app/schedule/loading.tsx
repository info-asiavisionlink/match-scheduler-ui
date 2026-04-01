export default function Loading() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-slate-50">
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"
        aria-hidden
      />
      <p className="text-sm text-slate-600">読み込み中…</p>
    </div>
  );
}
