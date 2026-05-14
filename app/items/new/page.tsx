import { createItemAction } from "@/app/actions";
import { ItemSubmissionForm } from "@/components/item-submission-form";
import { copy } from "@/lib/copy";

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

      <ItemSubmissionForm
        action={createItemAction}
        errorMessage={error ? errorMessages[error] : undefined}
      />
    </main>
  );
}
