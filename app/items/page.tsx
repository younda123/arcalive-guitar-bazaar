import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { copy } from "@/lib/copy";
import { statusLabels } from "@/lib/labels";
import { listPublicItems } from "@/lib/store";
import type { ItemStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const filters: Array<{ href: string; label: string; status?: ItemStatus }> = [
  { href: "/items", label: copy.items.all },
  { href: "/items?status=approved", label: statusLabels.approved, status: "approved" },
  { href: "/items?status=selected", label: statusLabels.selected, status: "selected" },
  { href: "/items?status=completed", label: statusLabels.completed, status: "completed" }
];

export default async function ItemsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const items = await listPublicItems();
  const activeStatus = ["approved", "selected", "completed"].includes(status ?? "")
    ? (status as ItemStatus)
    : undefined;
  const filteredItems = activeStatus
    ? items.filter((item) => item.status === activeStatus)
    : items;

  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">{copy.items.eyebrow}</p>
        <h1>{copy.items.title}</h1>
      </section>

      <nav className="filter-bar" aria-label={copy.items.filterLabel}>
        {filters.map((filter) => (
          <Link
            className={
              filter.status === activeStatus || (!filter.status && !activeStatus)
                ? "active"
                : ""
            }
            href={filter.href}
            key={filter.href}
          >
            {filter.label}
          </Link>
        ))}
      </nav>

      {filteredItems.length > 0 ? (
        <div className="grid">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="empty">{copy.items.empty}</p>
      )}
    </main>
  );
}
