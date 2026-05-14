import type { Locale, TransferDirection } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";

export function TransferConfirmDialog({
  open,
  onClose,
  onConfirm,
  executing,
  locale,
  direction,
  amount,
  sourceLabel,
  targetLabel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  executing: boolean;
  locale: Locale;
  direction: TransferDirection;
  amount: number;
  sourceLabel: string;
  targetLabel: string;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl glass-card p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{tr("confirm_transfer", locale)}</h3>
        <div className="mt-4 grid gap-2 text-sm">
          <Row k={tr("source", locale)} v={`${sourceLabel} (${direction === "movieflow_to_aideo" ? "MovieFlow" : "Studio"})`} />
          <Row k={tr("target", locale)} v={`${targetLabel} (${direction === "movieflow_to_aideo" ? "Studio" : "MovieFlow"})`} />
          <Row k={tr("deduct", locale)} v={amount.toLocaleString()} highlight="destructive" />
          <Row k={tr("credit", locale)} v={amount.toLocaleString()} highlight="primary" />
          <Row k={tr("rate", locale)} v="1 : 1" />
          <Row k={tr("fee", locale)} v="0" />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            disabled={executing}
            onClick={onClose}
            className="rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            {tr("cancel", locale)}
          </button>
          <button
            disabled={executing}
            onClick={onConfirm}
            className="glass-btn rounded-full px-5 py-2 text-sm font-semibold"
          >
            {executing ? "…" : tr("confirm_transfer", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  highlight,
  hidden,
}: {
  k: string;
  v: string;
  highlight?: "primary" | "destructive";
  hidden?: boolean;
}) {
  if (hidden) return null;
  const cls = highlight === "primary" ? "text-primary" : highlight === "destructive" ? "text-destructive" : "";
  return (
    <div className="flex items-center justify-between border-b border-border/40 py-1.5">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className={`font-mono text-sm font-medium ${cls}`}>{v}</span>
    </div>
  );
}
