import { mkdir, writeFile } from "fs/promises";
import path from "path";
import convertHeic from "heic-convert";

const maxImageCount = 10;
const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/pjpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/heic", "heic"],
  ["image/heif", "heif"]
]);
const allowedImageExtensions = new Map([
  ["jpg", "jpg"],
  ["jpeg", "jpg"],
  ["png", "png"],
  ["webp", "webp"],
  ["gif", "gif"],
  ["heic", "heic"],
  ["heif", "heif"]
]);

function getExtension(file: File) {
  const mimeExtension = allowedImageTypes.get(file.type);
  if (mimeExtension) return mimeExtension;

  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  return nameExtension ? allowedImageExtensions.get(nameExtension) : undefined;
}

function toBuffer(value: Buffer | Uint8Array | ArrayBuffer) {
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
}

export async function saveUploadedImages(formData: FormData) {
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
    const extension = getExtension(image);
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
    const bytes = Buffer.from(await image.file.arrayBuffer());

    let converted: { bytes: Buffer; extension: string };
    try {
      converted =
        image.extension === "heic" || image.extension === "heif"
          ? {
              bytes: toBuffer(
                await convertHeic({
                  buffer: bytes,
                  format: "JPEG",
                  quality: 0.88
                })
              ),
              extension: "jpg"
            }
          : {
              bytes,
              extension: image.extension
            };
    } catch {
      return { error: "type" };
    }

    const fileName = `${crypto.randomUUID()}.${converted.extension}`;
    await writeFile(path.join(uploadDir, fileName), converted.bytes);
    imageUrls.push(`/uploads/${fileName}`);
  }

  return { imageUrls };
}
