import { selectItemAction } from "@/app/actions";
import { ItemCard } from "@/components/item-card";
import { deliveryLabels, statusClass, statusLabels } from "@/lib/labels";
import { getItem, getWinnerByCode, listSelectableItems } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function WinnerPage({
  params,
  searchParams
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ error?: string; selected?: string }>;
}) {
  const { code } = await params;
  const { error, selected } = await searchParams;
  const winner = await getWinnerByCode(decodeURIComponent(code));
  const selectableItems = await listSelectableItems();
  const selectedItem = winner?.selectedItemId
    ? await getItem(winner.selectedItemId)
    : undefined;

  if (!winner) {
    return (
      <main className="page stack">
        <h1>유효하지 않은 코드입니다.</h1>
        <p className="lead">코드를 다시 확인해 주세요.</p>
      </main>
    );
  }

  return (
    <main className="page stack">
      {selected ? <p className="notice">상품 선택이 완료되었습니다.</p> : null}
      {error === "select" ? (
        <p className="notice">
          상품을 선택할 수 없습니다. 이미 선택했거나 선택 권한이 닫혔을 수
          있습니다.
        </p>
      ) : null}

      <section>
        <p className="eyebrow">Winner Page</p>
        <h1>{winner.name}</h1>
        <div className="meta-row">
          <span className="badge">{winner.rank}위</span>
          <span className="badge">
            {winner.canSelect ? "선택 가능" : "선택 대기"}
          </span>
        </div>
      </section>

      {selectedItem ? (
        <section className="section stack">
          <h2>선택한 상품</h2>
          <div className="detail">
            {selectedItem.imageUrls.length > 0 ? (
              <div className="image-gallery">
                <img
                  src={selectedItem.imageUrls[0]}
                  alt={`${selectedItem.title} 이미지`}
                />
                {selectedItem.imageUrls.length > 1 ? (
                  <div className="image-thumbs" aria-label="상품 이미지 목록">
                    {selectedItem.imageUrls.slice(1).map((imageUrl, index) => (
                      <img
                        src={imageUrl}
                        alt={`${selectedItem.title} 이미지 ${index + 2}`}
                        key={imageUrl}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="image-placeholder">NO IMAGE</div>
            )}
            <div className="stack">
              <h1>{selectedItem.title}</h1>
              <div className="meta-row">
                <span className={`badge ${statusClass(selectedItem.status)}`}>
                  {statusLabels[selectedItem.status]}
                </span>
                <span className="badge">
                  {deliveryLabels[selectedItem.deliveryMethod]}
                </span>
              </div>
              <p className="lead">{selectedItem.description}</p>
              <p className="notice">후원자 연락처: {selectedItem.donorContact}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="section stack">
          <h2>선택 가능한 상품</h2>
          {!winner.canSelect ? (
            <p className="empty">아직 선택 권한이 열리지 않았습니다.</p>
          ) : selectableItems.length > 0 ? (
            <div className="grid">
              {selectableItems.map((item) => (
                <article className="stack" key={item.id}>
                  <ItemCard item={item} />
                  <form action={selectItemAction}>
                    <input type="hidden" name="code" value={winner.code} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="button primary" type="submit">
                      이 상품 선택
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty">현재 선택 가능한 상품이 없습니다.</p>
          )}
        </section>
      )}
    </main>
  );
}
