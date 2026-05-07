"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createItem,
  createWinner,
  selectItemForWinner,
  updateItemStatus,
  updateWinnerCanSelect
} from "@/lib/store";
import type { DeliveryMethod, ItemStatus } from "@/lib/types";

const adminCookie = "bazaar_admin";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function createItemAction(formData: FormData) {
  const item = await createItem({
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    condition: getString(formData, "condition"),
    imageUrl: getString(formData, "imageUrl"),
    deliveryMethod: getString(formData, "deliveryMethod") as DeliveryMethod,
    donorContact: getString(formData, "donorContact")
  });
  redirect(`/items/${item.id}?submitted=1`);
}

export async function enterWinnerAction(formData: FormData) {
  const code = getString(formData, "code");
  redirect(`/winner/${encodeURIComponent(code)}`);
}

export async function selectItemAction(formData: FormData) {
  const code = getString(formData, "code");
  const itemId = getString(formData, "itemId");
  await selectItemForWinner(code, itemId);
  redirect(`/winner/${encodeURIComponent(code)}?selected=1`);
}

export async function adminLoginAction(formData: FormData) {
  const password = getString(formData, "password");
  const expected = process.env.ADMIN_PASSWORD ?? "change-me";
  if (password !== expected) {
    redirect("/admin?error=1");
  }

  const cookieStore = await cookies();
  cookieStore.set(adminCookie, "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12
  });
  redirect("/admin");
}

export async function adminLogoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(adminCookie);
  redirect("/admin");
}

export async function itemStatusAction(formData: FormData) {
  const id = getString(formData, "id");
  const status = getString(formData, "status") as ItemStatus;
  await updateItemStatus(id, status);
  redirect("/admin");
}

export async function createWinnerAction(formData: FormData) {
  await createWinner({
    name: getString(formData, "name"),
    rank: Number(getString(formData, "rank")),
    code: getString(formData, "code"),
    canSelect: formData.get("canSelect") === "on"
  });
  redirect("/admin");
}

export async function winnerCanSelectAction(formData: FormData) {
  const id = getString(formData, "id");
  await updateWinnerCanSelect(id, formData.get("canSelect") === "on");
  redirect("/admin");
}

export async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get(adminCookie)?.value === "1";
}
