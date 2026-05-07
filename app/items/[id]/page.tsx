import { notFound } from "next/navigation";
import { deliveryLabels, statusClass, statusLabels } from "@/lib/labels";
import { getItem } from "@/lib/store";

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
          상품이 등록되었습니다. 관리자 승인 전까지 공개 목록에는 표시되지
          않습니다.
        </p>
      ) : null}

      <section className="detail">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={`${item.title} 이미지`} />
        ) : (
          <div className="image-placeholder">NO IMAGE</div>
        )}

        <div className="stack">
          <p className="eyebrow">Item Detail</p>
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
