import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { updateItemImages } from "@/lib/store";
import { saveUploadedImages } from "@/lib/uploads";

async function requireAdmin() {
  const cookieStore = await cookies();
  return cookieStore.get("bazaar_admin")?.value === "1";
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const formData = await request.formData();
  const upload = await saveUploadedImages(formData);

  if (upload.error) {
    return NextResponse.json({ error: upload.error }, { status: 400 });
  }

  if (!upload.imageUrls || upload.imageUrls.length === 0) {
    return NextResponse.json({ error: "empty" }, { status: 400 });
  }

  const item = await updateItemImages(id, upload.imageUrls);
  return NextResponse.json({ item });
}
