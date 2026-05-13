import { selectItemAction } from "@/app/actions";
import { ItemCard } from "@/components/item-card";
import { copy } from "@/lib/copy";
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
        <h1>{copy.winner.invalidTitle}</h1>
        <p className="lead">{copy.winner.invalidLead}</p>
      </main>
    );
  }

  return (
    <main className="page stack">
      {selected ? <p className="notice">{copy.winner.selectedNotice}</p> : null}
      {error === "select" ? (
        <p className="notice">{copy.winner.selectError}</p>
      ) : null}

      <section>
        <p className="eyebrow">{copy.winner.eyebrow}</p>
        <h1>{winner.name}</h1>
        <div className="meta-row">
          <span className="badge">{copy.common.rank(winner.rank)}</span>
          <span className="badge">
            {winner.canSelect ? copy.winner.selectionOpen : copy.winner.selectionWaiting}
          </span>
        </div>
      </section>

      {selectedItem ? (
        <section className="section stack">
          <h2>{copy.winner.selectedItem}</h2>
          <div className="detail">
            {selectedItem.imageUrls.length > 0 ? (
              <div className="image-gallery">
                <img
                  src={selectedItem.imageUrls[0]}
                  alt={copy.common.imageAlt(selectedItem.title)}
                />
                {selectedItem.imageUrls.length > 1 ? (
                  <div className="image-thumbs" aria-label={copy.common.imageListLabel}>
                    {selectedItem.imageUrls.slice(1).map((imageUrl, index) => (
                      <img
                        src={imageUrl}
                        alt={copy.common.imageAlt(selectedItem.title, index + 2)}
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
              <p className="notice">{copy.winner.donorContact(selectedItem.donorContact)}</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="section stack">
          <h2>{copy.winner.selectableItems}</h2>
          {!winner.canSelect ? (
            <p className="empty">{copy.winner.noPermission}</p>
          ) : selectableItems.length > 0 ? (
            <div className="grid">
              {selectableItems.map((item) => (
                <article className="stack" key={item.id}>
                  <ItemCard item={item} />
                  <form action={selectItemAction}>
                    <input type="hidden" name="code" value={winner.code} />
                    <input type="hidden" name="itemId" value={item.id} />
                    <button className="button primary" type="submit">
                      {copy.winner.selectThis}
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty">{copy.winner.empty}</p>
          )}
        </section>
      )}
    </main>
  );
}
