import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { copy } from "@/lib/copy";
import { listPublicItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await listPublicItems();

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">{copy.home.eyebrow}</p>
        <h1>{copy.home.title}</h1>
        <p className="lead">{copy.home.lead}</p>
        <div className="actions">
          <Link className="button primary" href="/items/new">
            {copy.home.actions.newItem}
          </Link>
          <Link className="button" href="/winner">
            {copy.home.actions.winner}
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>{copy.home.publicItems}</h2>
        {items.length > 0 ? (
          <div className="grid">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="empty">{copy.home.empty}</p>
        )}
      </section>
    </main>
  );
}
