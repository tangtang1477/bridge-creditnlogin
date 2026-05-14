import { useEffect, useState } from "react";
import { transferHistory } from "@/lib/aideo/mock-api";
import type { Locale, TransferRecord } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";

const PAGE_SIZE = 20;

export function TransferHistoryTable({ locale, reloadKey }: { locale: Locale; reloadKey: number }) {
  const [items, setItems] = useState<TransferRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;
    transferHistory(page, PAGE_SIZE).then((r) => {
      if (cancelled) return;
      setItems(r.items);
      setTotal(r.total);
    });
    return () => {
      cancelled = true;
    };
  }, [page, reloadKey]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <section className="rounded-2xl glass-card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{tr("history", locale)}</h2>
        <span className="text-xs text-muted-foreground">{total}</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{tr("no_history", locale)}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/60">
                <th className="py-2 pr-3 font-normal">{tr("source", locale)}</th>
                <th className="py-2 pr-3 font-normal">{tr("amount", locale)}</th>
                <th className="py-2 pr-3 font-normal">Status</th>
                <th className="py-2 pr-3 font-normal text-right">Time</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.transfer_id} className="border-b border-border/30">
                  <td className="py-2.5 pr-3">
                    <span className="font-medium">
                      {it.direction === "movieflow_to_aideo"
                        ? tr("direction_mf_to_aideo", locale)
                        : tr("direction_aideo_to_mf", locale)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 font-mono">{it.amount_in.toLocaleString()}</td>
                  <td className="py-2.5 pr-3">
                    <StatusPill status={it.status} locale={locale} />
                  </td>
                  <td className="py-2.5 pr-3 text-right font-mono text-xs text-muted-foreground">
                    {new Date(it.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {tr("page_indicator", locale, { n: page, total })}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded border border-border/70 px-3 py-1 text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            >
              {tr("prev", locale)}
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded border border-border/70 px-3 py-1 text-muted-foreground transition hover:text-foreground disabled:opacity-40"
            >
              {tr("next", locale)}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function StatusPill({ status, locale }: { status: TransferRecord["status"]; locale: Locale }) {
  const cls =
    status === "completed"
      ? "border-primary/40 bg-primary/10 text-primary"
      : status === "failed"
        ? "border-destructive/40 bg-destructive/10 text-destructive"
        : "border-border bg-white/5 text-muted-foreground";
  const label =
    status === "completed"
      ? tr("status_completed", locale)
      : status === "failed"
        ? tr("status_failed", locale)
        : tr("status_pending", locale);
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${cls}`}>{label}</span>
  );
}
