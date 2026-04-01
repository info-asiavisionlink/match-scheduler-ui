import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "送信完了 | 交流会",
  description: "日程候補の送信が完了しました。",
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
