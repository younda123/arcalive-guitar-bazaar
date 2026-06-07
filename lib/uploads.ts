import { mkdir, writeFile } from "fs/promises";
import path from "path";
import convertHeic from "heic-convert";

const maxImageCount = 10;
const maxImageSize = 25 * 1024 * 1024;
const maxTotalImageSize = 120 * 1024 * 1024;
const allowedImageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/pjpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/heic", "heic"],
  ["image/heif", "heif"],
  ["image/heic-sequence", "heic"],
  ["image/heif-sequence", "heif"]
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

type UploadLogContext = {
  scope?: string;
};

function logUpload(
  level: "info" | "error",
  context: UploadLogContext | undefined,
  message: string,
  details?: Record<string, unknown>
) {
  if (!context?.scope) return;

  const payload = JSON.stringify({
    scope: context.scope,
    upload: message,
    ...details
  });
  if (level === "error") {
    console.error(payload);
  } else {
    console.info(payload);
  }
}

function fileMeta(file: File, extension?: string) {
  return {
    name: file.name,
    type: file.type || "(empty)",
    size: file.size,
    extension
  };
}

export async function saveUploadedImages(
  formData: FormData,
  context?: UploadLogContext
) {
  const images = formData
    .getAll("image")
    .filter((image): image is File => image instanceof File && image.size > 0);

  logUpload("info", context, "received", {
    count: images.length,
    files: images.map((image) => fileMeta(image))
  });

  if (images.length === 0) {
    return { imageUrls: [] };
  }

  if (images.length > maxImageCount) {
    logUpload("error", context, "count-exceeded", { count: images.length });
    return { error: "count" };
  }

  const totalSize = images.reduce((sum, image) => sum + image.size, 0);
  if (totalSize > maxTotalImageSize) {
    logUpload("error", context, "total-size-exceeded", { totalSize });
    return { error: "total-size" };
  }

  const validImages: Array<{ file: File; extension: string }> = [];
  for (const image of images) {
    const extension = getExtension(image);
    if (!extension) {
      logUpload("error", context, "invalid-type", fileMeta(image));
      return { error: "type" };
    }

    if (image.size > maxImageSize) {
      logUpload("error", context, "size-exceeded", fileMeta(image, extension));
      return { error: "size" };
    }

    logUpload("info", context, "validated", fileMeta(image, extension));
    validImages.push({ file: image, extension });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    logUpload("error", context, "mkdir-failed", {
      error: error instanceof Error ? error.message : String(error)
    });
    return { error: "upload" };
  }

  const imageUrls: string[] = [];
  for (const image of validImages) {
    let bytes: Buffer;
    try {
      bytes = Buffer.from(await image.file.arrayBuffer());
    } catch (error) {
      logUpload("error", context, "read-failed", {
        ...fileMeta(image.file, image.extension),
        error: error instanceof Error ? error.message : String(error)
      });
      return { error: "upload" };
    }

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
    } catch (error) {
      logUpload("error", context, "convert-failed", {
        ...fileMeta(image.file, image.extension),
        error: error instanceof Error ? error.message : String(error)
      });
      return { error: "type" };
    }

    const fileName = `${crypto.randomUUID()}.${converted.extension}`;
    try {
      await writeFile(path.join(uploadDir, fileName), converted.bytes);
    } catch (error) {
      logUpload("error", context, "write-failed", {
        ...fileMeta(image.file, image.extension),
        error: error instanceof Error ? error.message : String(error)
      });
      return { error: "upload" };
    }
    logUpload("info", context, "saved", {
      source: fileMeta(image.file, image.extension),
      fileName,
      savedSize: converted.bytes.length
    });
    imageUrls.push(`/uploads/${fileName}`);
  }

  return { imageUrls };
}
