import Link from "next/link";
import { deliveryLabels, statusClass, statusLabels } from "@/lib/labels";
import type { Item } from "@/lib/types";

export function ItemCard({ item }: { item: Item }) {
  return (
    <article className="item-card">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={`${item.title} 이미지`} />
      ) : (
        <div className="image-placeholder">NO IMAGE</div>
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
          상세보기
        </Link>
      </div>
    </article>
  );
}
