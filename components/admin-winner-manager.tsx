"use client";

import { useState, type FormEvent } from "react";
import { copy } from "@/lib/copy";
import type { Item, Winner } from "@/lib/types";

type WinnerWithItem = Winner & {
  selectedItemTitle?: string;
};

function withSelectedItemTitle(winner: Winner, items: Item[]): WinnerWithItem {
  const selectedItem = items.find((item) => item.id === winner.selectedItemId);
  return {
    ...winner,
    selectedItemTitle: selectedItem?.title
  };
}

export function AdminWinnerManager({
  initialWinners,
  items
}: {
  initialWinners: Winner[];
  items: Item[];
}) {
  const [winners, setWinners] = useState(() =>
    initialWinners.map((winner) => withSelectedItemTitle(winner, items))
  );
  const [query, setQuery] = useState("");
  const [savingId, setSavingId] = useState<string>();
  const [message, setMessage] = useState<string>();
  const filteredWinners = winners.filter((winner) => {
    const normalizedQuery = query.trim().toLowerCase();
    return (
      !normalizedQuery ||
      [winner.name, winner.code, winner.selectedItemTitle ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  });

  async function createWinner(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingId("new");
    setMessage(undefined);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const response = await fetch("/api/admin/winners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        rank: formData.get("rank"),
        code: formData.get("code"),
        canSelect: formData.get("canSelect") === "on"
      })
    });
    const result = await response.json();
    setSavingId(undefined);

    if (!response.ok) {
      setMessage(copy.admin.errors["winner-code"]);
      return;
    }

    setWinners((current) =>
      [...current, withSelectedItemTitle(result.winner, items)].sort(
        (a, b) => a.rank - b.rank || a.createdAt.localeCompare(b.createdAt)
      )
    );
    form.reset();
    setMessage(copy.admin.messages.winnerCreated);
  }

  async function updateWinner(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    setSavingId(id);
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const response = await fetch(`/api/admin/winners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        rank: formData.get("rank"),
        code: formData.get("code"),
        canSelect: formData.get("canSelect") === "on"
      })
    });
    const result = await response.json();
    setSavingId(undefined);

    if (!response.ok) {
      setMessage(copy.admin.errors["winner-code"]);
      return;
    }

    setWinners((current) =>
      current.map((winner) =>
        winner.id === id ? withSelectedItemTitle(result.winner, items) : winner
      )
    );
    setMessage(copy.admin.messages.winnerUpdated);
  }

  async function savePermission(event: FormEvent<HTMLFormElement>, winner: WinnerWithItem) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const ok = await updateWinnerFromPayload(winner, {
      canSelect: formData.get("canSelect") === "on"
    });
    if (ok) {
      setMessage(copy.admin.messages.winnerPermissionSaved);
    }
  }

  async function updateWinnerFromPayload(
    winner: WinnerWithItem,
    override: Partial<Winner>
  ) {
    setSavingId(winner.id);
    setMessage(undefined);

    const response = await fetch(`/api/admin/winners/${winner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: override.name ?? winner.name,
        rank: override.rank ?? winner.rank,
        code: override.code ?? winner.code,
        canSelect: override.canSelect ?? winner.canSelect
      })
    });
    const result = await response.json();
    setSavingId(undefined);

    if (!response.ok) {
      setMessage(copy.admin.errors["winner-code"]);
      return false;
    }

    setWinners((current) =>
      current.map((candidate) =>
        candidate.id === winner.id ? withSelectedItemTitle(result.winner, items) : candidate
      )
    );
    return true;
  }

  async function deleteWinner(id: string) {
    const target = winners.find((winner) => winner.id === id);
    if (!window.confirm(copy.admin.confirmDeleteWinner(target?.name ?? ""))) {
      return;
    }

    setSavingId(id);
    setMessage(undefined);

    const response = await fetch(`/api/admin/winners/${id}`, {
      method: "DELETE"
    });
    setSavingId(undefined);

    if (!response.ok) {
      setMessage(copy.admin.messages.winnerDeleteError);
      return;
    }

    setWinners((current) => current.filter((winner) => winner.id !== id));
    setMessage(copy.admin.messages.winnerDeleted);
  }

  return (
    <div className="stack">
      {message ? <p className="notice">{message}</p> : null}

      <section className="section stack">
        <h2>{copy.admin.winnerCreate}</h2>
        <form className="form" onSubmit={createWinner}>
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
          <button className="button primary" disabled={savingId === "new"} type="submit">
            {savingId === "new" ? copy.admin.saving : copy.admin.createWinner}
          </button>
        </form>
      </section>

      <section className="section stack">
        <h2>{copy.admin.selectionResults}</h2>
        <div className="toolbar">
          <label>
            {copy.admin.searchWinners}
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.admin.searchWinnersPlaceholder}
            />
          </label>
        </div>
        <div className="admin-list compact">
          {filteredWinners.length > 0 ? filteredWinners.map((winner) => (
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
                  <span className="badge">
                    {winner.selectedItemTitle ?? copy.admin.noSelectedItem}
                  </span>
                </div>
              </div>

              <form className="admin-edit-form" onSubmit={(event) => updateWinner(event, winner.id)}>
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
                <button className="button" disabled={savingId === winner.id} type="submit">
                  {savingId === winner.id ? copy.admin.saving : copy.admin.updateWinner}
                </button>
              </form>

              <div className="admin-tools">
                <form
                  className="inline-form"
                  onSubmit={(event) => savePermission(event, winner)}
                >
                  <label className="meta-row">
                    <input
                      name="canSelect"
                      type="checkbox"
                      defaultChecked={winner.canSelect}
                    />
                    {copy.admin.canSelect}
                  </label>
                  <button className="button" disabled={savingId === winner.id} type="submit">
                    {copy.admin.saveSelectionPermission}
                  </button>
                </form>
                <button
                  className="button danger"
                  disabled={savingId === winner.id}
                  onClick={() => deleteWinner(winner.id)}
                  type="button"
                >
                  {copy.admin.deleteWinner}
                </button>
              </div>
            </article>
          )) : <p className="empty">{copy.admin.noMatchingWinners}</p>}
        </div>
      </section>
    </div>
  );
}
