// In-memory mock for the MovieFlow x Aideo bridge.
// Replace these with real createServerFn calls when backend is ready.

import type {
  Eligibility,
  HandoffResult,
  LinkStartResult,
  LinkStatus,
  TransferDirection,
  TransferRecord,
  ValidateResult,
} from "./types";

type Mode = "default" | "ineligible" | "linked" | "occupied" | "unlinked";

interface Store {
  mode: Mode;
  movieflow_email: string;
  plan_name: string;
  subscription_status: string;
  linked: boolean;
  aideo_email?: string;
  linked_at?: string;
  mf_balance: number;
  aideo_balance: number;
  history: TransferRecord[];
  pending_link_email?: string; // emails being linked (waiting state)
}

const store: Store = {
  mode: "default",
  movieflow_email: "demo@movieflow.ai",
  plan_name: "Pro",
  subscription_status: "ACTIVE",
  linked: false,
  mf_balance: 12_500,
  aideo_balance: 3_200,
  history: [],
};

function rid(prefix = "tx") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function delay<T>(value: T, ms = 380): Promise<T> {
  return new Promise((res) => setTimeout(() => res(value), ms));
}

export function applyMockMode(mode: string | null) {
  switch (mode) {
    case "ineligible":
      store.mode = "ineligible";
      store.subscription_status = "ACTIVE";
      store.plan_name = "Kickoff";
      break;
    case "linked":
      store.mode = "linked";
      store.subscription_status = "ACTIVE";
      store.plan_name = "Pro";
      store.linked = true;
      store.aideo_email = store.movieflow_email;
      store.linked_at = new Date(Date.now() - 86_400_000 * 4).toISOString();
      if (store.history.length === 0) {
        store.history = seedHistory();
      }
      break;
    case "occupied":
      store.mode = "occupied";
      store.subscription_status = "ACTIVE";
      store.plan_name = "Pro";
      store.linked = false;
      break;
    case "unlinked":
    default:
      store.mode = "default";
      store.subscription_status = "ACTIVE";
      store.plan_name = "Pro";
      store.linked = false;
  }
}

function seedHistory(): TransferRecord[] {
  const now = Date.now();
  return [
    {
      transfer_id: rid(),
      direction: "movieflow_to_aideo",
      amount_in: 500,
      amount_out: 500,
      rate: 1,
      fee: 0,
      status: "completed",
      created_at: new Date(now - 3600_000).toISOString(),
      completed_at: new Date(now - 3599_000).toISOString(),
      source_balance_after: 12_000,
      target_balance_after: 3_700,
    },
    {
      transfer_id: rid(),
      direction: "aideo_to_movieflow",
      amount_in: 200,
      amount_out: 200,
      rate: 1,
      fee: 0,
      status: "completed",
      created_at: new Date(now - 86_400_000).toISOString(),
      completed_at: new Date(now - 86_400_000 + 1500).toISOString(),
      source_balance_after: 3_500,
      target_balance_after: 12_500,
    },
  ];
}

export async function getEligibility(): Promise<Eligibility> {
  const reason =
    store.subscription_status !== "ACTIVE"
      ? "subscription_inactive"
      : store.plan_name === "Kickoff"
        ? "plan_kickoff"
        : !store.plan_name
          ? "plan_missing"
          : "ok";
  return delay({
    eligible: reason === "ok",
    reason,
    movieflow_email: store.movieflow_email,
    plan_name: store.plan_name,
    subscription_status: store.subscription_status,
  });
}

export async function getLinkStatus(): Promise<LinkStatus> {
  return delay({
    linked: store.linked,
    aideo_email: store.aideo_email,
    linked_at: store.linked_at,
    movieflow_transferable: store.mf_balance,
    aideo_transferable: store.aideo_balance,
  });
}

export async function linkStart(): Promise<LinkStartResult> {
  if (store.linked) return delay({ kind: "already_linked" });
  if (store.mode === "occupied") {
    return delay({
      kind: "requires_aideo_auth",
      aideo_auth_url: `https://studio.movieflow.ai/zh/auth/movieflow-link?email=${encodeURIComponent(store.movieflow_email)}&mock=1`,
      movieflow_email: store.movieflow_email,
    });
  }
  return delay({ kind: "needs_password", movieflow_email: store.movieflow_email });
}

