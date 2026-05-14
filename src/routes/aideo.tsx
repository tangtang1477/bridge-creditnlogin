import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { applyMockMode, getEligibility, getLinkStatus } from "@/lib/aideo/mock-api";
import type { Eligibility, LinkStatus, Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";
import { LinkAccountFlow } from "@/components/aideo/LinkAccountFlow";
import { LinkStatusCard } from "@/components/aideo/LinkStatusCard";
import { BalanceCards } from "@/components/aideo/BalanceCards";
import { TransferPanel } from "@/components/aideo/TransferPanel";
import { TransferHistoryTable } from "@/components/aideo/TransferHistoryTable";

export const Route = createFileRoute("/aideo")({
  head: () => ({
    meta: [
      { title: "MovieFlow × Studio · Credits Bridge" },
      {
        name: "description",
        content:
          "Link your Studio account and transfer personal credits 1:1 between MovieFlow and Studio.",
      },
      { property: "og:title", content: "MovieFlow × Studio · Credits Bridge" },
      {
        property: "og:description",
        content: "1:1 personal credits transfer between MovieFlow and Studio.",
      },
    ],
  }),
  component: AideoPage,
});

function AideoPage() {
  const [locale, setLocale] = useState<Locale>("zh");
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [link, setLink] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const url = new URL(window.location.href);
    const mode = url.searchParams.get("mock");
    applyMockMode(mode);
  }, []);

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

  return (
    <div data-theme="aideo-dark" className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="top-center" />
      <Header locale={locale} setLocale={setLocale} />
      <main className="mx-auto w-full max-w-5xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <PageIntro locale={locale} />

        {loading && <SkeletonBlock />}

        {!loading && eligibility && !eligibility.eligible && (
          <IneligibleView locale={locale} eligibility={eligibility} />
        )}

        {!loading && eligibility?.eligible && link && !link.linked && (
          <LinkAccountFlow
            locale={locale}
            movieflowEmail={eligibility.movieflow_email}
            onLinked={refresh}
          />
        )}

        {!loading && eligibility?.eligible && link?.linked && (
          <div className="mt-8 flex flex-col gap-6 animate-fade-in-up">
            <LinkStatusCard locale={locale} link={link} onRefresh={refresh} />
            <BalanceCards locale={locale} link={link} />
            <TransferPanel locale={locale} link={link} onTransferred={refresh} />
            <TransferHistoryTable locale={locale} reloadKey={reloadKey} />
          </div>
        )}
      </main>
    </div>
  );
}

function Header({ locale, setLocale }: { locale: Locale; setLocale: (l: Locale) => void }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-primary cyan-glow" />
          <span className="text-sm font-semibold tracking-wide">{tr("brand", locale)}</span>
        </Link>
        <div className="flex items-center gap-1 rounded-md border border-border/70 p-0.5 text-xs">
          {(["zh", "en"] as Locale[]).map((l) => (
            <button
              key={l}
              onClick={() => setLocale(l)}
              className={`rounded px-2 py-1 transition ${
                locale === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

function PageIntro({ locale }: { locale: Locale }) {
  return (
    <div className="mt-2">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{tr("page_title", locale)}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{tr("page_sub", locale)}</p>
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="mt-8 grid gap-4">
      <div className="h-28 animate-pulse rounded-md glass-card" />
      <div className="h-40 animate-pulse rounded-md glass-card" />
    </div>
  );
}

function IneligibleView({ locale, eligibility }: { locale: Locale; eligibility: Eligibility }) {
  const subKey = useMemo(() => {
    switch (eligibility.reason) {
      case "subscription_inactive":
        return "not_eligible_sub_inactive" as const;
      case "plan_kickoff":
        return "not_eligible_sub_kickoff" as const;
      case "plan_missing":
        return "not_eligible_sub_missing" as const;
      case "not_logged_in":
        return "not_logged_in" as const;
      default:
        return "not_eligible_sub_kickoff" as const;
    }
  }, [eligibility.reason]);

  return (
    <div className="mt-10 rounded-md glass-card p-8 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
          {tr("ineligible_chip", locale)}
        </span>
        <span className="text-xs text-muted-foreground">
          {eligibility.subscription_status} · {eligibility.plan_name || "—"}
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold">{tr("not_eligible_title", locale)}</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{tr(subKey, locale)}</p>
      <button className="glass-btn mt-6 rounded-md px-5 py-2.5 text-sm font-semibold">
        {tr("upgrade", locale)}
      </button>
    </div>
  );
}
