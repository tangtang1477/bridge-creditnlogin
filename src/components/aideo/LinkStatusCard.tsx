import { useEffect, useState } from "react";
import { toast } from "sonner";
import { handoffCreate } from "@/lib/aideo/mock-api";
import type { LinkStatus, Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";

export function LinkStatusCard({
  locale,
  link,
  onRefresh,
}: {
  locale: Locale;
  link: LinkStatus;
  onRefresh: () => void;
}) {
  const [opening, setOpening] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);

  const openAideo = async () => {
    setOpening(true);
    setFallbackUrl(null);
    try {
      const { handoff_url } = await handoffCreate("/zh/home");
      const w = window.open(handoff_url, "_blank", "noopener,noreferrer");
      if (!w) {
        setFallbackUrl(handoff_url);
        toast.message(tr("popup_blocked", locale));
      }
    } finally {
      setOpening(false);
    }
  };

  return (
    <section className="rounded-2xl glass-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full bg-primary animate-glow-pulse" />
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              {tr("linked", locale)}
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <Row label={tr("aideo_email", locale)} value={link.aideo_email ?? "—"} />
            <Row
              label={tr("linked_at", locale)}
              value={link.linked_at ? new Date(link.linked_at).toLocaleString() : "—"}
            />
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            onClick={onRefresh}
            className="rounded-md border border-border/70 bg-transparent px-3 py-2 text-xs text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          >
            {tr("refresh", locale)}
          </button>
          <button
            disabled={opening}
            onClick={openAideo}
            className="glass-btn rounded-xl px-4 py-2 text-sm font-semibold"
          >
            {opening ? "…" : tr("open_aideo", locale)}
          </button>
        </div>
      </div>
      {fallbackUrl && (
        <p className="mt-4 text-xs text-muted-foreground">
          {tr("popup_blocked", locale)}{" "}
          <a className="text-primary underline" href={fallbackUrl} target="_blank" rel="noopener noreferrer">
            {tr("open_link", locale)}
          </a>
        </p>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}
