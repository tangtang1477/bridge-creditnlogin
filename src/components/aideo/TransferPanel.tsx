import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { transferExecute, transferValidate } from "@/lib/aideo/mock-api";
import type { LinkStatus, Locale, TransferDirection, ValidateResult } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";
import { errorMessage } from "@/lib/aideo/error-messages";
import { TransferConfirmDialog } from "./TransferConfirmDialog";

export function TransferPanel({
  locale,
  link,
  onTransferred,
}: {
  locale: Locale;
  link: LinkStatus;
  onTransferred: () => void;
}) {
  const [direction, setDirection] = useState<TransferDirection>("movieflow_to_aideo");
  const [amount, setAmount] = useState<string>("");
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidateResult | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [executing, setExecuting] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const sourceBalance =
    direction === "movieflow_to_aideo" ? link.movieflow_transferable : link.aideo_transferable;
  const sourceLabel = direction === "movieflow_to_aideo" ? "MovieFlow" : "Studio";
  const targetLabel = direction === "movieflow_to_aideo" ? "Studio" : "MovieFlow";

  const numAmount = Number(amount);
  const isValidNumber = /^\d+$/.test(amount) && numAmount > 0;

  useEffect(() => {
    setValidation(null);
    if (!isValidNumber) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      setValidating(true);
      const v = await transferValidate(direction, numAmount);
      setValidation(v);
      setValidating(false);
    }, 600);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [direction, amount, isValidNumber, numAmount]);

  const setQuick = (pct: number) => {
    const v = Math.max(1, Math.floor(sourceBalance * pct));
    setAmount(String(v));
  };

  const checkAvailability = async () => {
    if (!isValidNumber) {
      toast.error(errorMessage("TRANSFER_AMOUNT_INVALID", locale));
      return;
    }
    setValidating(true);
    const v = await transferValidate(direction, numAmount);
    setValidation(v);
    setValidating(false);
    if (v.ok) toast.success(tr("validation_ok", locale));
    else toast.error(errorMessage(v.error_code, locale));
  };

  const onConfirm = async () => {
    if (executing) return;
    setExecuting(true);
    const idem = `idem_${direction}_${numAmount}_${Date.now()}`;
    const res = await transferExecute(direction, numAmount, idem);
    setExecuting(false);
    setConfirmOpen(false);
    if ("ok" in res && res.ok) {
      toast.success(tr("transfer_success", locale));
      setAmount("");
      setValidation(null);
      onTransferred();
    } else {
      toast.error(errorMessage((res as { error_code: string }).error_code as never, locale));
    }
  };

  return (
    <section className="rounded-2xl glass-card p-5 sm:p-6">
      <h2 className="text-lg font-semibold">{tr("transfer", locale)}</h2>

      {/* Direction tabs */}
      <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl border border-border/70 p-1">
        <DirectionTab
          active={direction === "movieflow_to_aideo"}
          onClick={() => setDirection("movieflow_to_aideo")}
          label={tr("direction_mf_to_aideo", locale)}
        />
        <DirectionTab
          active={direction === "aideo_to_movieflow"}
          onClick={() => setDirection("aideo_to_movieflow")}
          label={tr("direction_aideo_to_mf", locale)}
        />
      </div>

      {/* Source/target preview */}
      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs">
        <SideBox title={tr("source", locale)} name={sourceLabel} balance={sourceBalance} />
        <span className="text-primary text-lg">→</span>
        <SideBox
          title={tr("target", locale)}
          name={targetLabel}
          balance={
            direction === "movieflow_to_aideo" ? link.aideo_transferable : link.movieflow_transferable
          }
        />
      </div>

      {/* Amount input */}
      <div className="mt-5">
        <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {tr("amount", locale)}
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))}
            placeholder={tr("amount_placeholder", locale)}
            className="flex-1 min-w-[180px] rounded-xl border border-border bg-black/40 px-3 py-2 font-mono text-base text-foreground outline-none focus:border-primary"
          />
          <div className="flex items-center gap-1">
            {[
              { l: "25%", v: 0.25 },
              { l: "50%", v: 0.5 },
              { l: "Max", v: 1 },
            ].map((q) => (
              <button
                key={q.l}
                onClick={() => setQuick(q.v)}
                className="rounded-xl border border-border/70 px-2 py-1.5 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                {q.l}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 min-h-[18px] text-xs">
          {validating && <span className="text-muted-foreground">{tr("validating", locale)}</span>}
          {!validating && validation && validation.ok && (
            <span className="text-primary">✓ {tr("validation_ok", locale)}</span>
          )}
          {!validating && validation && !validation.ok && (
            <span className="text-destructive">{errorMessage(validation.error_code, locale)}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={checkAvailability}
          className="rounded-xl border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
        >
          {tr("check_availability", locale)}
        </button>
        <button
          disabled={!isValidNumber || !validation?.ok || executing}
          onClick={() => setConfirmOpen(true)}
          className="glass-btn rounded-xl px-5 py-2 text-sm font-semibold"
        >
          {tr("transfer", locale)}
        </button>
      </div>

      <TransferConfirmDialog
        open={confirmOpen}
        onClose={() => !executing && setConfirmOpen(false)}
        onConfirm={onConfirm}
        executing={executing}
        locale={locale}
        direction={direction}
        amount={numAmount}
        sourceLabel={sourceLabel}
        targetLabel={targetLabel}
      />
    </section>
  );
}

function DirectionTab({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
        active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SideBox({ title, name, balance }: { title: string; name: string; balance: number }) {
  return (
    <div className="rounded-xl border border-border/70 bg-black/30 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{title}</p>
      <p className="mt-1 text-sm font-semibold">{name}</p>
      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{balance.toLocaleString()}</p>
    </div>
  );
}
