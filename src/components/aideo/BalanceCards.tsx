import type { LinkStatus, Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";

export function BalanceCards({ locale, link }: { locale: Locale; link: LinkStatus }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2">
      <BalanceCard
        label={tr("mf_balance", locale)}
        value={link.movieflow_transferable}
        accent="from-white/10 to-white/0"
      />
      <BalanceCard
        label={tr("aideo_balance", locale)}
        value={link.aideo_transferable}
        accent="from-primary/30 to-primary/0"
        highlight
      />
    </section>
  );
}

function BalanceCard({
  label,
  value,
  accent,
  highlight,
}: {
  label: string;
  value: number;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-md glass-card p-5">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent}`} />
      <div className="relative">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-2 font-mono text-3xl font-semibold ${highlight ? "text-primary" : ""}`}>
          {value.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
