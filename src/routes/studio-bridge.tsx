import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { applyMockMode, getEligibility, getLinkStatus } from "@/lib/aideo/mock-api";
import type { Eligibility, LinkStatus, Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";
import { LoginBridgePanel } from "@/components/aideo/LoginBridgePanel";
import { CreditsBridgePanel } from "@/components/aideo/CreditsBridgePanel";

type Tab = "login" | "credits";

type Search = { tab?: Tab; mock?: string };

export const Route = createFileRoute("/studio-bridge")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const tab = s.tab === "credits" ? "credits" : "login";
    const mock = typeof s.mock === "string" ? s.mock : undefined;
    return { tab, mock };
  },
  head: () => ({
    meta: [
      { title: "MovieFlow × Studio · Bridge" },
      { name: "description", content: "Account linking and 1:1 personal credits transfer between MovieFlow and Studio." },
    ],
  }),
  component: StudioBridgePage,
});

function StudioBridgePage() {
  const { tab = "login", mock } = Route.useSearch();
  const navigate = useNavigate({ from: "/studio-bridge" });
  const [locale, setLocale] = useState<Locale>("zh");
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [link, setLink] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    applyMockMode(mock ?? null);
  }, [mock]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getEligibility(), getLinkStatus()]).then(([e, l]) => {
      if (cancelled) return;
      setEligibility(e);
      setLink(l);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);

  const setTab = (t: Tab) =>
    navigate({ search: (prev: Search) => ({ ...prev, tab: t }), replace: true });

  return (
    <div data-theme="aideo-dark" className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="top-center" />
      <ProfileHeader locale={locale} setLocale={setLocale} active="nav_studio_world" />

      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {tr("bridge_title", locale)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/60">{tr("bridge_sub", locale)}</p>
        </div>

        {/* Tab switcher */}
        <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
          <TabBtn active={tab === "login"} onClick={() => setTab("login")}>
            {tr("tab_login_bridge", locale)}
          </TabBtn>
          <TabBtn active={tab === "credits"} onClick={() => setTab("credits")}>
            {tr("tab_credits_bridge", locale)}
          </TabBtn>
        </div>

        <div className="mt-8">
          {loading && (
            <div className="grid gap-4">
              <div className="h-32 animate-pulse rounded-2xl glass-card" />
              <div className="h-40 animate-pulse rounded-2xl glass-card" />
            </div>
          )}

          {!loading && eligibility && !eligibility.eligible && (
            <IneligibleView locale={locale} eligibility={eligibility} />
          )}

          {!loading && eligibility?.eligible && link && tab === "login" && (
            <LoginBridgePanel
              locale={locale}
              eligibility={eligibility}
              link={link}
              onChanged={refresh}
            />
          )}

          {!loading && eligibility?.eligible && link && tab === "credits" && (
            <CreditsBridgePanel
              locale={locale}
              eligibility={eligibility}
              link={link}
              reloadKey={reloadKey}
              onChanged={refresh}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm transition ${
        active
          ? "bg-primary text-primary-foreground font-semibold"
          : "text-white/65 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function IneligibleView({ locale, eligibility }: { locale: Locale; eligibility: Eligibility }) {
  const subKey =
    eligibility.reason === "subscription_inactive"
      ? "not_eligible_sub_inactive"
      : eligibility.reason === "plan_kickoff"
        ? "not_eligible_sub_kickoff"
        : eligibility.reason === "plan_missing"
          ? "not_eligible_sub_missing"
          : "not_logged_in";

  return (
    <div className="rounded-2xl glass-card p-8 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
          {tr("ineligible_chip", locale)}
        </span>
        <span className="text-xs text-white/55">
          {eligibility.subscription_status} · {eligibility.plan_name || "—"}
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold">{tr("not_eligible_title", locale)}</h2>
      <p className="mt-2 max-w-md text-sm text-white/60">{tr(subKey as never, locale)}</p>
      <Link
        to="/profile"
        className="glass-btn mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
      >
        {tr("upgrade", locale)}
      </Link>
    </div>
  );
}
