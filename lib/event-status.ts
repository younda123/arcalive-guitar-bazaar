import { copy } from "@/lib/copy";
import type { EventSettings, Winner } from "@/lib/types";

function formatDate(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric"
  }).format(date);
}

function formatRemaining(value?: string) {
  if (!value) return undefined;
  const date = new Date(value);
  const remainingMs = date.getTime() - Date.now();
  if (Number.isNaN(remainingMs)) return undefined;
  if (remainingMs <= 0) return copy.eventStatus.eventEnded;

  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  return copy.eventStatus.eventRemaining(days, hours);
}

export function getCurrentSelectionWinner(winners: Winner[]) {
  return [...winners]
    .sort((a, b) => a.rank - b.rank || a.createdAt.localeCompare(b.createdAt))
    .find((winner) => !winner.selectedItemId);
}

export function getEventStatus(settings: EventSettings, winners: Winner[] = []) {
  if (settings.phase === "intake") {
    const deadline = formatDate(settings.itemSubmissionDeadline);
    return {
      title: copy.eventStatus.intakeTitle,
      detail: deadline
        ? copy.eventStatus.intakeDeadline(deadline)
        : copy.eventStatus.intakeNoDeadline
    };
  }

  if (settings.phase === "event") {
    return {
      title: copy.eventStatus.eventTitle,
      detail: formatRemaining(settings.eventEndAt) ?? copy.eventStatus.eventNoEnd
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
