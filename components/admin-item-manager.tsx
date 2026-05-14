"use client";

import { useState, type FormEvent } from "react";
import { copy } from "@/lib/copy";
import { deliveryLabels, statusLabels } from "@/lib/labels";
import type { DeliveryMethod, Item, ItemStatus } from "@/lib/types";

const statuses: ItemStatus[] = [
  "pending",
  "approved",
  "selected",
  "completed",
  "hidden",
  "deleted"
];

const imageErrorMessages: Record<string, string> = {
  empty: copy.admin.errors["image-empty"],
  size: copy.admin.errors["image-size"],
  count: copy.admin.errors["image-count"],
  type: copy.admin.errors["image-type"]
};

export function AdminItemManager({ initialItems }: { initialItems: Item[] }) {
  const [items, setItems] = useState(initialItems);
  const [savingId, setSavingId] = useState<string>();
  const [message, setMessage] = useState<string>();

  function replaceItem(updated: Item) {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item))
    );
  }

  async function saveItem(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setSavingId(id);
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.get("title"),
        condition: formData.get("condition"),
        description: formData.get("description"),
        deliveryMethod: formData.get("deliveryMethod"),
        donorContact: formData.get("donorContact")
      })
    });
    const result = await response.json();
    setSavingId(undefined);

    if (!response.ok) {
      setMessage(copy.admin.errors["item-update"]);
      return;
    }

    replaceItem(result.item);
    setMessage(copy.admin.messages.itemSaved);
  }

  async function saveStatus(id: string, status: ItemStatus) {
    setSavingId(id);
    setMessage(undefined);

    const response = await fetch(`/api/admin/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    const result = await response.json();
    setSavingId(undefined);

    if (!response.ok) {
      setMessage(copy.admin.messages.statusError);
      return;
    }

    replaceItem(result.item);
    setMessage(copy.admin.messages.statusSaved);
  }

  async function replaceImages(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setSavingId(id);
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/items/${id}/images`, {
      method: "PUT",
      body: formData
    });
    const result = await response.json();
    setSavingId(undefined);

    if (!response.ok) {
      setMessage(imageErrorMessages[result.error] ?? copy.admin.messages.imageError);
      return;
    }

    replaceItem(result.item);
    event.currentTarget.reset();
    setMessage(copy.admin.messages.imageSaved);
  }

  return (
    <div className="stack">
      {message ? <p className="notice">{message}</p> : null}
      <div className="admin-list">
        {items.map((item) => (
          <article className="admin-panel" id={`item-${item.id}`} key={item.id}>
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

            <form className="admin-edit-form" onSubmit={(event) => saveItem(event, item.id)}>
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
              <button className="button" disabled={savingId === item.id} type="submit">
                {savingId === item.id ? copy.admin.saving : copy.admin.updateItem}
              </button>
            </form>

            <div className="admin-tools">
              <form className="admin-edit-form" onSubmit={(event) => replaceImages(event, item.id)}>
                <label>
                  {copy.admin.replaceImage}
                  <input
                    name="image"
                    type="file"
                    accept="image/*,.jpg,.jpeg,.heic,.heif"
                    multiple
                    required
                  />
                </label>
                <button className="button" disabled={savingId === item.id} type="submit">
                  {copy.admin.replaceImage}
                </button>
              </form>

              <form
                className="inline-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  saveStatus(item.id, formData.get("status") as ItemStatus);
                }}
              >
                <select key={item.status} name="status" defaultValue={item.status}>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
                <button className="button" disabled={savingId === item.id} type="submit">
                  {copy.admin.saveStatus}
                </button>
              </form>

              <div className="actions">
                {item.status === "pending" ? (
                  <button
                    className="button primary"
                    disabled={savingId === item.id}
                    onClick={() => saveStatus(item.id, "approved")}
                    type="button"
                  >
                    {copy.admin.approve}
                  </button>
                ) : null}
                {item.status === "selected" ? (
                  <>
                    <button
                      className="button primary"
                      disabled={savingId === item.id}
                      onClick={() => saveStatus(item.id, "completed")}
                      type="button"
                    >
                      {copy.admin.completeDelivery}
                    </button>
                    <button
                      className="button"
                      disabled={savingId === item.id}
                      onClick={() => saveStatus(item.id, "approved")}
                      type="button"
                    >
                      {copy.admin.cancelSelection}
                    </button>
                  </>
                ) : null}
                {item.status === "approved" ? (
                  <button
                    className="button"
                    disabled={savingId === item.id}
                    onClick={() => saveStatus(item.id, "hidden")}
                    type="button"
                  >
                    {copy.admin.hide}
                  </button>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
