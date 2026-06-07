"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { copy } from "@/lib/copy";
import { deliveryLabels } from "@/lib/labels";

type Preview = {
  id: string;
  name: string;
  url?: string;
  note?: string;
};

const maxImageCount = 10;
const maxImageSize = 25 * 1024 * 1024;
const maxTotalImageSize = 120 * 1024 * 1024;
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);
const allowedImageTypes = new Set([
  "image/jpeg",
  "image/pjpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence"
]);
const heicImageTypes = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence"
]);
const itemFormErrors: Record<string, string> = copy.itemForm.errors;

function getFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function isAllowedImage(file: File) {
  return allowedImageTypes.has(file.type) || allowedExtensions.has(getFileExtension(file));
}

function needsServerPreview(file: File) {
  const extension = getFileExtension(file);
  return heicImageTypes.has(file.type) || extension === "heic" || extension === "heif";
}

function validateFiles(files: File[]) {
  if (files.length > maxImageCount) return copy.itemForm.errors.count;

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > maxTotalImageSize) return copy.itemForm.errors["total-size"];

  const oversized = files.find((file) => file.size > maxImageSize);
  if (oversized) return `${oversized.name}: ${copy.itemForm.errors.size}`;

  const invalid = files.find((file) => !isAllowedImage(file));
  if (invalid) return `${invalid.name}: ${copy.itemForm.errors.type}`;

  return "";
}

export function ItemSubmissionForm({
  errorMessage
}: {
  errorMessage?: string;
}) {
  const router = useRouter();
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [clientError, setClientError] = useState("");
  const [serverError, setServerError] = useState(errorMessage ?? "");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    return () => {
      previews.forEach((preview) => {
        if (preview.url) URL.revokeObjectURL(preview.url);
      });
    };
  }, [previews]);

  const imageSummary = useMemo(() => {
    if (previews.length === 0) return copy.itemForm.imageHelp;
    return copy.itemForm.selectedImages(previews.length);
  }, [previews.length]);

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    previews.forEach((preview) => {
      if (preview.url) URL.revokeObjectURL(preview.url);
    });

    const files = Array.from(event.target.files ?? []);
    setClientError(validateFiles(files));
    setPreviews(
      files.map((file, index) => {
        const id = `${file.name}-${file.lastModified}-${index}`;
        if (needsServerPreview(file)) {
          return {
            id,
            name: file.name,
            note: copy.itemForm.heicPreviewNote
          };
        }

        try {
          return {
            id,
            name: file.name,
            url: URL.createObjectURL(file)
          };
        } catch {
          return {
            id,
            name: file.name,
            note: copy.itemForm.heicPreviewNote
          };
        }
      })
    );
  }

  function handlePreviewError(id: string) {
    const failedPreview = previews.find((preview) => preview.id === id);
    if (failedPreview?.url) {
      URL.revokeObjectURL(failedPreview.url);
    }

    setPreviews((current) =>
      current.map((preview) => {
        if (preview.id !== id || !preview.url) return preview;
        return {
          id: preview.id,
          name: preview.name,
          note: copy.itemForm.previewUnavailableNote
        };
      })
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    const form = event.currentTarget;
    const files = Array.from(
      (form.elements.namedItem("image") as HTMLInputElement | null)?.files ?? []
    );
    const validationError = validateFiles(files);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/items", {
        method: "POST",
        body: new FormData(form)
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.itemId) {
        setServerError(itemFormErrors[String(result.error ?? "")] ?? copy.itemForm.errors.upload);
        return;
      }

      router.push(`/items/${result.itemId}?submitted=1`);
    } catch {
      setServerError(copy.itemForm.errors.upload);
    } finally {
      setPending(false);
    }
  }

  const visibleError = clientError || serverError;

  return (
    <form className="form" onSubmit={handleSubmit}>
      {visibleError ? <p className="notice">{visibleError}</p> : null}

      <div className="field">
        <label htmlFor="title">{copy.fields.itemTitle}</label>
        <input id="title" name="title" required />
      </div>

      <div className="field">
        <label htmlFor="description">{copy.fields.itemDescription}</label>
        <textarea id="description" name="description" required />
      </div>

      <div className="field">
        <label htmlFor="condition">{copy.fields.itemCondition}</label>
        <input id="condition" name="condition" required />
      </div>

      <div className="field">
        <label htmlFor="image">{copy.fields.itemImage}</label>
        <input
          id="image"
          name="image"
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.heic,.heif"
          multiple
          onChange={handleImageChange}
        />
        <p className="field-help">{imageSummary}</p>
        {previews.length > 0 ? (
          <div className="upload-preview-grid">
            {previews.map((preview) => (
              <div className="upload-preview" key={preview.id}>
                {preview.url ? (
                  <img
                    src={preview.url}
                    alt={preview.name}
                    onError={() => handlePreviewError(preview.id)}
                  />
                ) : (
                  <div className="image-placeholder">{preview.note}</div>
                )}
                <span>{preview.name}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="field">
        <label htmlFor="deliveryMethod">{copy.fields.deliveryMethod}</label>
        <select id="deliveryMethod" name="deliveryMethod" defaultValue="shipping">
          <option value="shipping">{deliveryLabels.shipping}</option>
          <option value="direct">{deliveryLabels.direct}</option>
          <option value="negotiable">{deliveryLabels.negotiable}</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="donorContact">{copy.fields.donorContact}</label>
        <input id="donorContact" name="donorContact" required />
      </div>

      <button className="button primary" disabled={Boolean(clientError) || pending} type="submit">
        {pending ? copy.itemForm.submitting : copy.itemForm.submit}
      </button>
    </form>
  );
}
