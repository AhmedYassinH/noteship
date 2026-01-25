import { getSession } from "@auth0/nextjs-auth0";
import Link from "next/link";
import { redirect } from "next/navigation";
import styles from "./page.module.css";

const DashboardPage = async () => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <p className={styles.kicker}>Noteship Dashboard</p>
        <h1 className={styles.title}>You&apos;re signed in.</h1>
        <p className={styles.meta}>{session.user.name ?? session.user.email ?? session.user.sub}</p>
        <div className={styles.actions}>
          <Link className={styles.actionPrimary} href="/logout">
            Log out
          </Link>
          <Link className={styles.actionSecondary} href="/">
            Back to marketing site
          </Link>
        </div>
        <p className={styles.note}>
          Next step: connect to the API and load your notes after bootstrap.
        </p>
      </section>
    </main>
  );
};

export default DashboardPage;
