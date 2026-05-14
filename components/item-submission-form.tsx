"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";
import { copy } from "@/lib/copy";
import { deliveryLabels } from "@/lib/labels";

type Preview = {
  name: string;
  url?: string;
  note?: string;
};

const maxImageCount = 10;
const maxImageSize = 10 * 1024 * 1024;
const allowedExtensions = new Set(["jpg", "jpeg", "png", "webp", "gif", "heic", "heif"]);

function getFileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase() ?? "";
}

function validateFiles(files: File[]) {
  if (files.length > maxImageCount) return copy.itemForm.errors.count;

  const oversized = files.find((file) => file.size > maxImageSize);
  if (oversized) return `${oversized.name}: ${copy.itemForm.errors.size}`;

  const invalid = files.find((file) => !allowedExtensions.has(getFileExtension(file)));
  if (invalid) return `${invalid.name}: ${copy.itemForm.errors.type}`;

  return "";
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="button primary" disabled={disabled || pending} type="submit">
      {pending ? copy.itemForm.submitting : copy.itemForm.submit}
    </button>
  );
}

export function ItemSubmissionForm({
  action,
  errorMessage
}: {
  action: (formData: FormData) => void | Promise<void>;
  errorMessage?: string;
}) {
  const [previews, setPreviews] = useState<Preview[]>([]);
  const [clientError, setClientError] = useState("");

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
      files.map((file) => {
        const extension = getFileExtension(file);
        if (extension === "heic" || extension === "heif") {
          return {
            name: file.name,
            note: copy.itemForm.heicPreviewNote
          };
        }

        return {
          name: file.name,
          url: URL.createObjectURL(file)
        };
      })
    );
  }

  const visibleError = clientError || errorMessage;

  return (
    <form className="form" action={action}>
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
          accept="image/*,.heic,.heif"
          multiple
          onChange={handleImageChange}
        />
        <p className="field-help">{imageSummary}</p>
        {previews.length > 0 ? (
          <div className="upload-preview-grid">
            {previews.map((preview) => (
              <div className="upload-preview" key={preview.name}>
                {preview.url ? (
                  <img src={preview.url} alt={preview.name} />
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

      <SubmitButton disabled={Boolean(clientError)} />
    </form>
  );
}
