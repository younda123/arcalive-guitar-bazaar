import {
  adminLoginAction,
  adminLogoutAction,
  createWinnerAction,
  deleteWinnerAction,
  isAdmin,
  itemStatusAction,
  updateItemAction,
  updateItemImageAction,
  updateWinnerAction,
  winnerCanSelectAction
} from "@/app/actions";
import { copy } from "@/lib/copy";
import { deliveryLabels, statusLabels } from "@/lib/labels";
import { readStore, sortItems } from "@/lib/store";
import type { ItemStatus } from "@/lib/types";

const statuses: ItemStatus[] = [
  "pending",
  "approved",
  "selected",
  "completed",
  "hidden",
  "deleted"
];

const adminErrors: Record<string, string> = copy.admin.errors;

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await isAdmin();
  const { error } = await searchParams;

  if (!admin) {
    return (
      <main className="page stack">
        <section>
          <p className="eyebrow">{copy.admin.eyebrow}</p>
          <h1>{copy.admin.loginTitle}</h1>
          <p className="lead">{copy.admin.loginLead}</p>
        </section>
        {error ? <p className="notice">{copy.admin.loginError}</p> : null}
        <form className="form" action={adminLoginAction}>
          <div className="field">
            <label htmlFor="password">{copy.fields.adminPassword}</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button className="button primary" type="submit">
            {copy.admin.login}
          </button>
        </form>
      </main>
    );
  }

  const store = await readStore();
  const items = sortItems(store.items);

  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">{copy.admin.eyebrow}</p>
        <h1>{copy.admin.title}</h1>
        <form action={adminLogoutAction}>
          <button className="button" type="submit">
            {copy.admin.logout}
          </button>
        </form>
      </section>

      {error && adminErrors[error] ? (
        <p className="notice">{adminErrors[error]}</p>
      ) : null}

      <section className="section stack">
        <h2>{copy.admin.itemManagement}</h2>
        <div className="admin-list">
          {items.map((item) => (
            <article className="admin-panel" key={item.id}>
              <div className="admin-summary">
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.condition}</p>
                </div>
                <div className="meta-row">
                  <span className="badge">{statusLabels[item.status]}</span>
                  <span className="badge">{deliveryLabels[item.deliveryMethod]}</span>
                </div>
                <p className="admin-contact">{item.donorContact}</p>
              </div>

              <form className="admin-edit-form" action={updateItemAction}>
                <input type="hidden" name="id" value={item.id} />
                <label>
                  {copy.fields.itemTitle}
                  <input name="title" defaultValue={item.title} required />
                </label>
                <label>
                  {copy.fields.itemCondition}
                  <input name="condition" defaultValue={item.condition} required />
                </label>
                <label>
                  {copy.fields.itemDescription}
                  <textarea name="description" defaultValue={item.description} required />
                </label>
                <label>
                  {copy.fields.deliveryMethod}
                  <select name="deliveryMethod" defaultValue={item.deliveryMethod}>
                    <option value="shipping">{deliveryLabels.shipping}</option>
                    <option value="direct">{deliveryLabels.direct}</option>
                    <option value="negotiable">{deliveryLabels.negotiable}</option>
                  </select>
                </label>
                <label>
                  {copy.fields.donorContact}
                  <input name="donorContact" defaultValue={item.donorContact} required />
                </label>
                <button className="button" type="submit">
                  {copy.admin.updateItem}
                </button>
              </form>

              <div className="admin-tools">
                <form className="admin-edit-form" action={updateItemImageAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <label>
                    {copy.admin.replaceImage}
                    <input name="image" type="file" accept="image/*" multiple required />
                  </label>
                  <button className="button" type="submit">
                    {copy.admin.replaceImage}
                  </button>
                </form>

                <form className="inline-form" action={itemStatusAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <select name="status" defaultValue={item.status}>
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button className="button" type="submit">
                    {copy.admin.saveStatus}
                  </button>
                </form>

                <div className="actions">
                  {item.status === "pending" ? (
                    <form action={itemStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="approved" />
                      <button className="button primary" type="submit">
                        {copy.admin.approve}
                      </button>
                    </form>
                  ) : null}
                  {item.status === "selected" ? (
                    <>
                      <form action={itemStatusAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value="completed" />
                        <button className="button primary" type="submit">
                          {copy.admin.completeDelivery}
                        </button>
                      </form>
                      <form action={itemStatusAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <input type="hidden" name="status" value="approved" />
                        <button className="button" type="submit">
                          {copy.admin.cancelSelection}
                        </button>
                      </form>
                    </>
                  ) : null}
                  {item.status === "approved" ? (
                    <form action={itemStatusAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="status" value="hidden" />
                      <button className="button" type="submit">
                        {copy.admin.hide}
                      </button>
                    </form>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section stack">
        <h2>{copy.admin.winnerCreate}</h2>
        <form className="form" action={createWinnerAction}>
          <div className="field">
            <label htmlFor="name">{copy.fields.winnerName}</label>
            <input id="name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="rank">{copy.fields.winnerRank}</label>
            <input id="rank" name="rank" type="number" min="1" required />
          </div>
          <div className="field">
            <label htmlFor="code">{copy.fields.winnerCode}</label>
            <input id="code" name="code" required />
          </div>
          <label className="meta-row">
            <input name="canSelect" type="checkbox" defaultChecked />
            {copy.admin.canSelect}
          </label>
          <button className="button primary" type="submit">
            {copy.admin.createWinner}
          </button>
        </form>
      </section>

      <section className="section stack">
        <h2>{copy.admin.selectionResults}</h2>
        <div className="admin-list compact">
          {store.winners.map((winner) => {
            const item = store.items.find(
              (candidate) => candidate.id === winner.selectedItemId
            );
            return (
              <article className="admin-panel winner-panel" key={winner.id}>
                <div className="admin-summary">
                  <div>
                    <h3>{winner.name}</h3>
                    <p>{copy.admin.winnerCodeLine(winner.rank, winner.code)}</p>
                  </div>
                  <div className="meta-row">
                    <span className="badge">
                      {winner.canSelect ? copy.admin.canSelect : copy.admin.selectionWaiting}
                    </span>
                    <span className="badge">{item?.title ?? copy.admin.noSelectedItem}</span>
                  </div>
                </div>

                <form className="admin-edit-form" action={updateWinnerAction}>
                  <input type="hidden" name="id" value={winner.id} />
                  <label>
                    {copy.fields.winnerName}
                    <input name="name" defaultValue={winner.name} required />
                  </label>
                  <label>
                    {copy.fields.winnerRank}
                    <input
                      name="rank"
                      type="number"
                      min="1"
                      defaultValue={winner.rank}
                      required
                    />
                  </label>
                  <label>
                    {copy.fields.winnerCode}
                    <input name="code" defaultValue={winner.code} required />
                  </label>
                  <label className="meta-row">
                    <input
                      name="canSelect"
                      type="checkbox"
                      defaultChecked={winner.canSelect}
                    />
                    {copy.admin.canSelect}
                  </label>
                  <button className="button" type="submit">
                    {copy.admin.updateWinner}
                  </button>
                </form>

                <div className="admin-tools">
                  <form className="inline-form" action={winnerCanSelectAction}>
                    <input type="hidden" name="id" value={winner.id} />
                    <label className="meta-row">
                      <input
                        name="canSelect"
                        type="checkbox"
                        defaultChecked={winner.canSelect}
                      />
                      {copy.admin.canSelect}
                    </label>
                    <button className="button" type="submit">
                      {copy.admin.saveSelectionPermission}
                    </button>
                  </form>
                  <form action={deleteWinnerAction}>
                    <input type="hidden" name="id" value={winner.id} />
                    <button className="button danger" type="submit">
                      {copy.admin.deleteWinner}
                    </button>
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
