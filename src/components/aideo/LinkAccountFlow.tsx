import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  getLinkStatus,
  linkCreateAccount,
  linkStart,
  simulateOccupiedBindNow,
} from "@/lib/aideo/mock-api";
import type { Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";
import { errorMessage } from "@/lib/aideo/error-messages";

type Stage =
  | { kind: "idle" }
  | { kind: "needs_password"; email: string }
  | { kind: "waiting"; email: string; via: "create" | "occupied"; popupUrl?: string }
  | { kind: "done" };

export function LinkAccountFlow({
  locale,
  movieflowEmail,
  onLinked,
}: {
  locale: Locale;
  movieflowEmail: string;
  onLinked: () => void;
}) {
  const [stage, setStage] = useState<Stage>({ kind: "idle" });
  const [starting, setStarting] = useState(false);

  const start = async () => {
    setStarting(true);
    const r = await linkStart();
    setStarting(false);
    if (r.kind === "needs_password") {
      setStage({ kind: "needs_password", email: r.movieflow_email });
    } else if (r.kind === "requires_aideo_auth") {
      const w = window.open(r.aideo_auth_url, "_blank", "noopener,noreferrer");
      setStage({
        kind: "waiting",
        email: r.movieflow_email,
        via: "occupied",
        popupUrl: w ? undefined : r.aideo_auth_url,
      });
    } else if (r.kind === "already_linked") {
      onLinked();
    }
  };

  return (
    <div className="mt-8 animate-fade-in-up">
      <section className="rounded-2xl glass-card p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-border bg-white/5 px-2 py-0.5 text-xs text-muted-foreground">
            {tr("unlinked", locale)}
          </span>
        </div>
        <div className="mt-3 grid gap-1">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {tr("movieflow_email", locale)}
          </span>
          <span className="font-mono text-sm">{movieflowEmail}</span>
        </div>
        <button
          onClick={start}
          disabled={starting}
          className="glass-btn mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          {starting ? "…" : tr("link_account", locale)}
        </button>
      </section>

      {stage.kind === "needs_password" && (
        <PasswordModal
          locale={locale}
          email={stage.email}
          onClose={() => setStage({ kind: "idle" })}
          onSubmitted={() =>
            setStage({ kind: "waiting", email: stage.email, via: "create" })
          }
        />
      )}

      {stage.kind === "waiting" && (
        <WaitingOverlay
          locale={locale}
          email={stage.email}
          via={stage.via}
          popupUrl={stage.popupUrl}
          onLinked={() => {
            setStage({ kind: "done" });
            onLinked();
          }}
          onClose={() => setStage({ kind: "idle" })}
        />
      )}
    </div>
  );
}

function PasswordModal({
  locale,
  email,
  onClose,
  onSubmitted,
}: {
  locale: Locale;
  email: string;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (pw.length < 8) {
      toast.error(tr("password_too_short", locale));
      return;
    }
    if (pw !== pw2) {
      toast.error(tr("passwords_mismatch", locale));
      return;
    }
    setSubmitting(true);
    const r = await linkCreateAccount(pw);
    setSubmitting(false);
    if (r.ok) onSubmitted();
    else toast.error(errorMessage(r.error_code as never, locale));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl glass-card p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{tr("set_aideo_password", locale)}</h3>
        <p className="mt-1 text-xs text-muted-foreground font-mono">{email}</p>
        <div className="mt-5 grid gap-3">
          <Field
            label={tr("password", locale)}
            type="password"
            value={pw}
            onChange={setPw}
            autoFocus
          />
          <Field
            label={tr("confirm_password", locale)}
            type="password"
            value={pw2}
            onChange={setPw2}
          />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            {tr("cancel", locale)}
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="glass-btn rounded-xl px-5 py-2 text-sm font-semibold"
          >
            {submitting ? "…" : tr("submit", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  autoFocus,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-border bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function WaitingOverlay({
  locale,
  email,
  via,
  popupUrl,
  onLinked,
  onClose,
}: {
  locale: Locale;
  email: string;
  via: "create" | "occupied";
  popupUrl?: string;
  onLinked: () => void;
  onClose: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(60);

  // poll every 3s up to 60s
  useEffect(() => {
    let stopped = false;
    const tick = setInterval(async () => {
      if (stopped) return;
      const s = await getLinkStatus();
      if (s.linked) {
        stopped = true;
        clearInterval(tick);
        clearInterval(timer);
        onLinked();
      }
    }, 3000);
    const timer = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => {
      stopped = true;
      clearInterval(tick);
      clearInterval(timer);
    };
  }, [onLinked]);

  // refocus → also refresh
  useEffect(() => {
    const onFocus = async () => {
      const s = await getLinkStatus();
      if (s.linked) onLinked();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [onLinked]);

  const manualRefresh = async () => {
    if (via === "occupied") {
      // simulate the user finishing on the Aideo side
      simulateOccupiedBindNow();
    }
    const s = await getLinkStatus();
    if (s.linked) onLinked();
    else toast.message(tr("waiting_link", locale));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl glass-card p-6 text-center animate-fade-in-up">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        <h3 className="text-lg font-semibold">{tr("waiting_link", locale)}</h3>
        <p className="mt-1 text-xs text-muted-foreground font-mono">{email}</p>
        <p className="mt-2 text-xs text-muted-foreground">~ {secondsLeft}s</p>

        {popupUrl && (
          <p className="mt-4 text-xs text-muted-foreground">
            {tr("popup_blocked", locale)}{" "}
            <a className="text-primary underline" href={popupUrl} target="_blank" rel="noopener noreferrer">
              {tr("open_link", locale)}
            </a>
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={manualRefresh}
            className="glass-btn rounded-xl px-4 py-2 text-sm font-semibold"
          >
            {tr("i_completed_link", locale)}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-border/70 px-4 py-2 text-sm text-muted-foreground transition hover:text-foreground"
          >
            {tr("cancel", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}
