"use client";

import type { MeResponse } from "@noteship/domain";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../components/auth/AuthProvider";
import { apiFetch } from "../../lib/api/client";
import styles from "./page.module.css";

const DashboardPage = () => {
  const { isLoading, isAuthenticated, user: authUser, login } = useAuth();
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      void login("/dashboard");
    }
  }, [isLoading, isAuthenticated, login]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const load = async () => {
      try {
        const me = await apiFetch<MeResponse>("/me");
        setUser(me.user);
      } catch {
        setLoadError(true);
      }
    };

    void load();
  }, [isAuthenticated]);

  return (
    <main className={styles.main}>
      <section className={styles.card}>
        <p className={styles.kicker}>Noteship Dashboard</p>
        <h1 className={styles.title}>
          {isLoading
            ? "Checking session..."
            : isAuthenticated
              ? "You're signed in."
              : "Redirecting to login..."}
        </h1>
        <p className={styles.meta}>
          {user?.name ?? user?.email ?? authUser?.email ?? authUser?.name}
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
