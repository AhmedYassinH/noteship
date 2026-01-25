import { getSession } from "@auth0/nextjs-auth0";
import type { MeResponse } from "@noteship/domain";
import Link from "next/link";
import { redirect } from "next/navigation";
import { apiFetch } from "../../lib/api/client";
import styles from "./page.module.css";

const DashboardPage = async () => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  let user: MeResponse["user"] | null = null;
  let loadError = false;

  try {
    const me = await apiFetch<MeResponse>("/me");
    user = me.user;
  } catch {
    loadError = true;
  }

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <p className={styles.kicker}>Noteship Dashboard</p>
        <h1 className={styles.title}>You&apos;re signed in.</h1>
        <p className={styles.meta}>
          {user?.name ?? user?.email ?? session.user.email ?? session.user.name ?? session.user.sub}
        </p>
        {loadError ? (
          <div className={styles.warning}>
            We couldn&apos;t load your profile from the API. Check{" "}
            <code>NEXT_PUBLIC_API_BASE_URL</code> and Auth0 audience configuration.
          </div>
        ) : (
          user && (
            <div className={styles.list}>
              <div className={styles.listRow}>
                <span className={styles.label}>User ID</span>
                <span className={styles.value}>{user.userId}</span>
              </div>
              <div className={styles.listRow}>
                <span className={styles.label}>Email</span>
                <span className={styles.value}>{user.email}</span>
              </div>
              <div className={styles.listRow}>
                <span className={styles.label}>Plan</span>
                <span className={styles.value}>{user.planId ?? "free"}</span>
              </div>
              <div className={styles.listRow}>
                <span className={styles.label}>Status</span>
                <span className={styles.value}>{user.subscriptionStatus ?? "n/a"}</span>
              </div>
            </div>
          )
        )}
        <div className={styles.actions}>
          <Link className={styles.actionPrimary} href="/logout">
            Log out
          </Link>
          <Link className={styles.actionSecondary} href="/">
            Back to marketing site
          </Link>
        </div>
        <p className={styles.note}>
          Next step: load notes and drafts now that `/me` bootstrap is wired.
        </p>
      </section>
    </main>
  );
};

export default DashboardPage;
