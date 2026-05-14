import { mkdir, writeFile } from "fs/promises";
import path from "path";

const maxImageCount = 10;
const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/pjpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"]
]);
const allowedImageExtensions = new Map([
  ["jpg", "jpg"],
  ["jpeg", "jpg"],
  ["png", "png"],
  ["webp", "webp"],
  ["gif", "gif"]
]);

function getExtension(file: File) {
  const mimeExtension = allowedImageTypes.get(file.type);
  if (mimeExtension) return mimeExtension;

  const nameExtension = file.name.split(".").pop()?.toLowerCase();
  return nameExtension ? allowedImageExtensions.get(nameExtension) : undefined;
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
    const fileName = `${crypto.randomUUID()}.${image.extension}`;
    const bytes = Buffer.from(await image.file.arrayBuffer());
    await writeFile(path.join(uploadDir, fileName), bytes);
    imageUrls.push(`/uploads/${fileName}`);
  }

  return { imageUrls };
}

export function uploadContentType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}
