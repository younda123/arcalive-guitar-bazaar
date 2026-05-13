"use server";

import { mkdir, writeFile } from "fs/promises";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import path from "path";
import {
  createItem,
  createWinner,
  deleteWinner,
  selectItemForWinner,
  updateItem,
  updateItemImages,
  updateItemStatus,
  updateWinner,
  updateWinnerCanSelect
} from "@/lib/store";
import type { DeliveryMethod, ItemStatus } from "@/lib/types";

const adminCookie = "bazaar_admin";
const maxImageCount = 10;
const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function saveUploadedImages(formData: FormData) {
  const images = formData
    .getAll("image")
    .filter((image): image is File => image instanceof File && image.size > 0);

  if (images.length === 0) {
    return { imageUrls: [] };
  }

  if (images.length > maxImageCount) {
    return { error: "count" };
  }

  const validImages: Array<{ file: File; extension: string }> = [];
  for (const image of images) {
    const extension = allowedImageTypes.get(image.type);
    if (!extension) {
      return { error: "type" };
    }

    if (image.size > maxImageSize) {
      return { error: "size" };
    }

    validImages.push({ file: image, extension });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const imageUrls: string[] = [];
  for (const image of validImages) {
    const fileName = `${crypto.randomUUID()}.${image.extension}`;
    const bytes = Buffer.from(await image.file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), bytes);
    imageUrls.push(`/uploads/${fileName}`);
  }

  return { imageUrls };
}

export async function createItemAction(formData: FormData) {
  const upload = await saveUploadedImages(formData);
  if (upload.error) {
    redirect(`/items/new?error=${upload.error}`);
  }

  const item = await createItem({
    title: getString(formData, "title"),
    description: getString(formData, "description"),
    condition: getString(formData, "condition"),
    imageUrls: upload.imageUrls,
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
  try {
    await selectItemForWinner(code, itemId);
  } catch {
    redirect(`/winner/${encodeURIComponent(code)}?error=select`);
  }
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

export async function updateItemAction(formData: FormData) {
  try {
    await updateItem({
      id: getString(formData, "id"),
      title: getString(formData, "title"),
      description: getString(formData, "description"),
      condition: getString(formData, "condition"),
      deliveryMethod: getString(formData, "deliveryMethod") as DeliveryMethod,
      donorContact: getString(formData, "donorContact")
    });
  } catch {
    redirect("/admin?error=item-update");
  }
  redirect("/admin");
}

export async function updateItemImageAction(formData: FormData) {
  const upload = await saveUploadedImages(formData);
  if (upload.error) {
    redirect(`/admin?error=image-${upload.error}`);
  }

  if (!upload.imageUrls || upload.imageUrls.length === 0) {
    redirect("/admin?error=image-empty");
  }

  await updateItemImages(getString(formData, "id"), upload.imageUrls);
  redirect("/admin");
}

export async function createWinnerAction(formData: FormData) {
  try {
    await createWinner({
      name: getString(formData, "name"),
      rank: Number(getString(formData, "rank")),
      code: getString(formData, "code"),
      canSelect: formData.get("canSelect") === "on"
    });
  } catch {
    redirect("/admin?error=winner-code");
  }
  redirect("/admin");
}

export async function winnerCanSelectAction(formData: FormData) {
  const id = getString(formData, "id");
  await updateWinnerCanSelect(id, formData.get("canSelect") === "on");
  redirect("/admin");
}

export async function updateWinnerAction(formData: FormData) {
  try {
    await updateWinner({
      id: getString(formData, "id"),
      name: getString(formData, "name"),
      rank: Number(getString(formData, "rank")),
      code: getString(formData, "code"),
      canSelect: formData.get("canSelect") === "on"
    });
  } catch {
    redirect("/admin?error=winner-code");
  }
  redirect("/admin");
}

export async function deleteWinnerAction(formData: FormData) {
  await deleteWinner(getString(formData, "id"));
  redirect("/admin");
}

export async function isAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get(adminCookie)?.value === "1";
}
