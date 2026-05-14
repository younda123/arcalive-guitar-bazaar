import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteWinner, updateWinner } from "@/lib/store";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("bazaar_admin")?.value === "1";
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const winner = await updateWinner({
      id,
      name: String(body.name ?? "").trim(),
      rank: Number(body.rank),
      code: String(body.code ?? "").trim(),
      canSelect: Boolean(body.canSelect)
    });
    return NextResponse.json({ winner });
  } catch {
    return NextResponse.json({ error: "winner-code" }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteWinner(id);
  return NextResponse.json({ ok: true });
}
