import Link from "next/link";
import { ItemCard } from "@/components/item-card";
import { copy } from "@/lib/copy";
import { getEventStatus } from "@/lib/event-status";
import { readStore, sortItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await readStore();
  const items = sortItems(
    store.items.filter((item) =>
      ["approved", "selected", "completed"].includes(item.status)
    )
  );
  const status = getEventStatus(store.settings, store.winners);

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">{copy.home.eyebrow}</p>
        <h1>{status.title}</h1>
        <p className="lead">{status.detail}</p>
        <p className="lead">{copy.home.lead}</p>
        <div className="actions">
          {store.settings.phase === "intake" ? (
            <Link className="button primary" href="/items/new">
              {copy.home.actions.newItem}
            </Link>
          ) : null}
          {store.settings.phase === "selection" ? (
            <Link className="button" href="/winner">
              {copy.home.actions.winner}
            </Link>
          ) : null}
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
