import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "업무용 대시보드",
  description: "직원 업무 처리를 위한 단계별 업무 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
              <Link href="/" className="font-semibold text-lg text-slate-900">
                업무용 대시보드
              </Link>
              <span className="text-xs text-slate-400">사무실 전용 · 내부 업무 도구</span>
            </div>
          </header>
          <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
            사업별 업무는 단계(Step)별로 진행되며, 완료된 항목은 자동으로 기록됩니다.
          </footer>
        </div>
      </body>
    </html>
  );
}
