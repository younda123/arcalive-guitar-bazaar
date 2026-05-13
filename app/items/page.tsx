import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { statusLabels } from "@/lib/labels";
import { listPublicItems } from "@/lib/store";
import type { ItemStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const filters: Array<{ href: string; label: string; status?: ItemStatus }> = [
  { href: "/items", label: "전체" },
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
        <p className="eyebrow">Items</p>
        <h1>상품 목록</h1>
      </section>

      <nav className="filter-bar" aria-label="상품 상태 필터">
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
        <p className="empty">조건에 맞는 상품이 없습니다.</p>
      )}
    </main>
  );
}
