import type { AideoErrorCode, Locale } from "./types";

const MAP: Record<AideoErrorCode, { zh: string; en: string }> = {
  AIDEO_NOT_ELIGIBLE_SUBSCRIPTION: {
    zh: "当前订阅不满足开通 Studio 的条件，请升级到 Pro 及以上方案。",
    en: "Your current subscription is not eligible. Upgrade to Pro or above.",
  },
  AIDEO_EMAIL_OCCUPIED: {
    zh: "该邮箱已注册 Studio 账号，请使用 Studio 密码完成验证。",
    en: "This email already has a Studio account. Verify with your Studio password.",
  },
  AIDEO_PASSWORD_INVALID: {
    zh: "Studio 密码不正确，请重试。",
    en: "Incorrect Studio password.",
  },
  AIDEO_ALREADY_LINKED: {
    zh: "该 Studio 账号已绑定其他 MovieFlow 用户。",
    en: "This Studio account is already linked to another MovieFlow user.",
  },
  MOVIEFLOW_ALREADY_LINKED: {
    zh: "当前 MovieFlow 账号已绑定 Studio。",
    en: "This MovieFlow account is already linked to a Studio account.",
  },
  AIDEO_ACCOUNT_LINKED_TO_OTHER: {
    zh: "该 Studio 账号已被其他用户占用。",
    en: "This Studio account is linked to another user.",
  },
  MOVIEFLOW_INSUFFICIENT_TRANSFERABLE_CREDITS: {
    zh: "MovieFlow 可转余额不足。",
    en: "Insufficient MovieFlow transferable credits.",
  },
  AIDEO_INSUFFICIENT_TRANSFERABLE_CREDITS: {
    zh: "Studio 可转余额不足。",
    en: "Insufficient Studio transferable credits.",
  },
  TRANSFER_AMOUNT_INVALID: {
    zh: "转移数量无效，必须为正整数。",
    en: "Invalid transfer amount. Must be a positive integer.",
  },
  TRANSFER_VALIDATE_FAILED: {
    zh: "转移校验失败，请稍后重试。",
    en: "Transfer validation failed. Please try again.",
  },
  HANDOFF_EXPIRED: {
    zh: "登录令牌已过期，请重新发起跳转。",
    en: "Handoff link expired. Please retry.",
  },
  HANDOFF_USED: {
    zh: "登录令牌已被使用，请重新发起跳转。",
    en: "Handoff link already used. Please retry.",
  },
  AIDEO_SERVICE_UNAVAILABLE: {
    zh: "Studio 服务暂不可用，请稍后重试。",
    en: "Studio service is unavailable. Please try again later.",
  },
};

export function errorMessage(code: AideoErrorCode | undefined, locale: Locale): string {
  if (!code) return locale === "zh" ? "未知错误" : "Unknown error";
  return MAP[code]?.[locale] ?? code;
}
