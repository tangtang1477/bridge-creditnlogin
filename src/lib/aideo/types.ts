export type Locale = "zh" | "en";

export type EligibilityReason =
  | "ok"
  | "not_logged_in"
  | "subscription_inactive"
  | "plan_kickoff"
  | "plan_missing";

export interface Eligibility {
  eligible: boolean;
  reason: EligibilityReason;
  movieflow_email: string;
  plan_name: string;
  subscription_status: string;
}

export interface LinkStatus {
  linked: boolean;
  aideo_email?: string;
  linked_at?: string; // ISO
  movieflow_transferable: number;
  aideo_transferable: number;
}

export type TransferDirection = "movieflow_to_aideo" | "aideo_to_movieflow";

export interface TransferRecord {
  transfer_id: string;
  direction: TransferDirection;
  amount_in: number;
  amount_out: number;
  rate: number;
  fee: number;
  status: "completed" | "failed" | "pending";
  created_at: string;
  completed_at?: string;
  source_balance_after: number;
  target_balance_after: number;
  failure_reason?: string;
}

export interface ValidateResult {
  ok: boolean;
  rate: number;
  fee: number;
  amount_in: number;
  amount_out: number;
  source_transferable_balance: number;
  error_code?: AideoErrorCode;
}

export type AideoErrorCode =
  | "AIDEO_NOT_ELIGIBLE_SUBSCRIPTION"
  | "AIDEO_EMAIL_OCCUPIED"
  | "AIDEO_PASSWORD_INVALID"
  | "AIDEO_ALREADY_LINKED"
  | "MOVIEFLOW_ALREADY_LINKED"
  | "AIDEO_ACCOUNT_LINKED_TO_OTHER"
  | "MOVIEFLOW_INSUFFICIENT_TRANSFERABLE_CREDITS"
  | "AIDEO_INSUFFICIENT_TRANSFERABLE_CREDITS"
  | "TRANSFER_AMOUNT_INVALID"
  | "TRANSFER_VALIDATE_FAILED"
  | "HANDOFF_EXPIRED"
  | "HANDOFF_USED"
  | "AIDEO_SERVICE_UNAVAILABLE";

export type LinkStartResult =
  | { kind: "needs_password"; movieflow_email: string }
  | { kind: "requires_aideo_auth"; aideo_auth_url: string; movieflow_email: string }
  | { kind: "already_linked" };

export interface HandoffResult {
  handoff_url: string;
  expires_at: string;
}
