import { ItemCard } from "@/components/item-card";
import { listPublicItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ItemsPage() {
  const items = await listPublicItems();

  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">Items</p>
        <h1>상품 목록</h1>
      </section>

      {items.length > 0 ? (
        <div className="grid">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <p className="empty">아직 공개된 상품이 없습니다.</p>
      )}
    </main>
  );
}
