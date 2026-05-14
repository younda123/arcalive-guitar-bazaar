import { createItemAction } from "@/app/actions";
import { copy } from "@/lib/copy";
import { deliveryLabels } from "@/lib/labels";

const errorMessages: Record<string, string> = copy.itemForm.errors;

export default async function NewItemPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">{copy.itemForm.eyebrow}</p>
        <h1>{copy.itemForm.title}</h1>
        <p className="lead">{copy.itemForm.lead}</p>
      </section>

      {error && errorMessages[error] ? (
        <p className="notice">{errorMessages[error]}</p>
      ) : null}

      <form className="form" action={createItemAction}>
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
          <input id="image" name="image" type="file" accept="image/*,.heic,.heif" multiple />
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

        <button className="button primary" type="submit">
          {copy.itemForm.submit}
        </button>
      </form>
    </main>
  );
}
