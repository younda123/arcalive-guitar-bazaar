"use client";

import { useState, type FormEvent } from "react";
import { copy } from "@/lib/copy";
import type { EventSettings } from "@/lib/types";

function toLocalInputValue(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIsoValue(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? new Date(text).toISOString() : "";
}

export function AdminEventSettings({
  initialSettings
}: {
  initialSettings: EventSettings;
}) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>();

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage(undefined);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phase: formData.get("phase"),
        itemSubmissionDeadline: toIsoValue(formData.get("itemSubmissionDeadline")),
        eventEndAt: toIsoValue(formData.get("eventEndAt"))
      })
    });
    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(copy.admin.messages.settingsError);
      return;
    }

    setSettings(result.settings);
    setMessage(copy.admin.messages.settingsSaved);
  }

  return (
    <section className="section stack">
      <h2>{copy.admin.eventSettings}</h2>
      {message ? <p className="notice">{message}</p> : null}
      <form className="form" onSubmit={saveSettings}>
        <div className="field">
          <label htmlFor="phase">{copy.fields.eventPhase}</label>
          <select id="phase" name="phase" defaultValue={settings.phase}>
            <option value="intake">{copy.eventPhases.intake}</option>
            <option value="event">{copy.eventPhases.event}</option>
            <option value="selection">{copy.eventPhases.selection}</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="itemSubmissionDeadline">
            {copy.fields.itemSubmissionDeadline}
          </label>
          <input
            id="itemSubmissionDeadline"
            name="itemSubmissionDeadline"
            type="datetime-local"
            defaultValue={toLocalInputValue(settings.itemSubmissionDeadline)}
          />
        </div>
        <div className="field">
          <label htmlFor="eventEndAt">{copy.fields.eventEndAt}</label>
          <input
            id="eventEndAt"
            name="eventEndAt"
            type="datetime-local"
            defaultValue={toLocalInputValue(settings.eventEndAt)}
          />
        </div>
        <button className="button primary" disabled={saving} type="submit">
          {saving ? copy.admin.saving : copy.admin.saveSettings}
        </button>
      </form>
    </section>
  );
}
