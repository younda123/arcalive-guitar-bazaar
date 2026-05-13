import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/lib/copy";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.app.title,
  description: copy.app.description
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
              {copy.app.title}
            </Link>
            <nav className="nav" aria-label={copy.app.navLabel}>
              <Link href="/items">{copy.app.nav.items}</Link>
              <Link href="/items/new">{copy.app.nav.newItem}</Link>
              <Link href="/winner">{copy.app.nav.winner}</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
