import {
  adminLoginAction,
  adminLogoutAction,
  isAdmin
} from "@/app/actions";
import { AdminItemManager } from "@/components/admin-item-manager";
import { AdminWinnerManager } from "@/components/admin-winner-manager";
import { copy } from "@/lib/copy";
import { readStore, sortItems } from "@/lib/store";

const adminErrors: Record<string, string> = copy.admin.errors;

export default async function AdminPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await isAdmin();
  const { error } = await searchParams;

  if (!admin) {
    return (
      <main className="page stack">
        <section>
          <p className="eyebrow">{copy.admin.eyebrow}</p>
          <h1>{copy.admin.loginTitle}</h1>
          <p className="lead">{copy.admin.loginLead}</p>
        </section>
        {error ? <p className="notice">{copy.admin.loginError}</p> : null}
        <form className="form" action={adminLoginAction}>
          <div className="field">
            <label htmlFor="password">{copy.fields.adminPassword}</label>
            <input id="password" name="password" type="password" required />
          </div>
          <button className="button primary" type="submit">
            {copy.admin.login}
          </button>
        </form>
      </main>
    );
  }

  const store = await readStore();
  const items = sortItems(store.items);

  return (
    <main className="page stack">
      <section>
        <p className="eyebrow">{copy.admin.eyebrow}</p>
        <h1>{copy.admin.title}</h1>
        <form action={adminLogoutAction}>
          <button className="button" type="submit">
            {copy.admin.logout}
          </button>
        </form>
      </section>

      {error && adminErrors[error] ? (
        <p className="notice">{adminErrors[error]}</p>
      ) : null}

      <section className="section stack">
        <h2>{copy.admin.itemManagement}</h2>
        <AdminItemManager initialItems={items} />
      </section>

      <AdminWinnerManager initialWinners={store.winners} items={store.items} />
    </main>
  );
}
