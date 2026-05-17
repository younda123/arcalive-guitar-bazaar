import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateEventSettings } from "@/lib/store";
import type { EventPhase } from "@/lib/types";

const phases: EventPhase[] = ["intake", "event", "selection"];

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("bazaar_admin")?.value === "1";
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const phase = String(body.phase ?? "") as EventPhase;

  if (!phases.includes(phase)) {
    return NextResponse.json({ error: "phase" }, { status: 400 });
  }

  const settings = await updateEventSettings({
    phase,
    itemSubmissionDeadline: String(body.itemSubmissionDeadline ?? "").trim(),
    eventEndAt: String(body.eventEndAt ?? "").trim()
  });

  return NextResponse.json({ settings });
}
