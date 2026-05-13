import { notFound } from "next/navigation";
import { copy } from "@/lib/copy";
import { deliveryLabels, statusClass, statusLabels } from "@/lib/labels";
import { getItem } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { id } = await params;
  const { submitted } = await searchParams;
  const item = await getItem(id);

  if (!item || ["deleted", "hidden"].includes(item.status)) {
    notFound();
  }

  return (
    <main className="page stack">
      {submitted ? (
        <p className="notice">
          {copy.itemDetail.submitted}
        </p>
      ) : null}

      <section className="detail">
        {item.imageUrls.length > 0 ? (
          <div className="image-gallery">
            <img src={item.imageUrls[0]} alt={copy.common.imageAlt(item.title)} />
            {item.imageUrls.length > 1 ? (
              <div className="image-thumbs" aria-label={copy.common.imageListLabel}>
                {item.imageUrls.slice(1).map((imageUrl, index) => (
                  <img
                    src={imageUrl}
                    alt={copy.common.imageAlt(item.title, index + 2)}
                    key={imageUrl}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : (
          <div className="image-placeholder">{copy.common.noImage}</div>
        )}

        <div className="stack">
          <p className="eyebrow">{copy.itemDetail.eyebrow}</p>
          <h1>{item.title}</h1>
          <div className="meta-row">
            <span className={`badge ${statusClass(item.status)}`}>
              {statusLabels[item.status]}
            </span>
            <span className="badge">{deliveryLabels[item.deliveryMethod]}</span>
            <span className="badge">{item.condition}</span>
          </div>
          <p className="lead">{item.description}</p>
        </div>
      </section>
    </main>
  );
}
