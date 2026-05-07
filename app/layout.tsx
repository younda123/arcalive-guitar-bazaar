import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "기타 채널 바자회",
  description: "아카라이브 기타 채널 커뮤니티 바자회 운영 도구"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              기타 채널 바자회
            </Link>
            <nav className="nav" aria-label="주요 메뉴">
              <Link href="/items">상품 목록</Link>
              <Link href="/items/new">상품 등록</Link>
              <Link href="/winner">당첨자</Link>
              <Link href="/admin">관리자</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
