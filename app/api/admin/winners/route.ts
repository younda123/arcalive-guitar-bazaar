import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createWinner } from "@/lib/store";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("bazaar_admin")?.value === "1";
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {
    const winner = await createWinner({
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