export async function linkCreateAccount(password: string): Promise<{ ok: true } | { ok: false; error_code: string }> {
  if (password.length < 8) {
    return delay({ ok: false, error_code: "AIDEO_PASSWORD_INVALID" });
  }
  // simulate account creation + binding (waiting state will resolve in ~5s)
  store.pending_link_email = store.movieflow_email;
  setTimeout(() => {
    store.linked = true;
    store.aideo_email = store.movieflow_email;
    store.linked_at = new Date().toISOString();
    store.pending_link_email = undefined;
  }, 5000);
  return delay({ ok: true });
}

// Used by the "I have completed linking" manual refresh flow when scenario B
export function simulateOccupiedBindNow() {
  store.linked = true;
  store.aideo_email = store.movieflow_email;
  store.linked_at = new Date().toISOString();
}

export async function handoffCreate(target_path = "/zh/home"): Promise<HandoffResult> {
  const code = rid("hof");
  const url = `https://studio.movieflow.ai/zh/auth/movieflow-callback?code=${code}&target=${encodeURIComponent(target_path)}`;
  return delay({ handoff_url: url, expires_at: new Date(Date.now() + 120_000).toISOString() });
}

export async function transferValidate(direction: TransferDirection, amount: number): Promise<ValidateResult> {
  const sourceBalance = direction === "movieflow_to_aideo" ? store.mf_balance : store.aideo_balance;
  if (!Number.isInteger(amount) || amount <= 0) {
    return delay({
      ok: false,
      rate: 1,
      fee: 0,
      amount_in: amount,
      amount_out: amount,
      source_transferable_balance: sourceBalance,
      error_code: "TRANSFER_AMOUNT_INVALID",
    });
  }
  if (amount > sourceBalance) {
    return delay({
      ok: false,
      rate: 1,
      fee: 0,
      amount_in: amount,
      amount_out: amount,
      source_transferable_balance: sourceBalance,
      error_code:
        direction === "movieflow_to_aideo"
          ? "MOVIEFLOW_INSUFFICIENT_TRANSFERABLE_CREDITS"
          : "AIDEO_INSUFFICIENT_TRANSFERABLE_CREDITS",
    });
  }
  return delay({
    ok: true,
    rate: 1,
    fee: 0,
    amount_in: amount,
    amount_out: amount,
    source_transferable_balance: sourceBalance,
  });
}

const usedKeys = new Set<string>();

export async function transferExecute(
  direction: TransferDirection,
  amount: number,
  idempotencyKey: string,
): Promise<{ ok: true; record: TransferRecord } | { ok: false; error_code: string }> {
  if (usedKeys.has(idempotencyKey)) {
    const existing = store.history.find((h) => h.transfer_id.endsWith(idempotencyKey.slice(-6)));
    if (existing) return { ok: true, record: existing };
  }
  const validate = await transferValidate(direction, amount);
  if (!validate.ok) {
    return delay({ ok: false, error_code: validate.error_code ?? "TRANSFER_VALIDATE_FAILED" });
  }
  usedKeys.add(idempotencyKey);
  if (direction === "movieflow_to_aideo") {
    store.mf_balance -= amount;
    store.aideo_balance += amount;
  } else {
    store.aideo_balance -= amount;
    store.mf_balance += amount;
  }
  const record: TransferRecord = {
    transfer_id: rid(),
    direction,
    amount_in: amount,
    amount_out: amount,
    rate: 1,
    fee: 0,
    status: "completed",
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    source_balance_after: direction === "movieflow_to_aideo" ? store.mf_balance : store.aideo_balance,
    target_balance_after: direction === "movieflow_to_aideo" ? store.aideo_balance : store.mf_balance,
  };
  store.history.unshift(record);
  return delay({ ok: true, record });
}

export async function transferHistory(page = 1, pageSize = 20): Promise<{
  items: TransferRecord[];
  total: number;
  page: number;
  page_size: number;
}> {
  const start = (page - 1) * pageSize;
  return delay({
    items: store.history.slice(start, start + pageSize),
    total: store.history.length,
    page,
    page_size: pageSize,
  });
}

export const TARGET_PATH_WHITELIST = ["/zh/home", "/en/home", "/zh/projects", "/en/projects"];
