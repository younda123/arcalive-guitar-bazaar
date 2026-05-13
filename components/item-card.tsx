import Link from "next/link";
import { copy } from "@/lib/copy";
import { deliveryLabels, statusClass, statusLabels } from "@/lib/labels";
import type { Item } from "@/lib/types";

export function ItemCard({ item }: { item: Item }) {
  return (
    <article className="item-card">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={copy.common.imageAlt(item.title)} />
      ) : (
        <div className="image-placeholder">{copy.common.noImage}</div>
      )}
      <div className="card-body">
        <h3>{item.title}</h3>
        <div className="meta-row">
          <span className={`badge ${statusClass(item.status)}`}>
            {statusLabels[item.status]}
          </span>
          <span className="badge">{deliveryLabels[item.deliveryMethod]}</span>
        </div>
        <Link className="button" href={`/items/${item.id}`}>
          {copy.items.detail}
        </Link>
      </div>
    </article>
  );
}
