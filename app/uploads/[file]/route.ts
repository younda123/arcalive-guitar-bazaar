import { readFile } from "fs/promises";
import { notFound } from "next/navigation";
import path from "path";
import { uploadContentType } from "@/lib/uploads";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;
  const safeFile = path.basename(file);
  if (safeFile !== file) {
    notFound();
  }

  try {
    const uploadPath = path.join(process.cwd(), "public", "uploads", safeFile);
    const body = await readFile(uploadPath);
    return new Response(body, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Type": uploadContentType(safeFile)
      }
    });
  } catch {
    notFound();
  }
}
