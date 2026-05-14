# 调整方案：拆分两个独立页面 + 文案与圆角细节

## 1. 拆分为两个独立路由（去掉 Tab 切换）

新路由结构：

```
/studio-login    登录互通（独立页面）
/studio-credits  积分互通（独立页面）
```

- 删除 `/studio-bridge`（或仅保留为重定向到 `/studio-login`）。
- 旧 `/aideo` 的重定向目标改为 `/studio-credits`。
- 两个页面都用同一个深色壳（`ProfileHeader` + 标题），但不再渲染 Tab 切换栏。
- 在每个页面顶部右侧加一个**轻量的次级链接**（不是 Tab）："去积分互通 →" / "← 返回登录互通"，方便用户跨页面跳转，但视觉上明确是两个独立页面。
- `/studio-credits` 在未关联（`link.linked === false`）时仍然显示锁定卡片（"请先完成登录互通"），CTA 跳到 `/studio-login`。

### 文件改动
- 新增 `src/routes/studio-login.tsx`（从原 `studio-bridge.tsx` 抽出，只渲染 `LoginBridgePanel` + Ineligible 分支）。
- 新增 `src/routes/studio-credits.tsx`（只渲染 `CreditsBridgePanel` + Ineligible 分支）。
- 修改 `src/routes/studio-bridge.tsx` → 改为 `beforeLoad` 重定向到 `/studio-login`（保留 `?mock=` 透传），或直接删除并更新所有引用。
- 修改 `src/routes/aideo.tsx` 重定向目标 → `/studio-credits`。
- 修改 `src/components/profile/ProfileCard.tsx`：`登录到 Studio` 按钮 `to="/studio-login"`。
- 修改 `src/components/aideo/CreditsBridgePanel.tsx`：锁定卡 CTA `to="/studio-login"`。
- 修改 `src/routes/index.tsx`：入口卡按钮指向新路由（`/studio-login`、`/studio-credits?mock=linked`、`/studio-login?mock=occupied`、`/studio-login?mock=ineligible`）。

## 2. "汇率" → "比例"

`src/lib/aideo/i18n.ts`：
- `rate.zh`: "汇率" → "比例"
- `rate.en`: "Rate" → "Ratio"

`TransferConfirmDialog` 已经用 `tr("rate", locale)`，所以只改 i18n 即可。

## 3. 提交按钮圆角加大

把所有"提交/确认/转移"主按钮统一从 `rounded-xl` 改为 `rounded-full`，与页面其他胶囊按钮一致：

- `src/components/aideo/TransferPanel.tsx`：
  - "校验可用性" 按钮 `rounded-xl` → `rounded-full`
  - "转移" 按钮 `rounded-xl` → `rounded-full`
- `src/components/aideo/TransferConfirmDialog.tsx`：
  - "取消" `rounded-xl` → `rounded-full`
  - "确认转移" `rounded-xl` → `rounded-full`
- `src/components/aideo/LoginBridgePanel.tsx` 内 `PasswordModal` 已经是 `rounded-full`，无需改。

输入框（`rounded-xl`）保持不变，只调按钮。

## 4. 让"邮箱未占用"场景更显眼

当前默认 mock（无 `?mock=` 参数）就是 `unlinked`，点击 "关联并打开 Studio" 会触发 `needs_password` → 弹出密码模态。但用户没看到，可能因为：
- 入口（首页 + Profile 卡）没有显式的"未占用邮箱"演示链接；
- "关联并打开 Studio" 按钮的视觉提示不够明确（用户没意识到点击后就是这个场景）。

修复：
- `src/routes/index.tsx` 入口卡片中**新增一个明确的链接**："Login Bridge — 邮箱未占用（默认）" → `/studio-login?mock=unlinked`，与 `?mock=occupied`、`?mock=linked` 并排。
- `src/components/aideo/LoginBridgePanel.tsx` 在 `idle` 状态下，CTA 上方加一行小提示文案："首次关联会让你为同邮箱的 Studio 账号设置密码。"（i18n 新增 `link_hint_first_time`）。
- Profile 卡的 "登录到 Studio" 按钮维持 `to="/studio-login"`（不带 mock，使用默认 unlinked）。

i18n 新增：
- `link_hint_first_time.zh`: "首次关联会创建同邮箱的 Studio 账号，请先设置密码。"
- `link_hint_first_time.en`: "First-time linking creates a Studio account with this email — set a password to continue."
- 新增页面间跳转文案 `goto_credits_bridge` / `back_to_login_bridge`（zh: "去积分互通 →" / "← 返回登录互通"）。
- 删除不再使用的 `tab_login_bridge` / `tab_credits_bridge`（可保留，无害）。

## 5. 验收

1. 首页能看到 4 个独立入口：Profile / Login Bridge / Credits Bridge (linked) / Login Bridge (occupied) / Login Bridge (ineligible)。
2. `/studio-login`（默认）→ 显示"未关联"卡 + 提示"首次关联会创建账号"，点 CTA → 弹出"设置 Studio 密码"模态。
3. `/studio-login?mock=occupied` → 直接打开 Studio 鉴权窗 + inline 等待卡。
4. `/studio-login?mock=linked` → 显示"打开 Studio"按钮。
5. `/studio-credits` 未关联 → 显示锁定卡，CTA 跳 `/studio-login`；`?mock=linked` → 显示余额 + 转账面板。
6. 转账确认弹窗中"汇率"显示为"比例"。
7. 所有按钮（校验/转移/确认/取消）都是 `rounded-full`，视觉统一。
8. 旧 `/aideo` 与 `/studio-bridge` 链接自动跳到新路由。
