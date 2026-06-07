import { NextResponse } from "next/server";
import { createItem, getEventSettings } from "@/lib/store";
import type { DeliveryMethod } from "@/lib/types";
import { saveUploadedImages } from "@/lib/uploads";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function logItemCreate(message: string, details?: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      scope: "item-create",
      message,
      ...details
    })
  );
}

function logItemCreateError(message: string, details?: Record<string, unknown>) {
  console.error(
    JSON.stringify({
      scope: "item-create",
      message,
      ...details
    })
  );
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    logItemCreateError("form-data-parse-failed", {
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({ error: "upload" }, { status: 400 });
  }

  const settings = await getEventSettings();
  if (settings.phase !== "intake") {
    logItemCreate("closed-phase", { phase: settings.phase });
    return NextResponse.json({ error: "closed" }, { status: 409 });
  }

  const upload = await saveUploadedImages(formData, { scope: "item-create" });
  if (upload.error) {
    logItemCreateError("upload-failed", { error: upload.error });
    return NextResponse.json({ error: upload.error }, { status: 400 });
  }

  try {
    const item = await createItem({
      title: getString(formData, "title"),
      description: getString(formData, "description"),
      condition: getString(formData, "condition"),
      imageUrls: upload.imageUrls,
      deliveryMethod: getString(formData, "deliveryMethod") as DeliveryMethod,
      donorContact: getString(formData, "donorContact")
    });

    logItemCreate("created", {
      itemId: item.id,
      imageCount: upload.imageUrls?.length ?? 0
    });
    return NextResponse.json({ itemId: item.id });
  } catch (error) {
    logItemCreateError("create-failed", {
      error: error instanceof Error ? error.message : String(error)
    });
    return NextResponse.json({ error: "closed" }, { status: 409 });
  }
}
