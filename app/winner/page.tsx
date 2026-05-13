import { enterWinnerAction } from "@/app/actions";
import { copy } from "@/lib/copy";

export default function WinnerEntryPage() {
  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">{copy.winnerEntry.eyebrow}</p>
        <h1>{copy.winnerEntry.title}</h1>
        <p className="lead">{copy.winnerEntry.lead}</p>
      </section>

      <form className="form" action={enterWinnerAction}>
        <div className="field">
          <label htmlFor="code">{copy.fields.winnerCode}</label>
          <input id="code" name="code" placeholder={copy.winnerEntry.codePlaceholder} required />
        </div>
        <button className="button primary" type="submit">
          {copy.winnerEntry.submit}
        </button>
      </form>
    </main>
  );
}
