import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Loader2, ExternalLink, Mail, ArrowRight } from "lucide-react";
import {
  getLinkStatus,
  handoffCreate,
  linkCreateAccount,
  linkStart,
  simulateOccupiedBindNow,
} from "@/lib/aideo/mock-api";
import type { Eligibility, LinkStatus, Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";
import { errorMessage } from "@/lib/aideo/error-messages";

type Stage =
  | { kind: "idle" }
  | { kind: "needs_password"; email: string }
  | { kind: "waiting_create"; email: string }
  | { kind: "waiting_occupied"; email: string; popupUrl?: string }
  | { kind: "linked" };

export function LoginBridgePanel({
  locale,
  eligibility,
  link,
  onChanged,
}: {
  locale: Locale;
  eligibility: Eligibility;
  link: LinkStatus;
  onChanged: () => void;
}) {
  const [stage, setStage] = useState<Stage>(link.linked ? { kind: "linked" } : { kind: "idle" });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (link.linked) setStage({ kind: "linked" });
  }, [link.linked]);

  const openStudio = async () => {
    setBusy(true);
    try {
      const { handoff_url } = await handoffCreate("/zh/home");
      const w = window.open(handoff_url, "_blank", "noopener,noreferrer");
      if (!w) toast.message(tr("popup_blocked", locale));
    } finally {
      setBusy(false);
    }
  };

  const start = async () => {
    setBusy(true);
    try {
      const r = await linkStart();
      if (r.kind === "needs_password") {
        setStage({ kind: "needs_password", email: r.movieflow_email });
      } else if (r.kind === "requires_aideo_auth") {
        const w = window.open(r.aideo_auth_url, "_blank", "noopener,noreferrer");
        setStage({
          kind: "waiting_occupied",
          email: r.movieflow_email,
          popupUrl: w ? undefined : r.aideo_auth_url,
        });
      } else {
        setStage({ kind: "linked" });
        onChanged();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl glass-card p-6 sm:p-8 animate-fade-in-up">
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-0.5 text-[11px] uppercase tracking-wider text-white/70">
          {stage.kind === "linked" ? tr("linked", locale) : tr("unlinked", locale)}
        </span>
        {stage.kind === "linked" && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {link.aideo_email ?? eligibility.movieflow_email}
          </span>
        )}
      </div>

      <div className="mt-5 grid gap-1">
        <span className="text-[11px] uppercase tracking-wider text-white/50">
          {tr("movieflow_email", locale)}
        </span>
        <span className="font-mono text-sm text-white inline-flex items-center gap-2">
          <Mail className="h-3.5 w-3.5 text-white/60" />
          {eligibility.movieflow_email}
        </span>
      </div>

      {/* Idle / linked CTA */}
      {stage.kind === "idle" && (
        <p className="mt-5 text-xs text-white/55">{tr("link_hint_first_time", locale)}</p>
      )}
      {stage.kind === "idle" && (
        <button
          onClick={start}
          disabled={busy}
          className="glass-btn mt-3 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
          {tr("link_and_open", locale)}
        </button>
      )}

      {stage.kind === "linked" && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={openStudio}
            disabled={busy}
            className="glass-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            {tr("open_aideo", locale)}
          </button>
          <button
            disabled
            className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/40"
          >
            {tr("unlink_soon", locale)}
          </button>
        </div>
      )}

      {stage.kind === "needs_password" && (
        <PasswordModal
          locale={locale}
          email={stage.email}
          onClose={() => setStage({ kind: "idle" })}
          onSubmitted={() => setStage({ kind: "waiting_create", email: stage.email })}
        />
      )}

      {(stage.kind === "waiting_create" || stage.kind === "waiting_occupied") && (
        <WaitingInline
          locale={locale}
          via={stage.kind === "waiting_create" ? "create" : "occupied"}
          email={stage.email}
          popupUrl={stage.kind === "waiting_occupied" ? stage.popupUrl : undefined}
          onLinked={async () => {
            setStage({ kind: "linked" });
            onChanged();
            // auto handoff
            const { handoff_url } = await handoffCreate("/zh/home");
            window.open(handoff_url, "_blank", "noopener,noreferrer");
          }}
          onCancel={() => setStage({ kind: "idle" })}
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
    if (pw.length < 8) return toast.error(tr("password_too_short", locale));
    if (pw !== pw2) return toast.error(tr("passwords_mismatch", locale));
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
        className="w-full max-w-md rounded-2xl modal-surface p-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{tr("set_aideo_password", locale)}</h3>
        <p className="mt-1 text-xs text-white/55 font-mono">{email}</p>
        <div className="mt-5 grid gap-3">
          <Field label={tr("password", locale)} type="password" value={pw} onChange={setPw} autoFocus />
          <Field label={tr("confirm_password", locale)} type="password" value={pw2} onChange={setPw2} />
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/70 transition hover:text-white"
          >
            {tr("cancel", locale)}
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="glass-btn rounded-full px-6 py-2.5 text-sm font-semibold"
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
      <span className="text-[11px] uppercase tracking-wider text-white/55">{label}</span>
      <input
        autoFocus={autoFocus}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function WaitingInline({
  locale,
  via,
  email,
  popupUrl,
  onLinked,
  onCancel,
}: {
  locale: Locale;
  via: "create" | "occupied";
  email: string;
  popupUrl?: string;
  onLinked: () => void;
  onCancel: () => void;
}) {
  const [secondsLeft, setSecondsLeft] = useState(60);

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
    const timer = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => {
      stopped = true;
      clearInterval(tick);
      clearInterval(timer);
    };
  }, [onLinked]);

  useEffect(() => {
    const onFocus = async () => {
      const s = await getLinkStatus();
      if (s.linked) onLinked();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [onLinked]);

  const manual = async () => {
    if (via === "occupied") simulateOccupiedBindNow();
    const s = await getLinkStatus();
    if (s.linked) onLinked();
    else toast.message(tr("waiting_link", locale));
  };

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <div>
          <p className="text-sm text-white">
            {via === "occupied" ? tr("waiting_for_studio_auth", locale) : tr("waiting_link", locale)}
          </p>
          <p className="mt-0.5 text-xs text-white/55 font-mono">
            {email} · ~{secondsLeft}s
          </p>
        </div>
      </div>

      {popupUrl && (
        <p className="mt-4 text-xs text-white/60">
          {tr("popup_blocked", locale)}{" "}
          <a className="text-primary underline" href={popupUrl} target="_blank" rel="noopener noreferrer">
            {tr("open_link", locale)}
          </a>
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button onClick={manual} className="glass-btn rounded-full px-4 py-2 text-sm font-semibold">
          {tr("i_completed_link", locale)}
        </button>
        <button
          onClick={onCancel}
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white transition"
        >
          {tr("cancel", locale)}
        </button>
      </div>
    </div>
  );
}
