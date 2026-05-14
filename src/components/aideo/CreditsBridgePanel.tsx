import { Link } from "@tanstack/react-router";
import type { Eligibility, LinkStatus, Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";
import { LinkStatusCard } from "./LinkStatusCard";
import { BalanceCards } from "./BalanceCards";
import { TransferPanel } from "./TransferPanel";
import { TransferHistoryTable } from "./TransferHistoryTable";

export function CreditsBridgePanel({
  locale,
  eligibility,
  link,
  reloadKey,
  onChanged,
}: {
  locale: Locale;
  eligibility: Eligibility;
  link: LinkStatus;
  reloadKey: number;
  onChanged: () => void;
}) {
  void eligibility;

  if (!link.linked) {
    return (
      <div className="rounded-2xl glass-card p-8 text-center animate-fade-in-up">
        <h3 className="text-lg font-semibold">{tr("credits_locked_title", locale)}</h3>
        <p className="mt-2 text-sm text-white/60">{tr("credits_locked_sub", locale)}</p>
        <Link
          to="/studio-bridge"
          search={{ tab: "login" }}
          className="glass-btn mt-6 inline-flex rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          {tr("go_to_login_bridge", locale)}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in-up">
      <LinkStatusCard locale={locale} link={link} onRefresh={onChanged} />
      <BalanceCards locale={locale} link={link} />
      <TransferPanel locale={locale} link={link} onTransferred={onChanged} />
      <TransferHistoryTable locale={locale} reloadKey={reloadKey} />
    </div>
  );
}
