import { copy } from "@/lib/copy";
import type { EventSettings, Winner } from "@/lib/types";

function toDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDate(value?: string) {
  const date = toDate(value);
  if (!date) return undefined;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatRemaining(value?: string) {
  const date = toDate(value);
  if (!date) return undefined;
  const remainingMs = date.getTime() - Date.now();
  if (remainingMs <= 0) return copy.eventStatus.eventEnded;

  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return copy.eventStatus.eventRemaining(days, hours);
}

function isPast(value?: string, now = new Date()) {
  const date = toDate(value);
  return Boolean(date && date.getTime() <= now.getTime());
}

export function getEffectiveEventSettings(
  settings: EventSettings,
  now = new Date()
): EventSettings {
  if (
    settings.phase === "intake" &&
    isPast(settings.itemSubmissionDeadline, now)
  ) {
    if (isPast(settings.eventEndAt, now)) {
      return { ...settings, phase: "selection" };
    }
    return { ...settings, phase: "event" };
  }

  if (settings.phase === "event" && isPast(settings.eventEndAt, now)) {
    return { ...settings, phase: "selection" };
  }

  return settings;
}

export function getCurrentSelectionWinner(winners: Winner[]) {
  return [...winners]
    .sort((a, b) => a.rank - b.rank || a.createdAt.localeCompare(b.createdAt))
    .find((winner) => !winner.selectedItemId);
}

export function getEventStatus(settings: EventSettings, winners: Winner[] = []) {
  const effectiveSettings = getEffectiveEventSettings(settings);

  if (effectiveSettings.phase === "intake") {
    const deadline = formatDate(effectiveSettings.itemSubmissionDeadline);
    return {
      title: copy.eventStatus.intakeTitle,
      detail: deadline
        ? copy.eventStatus.intakeDeadline(deadline)
        : copy.eventStatus.intakeNoDeadline
    };
  }

  if (effectiveSettings.phase === "event") {
    return {
      title: copy.eventStatus.eventTitle,
      detail: formatRemaining(effectiveSettings.eventEndAt) ?? copy.eventStatus.eventNoEnd
    };
  }

  const currentWinner = getCurrentSelectionWinner(winners);
  return {
    title: currentWinner
      ? copy.eventStatus.selectionTitle(currentWinner.rank)
      : copy.eventStatus.selectionDoneTitle,
    detail: currentWinner
      ? copy.eventStatus.selectionDetail
      : copy.eventStatus.selectionDoneDetail
  };
}
