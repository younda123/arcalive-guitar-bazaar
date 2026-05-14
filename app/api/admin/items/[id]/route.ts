import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateItem, updateItemStatus } from "@/lib/store";
import type { DeliveryMethod, ItemStatus } from "@/lib/types";

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
    if (body.status) {
      const item = await updateItemStatus(id, body.status as ItemStatus);
      return NextResponse.json({ item });
    }

    const item = await updateItem({
      id,
      title: String(body.title ?? "").trim(),
      description: String(body.description ?? "").trim(),
      condition: String(body.condition ?? "").trim(),
      deliveryMethod: String(body.deliveryMethod ?? "shipping") as DeliveryMethod,
      donorContact: String(body.donorContact ?? "").trim()
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: "update_failed" }, { status: 400 });
  }
}
