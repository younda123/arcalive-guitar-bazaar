import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/lib/copy";
import { getEventSettings } from "@/lib/store";
import "./globals.css";

export const metadata: Metadata = {
  title: copy.app.title,
  description: copy.app.description
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getEventSettings();

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
              {settings.phase === "intake" ? (
                <Link href="/items/new">{copy.app.nav.newItem}</Link>
              ) : null}
              {settings.phase === "selection" ? (
                <Link href="/winner">{copy.app.nav.winner}</Link>
              ) : null}
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
