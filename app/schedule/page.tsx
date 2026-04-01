import type { Metadata } from "next";

import { ScheduleClient } from "./schedule-client";

export const metadata: Metadata = {
  title: "日程選択 | 交流会",
  description: "交流会の候補日を最大3つまで選択して送信できます。",
};

function first(v: string | string[] | undefined): string {
  if (Array.isArray(v)) return v[0] ?? "";
  return v ?? "";
}

export default async function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  return (
    <ScheduleClient
      matchId={first(sp.match_id)}
      from={first(sp.from)}
      fromName={first(sp.from_name)}
      to={first(sp.to)}
      toName={first(sp.to_name)}
    />
  );
}
