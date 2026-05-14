import type { Locale } from "./types";

export const t = {
  brand: { zh: "MovieFlow × Studio", en: "MovieFlow × Studio" },
  page_title: { zh: "积分互通", en: "Credits Bridge" },
  page_sub: {
    zh: "把 MovieFlow 与 Studio 的个人积分按 1:1 互转。",
    en: "Transfer credits 1:1 between MovieFlow and your personal Studio account.",
  },
  link_account: { zh: "关联 Studio 账号", en: "Link Studio Account" },
  open_aideo: { zh: "打开 Studio", en: "Open Studio" },
  refresh: { zh: "刷新状态", en: "Refresh status" },
  linked: { zh: "已绑定", en: "Linked" },
  unlinked: { zh: "未绑定", en: "Not linked" },
  linked_at: { zh: "绑定时间", en: "Linked at" },
  movieflow_email: { zh: "MovieFlow 邮箱", en: "MovieFlow email" },
  aideo_email: { zh: "Studio 邮箱", en: "Studio email" },
  mf_balance: { zh: "MovieFlow 可转余额", en: "MovieFlow transferable" },
  aideo_balance: { zh: "Studio 个人可转余额", en: "Studio personal transferable" },
  transfer: { zh: "转移积分", en: "Transfer credits" },
  amount: { zh: "转移数量", en: "Amount" },
  rate: { zh: "汇率", en: "Rate" },
  fee: { zh: "手续费", en: "Fee" },
  source: { zh: "源账户", en: "From" },
  target: { zh: "目标账户", en: "To" },
  deduct: { zh: "扣减", en: "Deducted" },
  credit: { zh: "到账", en: "Credited" },
  check_availability: { zh: "校验可用性", en: "Check availability" },
  confirm_transfer: { zh: "确认转移", en: "Confirm transfer" },
  cancel: { zh: "取消", en: "Cancel" },
  history: { zh: "最近转移记录", en: "Recent transfers" },
  no_history: { zh: "暂无记录", en: "No transfers yet" },
  set_aideo_password: { zh: "设置 Studio 密码", en: "Set your Studio password" },
  password: { zh: "密码", en: "Password" },
  confirm_password: { zh: "确认密码", en: "Confirm password" },
  submit: { zh: "提交", en: "Submit" },
  waiting_link: { zh: "等待绑定完成…", en: "Waiting for link…" },
  i_completed_link: {
    zh: "我已完成绑定，刷新状态",
    en: "I have completed linking, refresh status",
  },
  popup_blocked: {
    zh: "浏览器拦截了新窗口，点击下方链接手动打开。",
    en: "Popup blocked. Click the link below to open manually.",
  },
  open_link: { zh: "手动打开", en: "Open link" },
  not_eligible_title: { zh: "暂不可用", en: "Not available" },
  not_eligible_sub_inactive: {
    zh: "你的订阅当前未激活，激活后即可使用。",
    en: "Your subscription is inactive. Reactivate to continue.",
  },
  not_eligible_sub_kickoff: {
    zh: "Studio 互通仅向 Pro 及以上方案开放，请升级套餐。",
    en: "Credits bridge is available on Pro and above. Please upgrade.",
  },
  not_eligible_sub_missing: {
    zh: "未检测到有效订阅，请先订阅 Pro 方案。",
    en: "No active plan detected. Please subscribe to Pro.",
  },
  not_logged_in: {
    zh: "请先登录 MovieFlow。",
    en: "Please sign in to MovieFlow first.",
  },
  upgrade: { zh: "升级到 Pro", en: "Upgrade to Pro" },
  direction_mf_to_aideo: { zh: "MovieFlow → Studio", en: "MovieFlow → Studio" },
  direction_aideo_to_mf: { zh: "Studio → MovieFlow", en: "Studio → MovieFlow" },
  status_completed: { zh: "成功", en: "Completed" },
  status_failed: { zh: "失败", en: "Failed" },
  status_pending: { zh: "处理中", en: "Pending" },
  prev: { zh: "上一页", en: "Prev" },
  next: { zh: "下一页", en: "Next" },
  page_indicator: { zh: "第 {n} 页 / 共 {total} 条", en: "Page {n} of {total}" },
  transfer_success: { zh: "转移成功", en: "Transfer successful" },
  passwords_mismatch: { zh: "两次密码不一致", en: "Passwords do not match" },
  password_too_short: { zh: "密码至少 8 位", en: "Password must be at least 8 chars" },
  amount_placeholder: { zh: "请输入正整数", en: "Enter a positive integer" },
  validating: { zh: "校验中…", en: "Validating…" },
  validation_ok: { zh: "可以转移", en: "Available" },
  ineligible_chip: { zh: "不可用", en: "Unavailable" },
  back_home: { zh: "返回首页", en: "Back home" },
} satisfies Record<string, { zh: string; en: string }>;

export type DictKey = keyof typeof t;
export function tr(key: DictKey, locale: Locale, vars?: Record<string, string | number>) {
  let s = t[key][locale];
  if (vars) {
    for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  }
  return s;
}
