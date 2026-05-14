## 目标

1. 统一三处按钮样式（参考用户上传图：完整胶囊形 + 青色玻璃质感 + 更大圆角），并加大圆角
2. 修复"设置 Studio 密码"弹窗背景透明度过低导致文字穿透问题
3. 让"转移积分"和"充值积分"按钮一致使用统一样式

## 改动详情

### 1. `src/styles.css`
- 把 `.glass-btn` 的 `border-radius` 从 `0.875rem` 改为 `9999px`（完整胶囊），让所有使用 `.glass-btn` 的按钮天然就是大圆角胶囊形（与上传参考图一致）
- 新增 `.modal-surface` 工具类：`background: oklch(0.08 0 0 / 0.96)`（接近不透明黑底）+ `border: 1px solid rgba(255,255,255,0.14)` + 更强 `backdrop-filter: blur(20px)` + 阴影，用于弹窗主体替代半透明的 `.glass-card`

### 2. `src/components/profile/ProfileCard.tsx`
- "登录到 Studio" 按钮已用 `.glass-btn`，把 padding 从 `px-5 py-2.5` 改为 `px-6 py-3` 让形态更接近参考图（更厚实的胶囊）

### 3. `src/components/aideo/LoginBridgePanel.tsx`
- `PasswordModal` 内层 div：`glass-card` → `modal-surface`，确保不透明
- "提交" 按钮 padding 加大到 `px-6 py-2.5`（已是 `rounded-full + glass-btn`）
- 顶部 Idle CTA "关联并打开 Studio" 按钮 padding 同样统一为 `px-6 py-3`
- "打开 Studio" 按钮同步统一

### 4. `src/components/aideo/TransferPanel.tsx`
- "转移" 主按钮 padding 改为 `px-6 py-2.5`（已 `rounded-full + glass-btn`）
- 输入框圆角 `rounded-xl` → `rounded-2xl`，方向 Tabs 容器 `rounded-xl` → `rounded-2xl`，快捷比例小按钮 `rounded-xl` → `rounded-full`

### 5. `src/components/aideo/TransferConfirmDialog.tsx`
- 弹窗主体 `glass-card` → `modal-surface`（同样修复透明度）
- "确认转移" 按钮 padding 改为 `px-6 py-2.5`

### 6. `src/components/aideo/BalanceCards.tsx`（充值积分按钮所在）
- 检查后将"充值积分"按钮统一为 `.glass-btn rounded-full px-6 py-2.5`（如当前未使用统一样式则替换）

## 验收

- 三处按钮（Profile 登录到 Studio / 设置密码弹窗提交 / 转移积分 / 充值积分 / 确认转移）视觉一致：完整胶囊 + 青色玻璃光泽 + 充足内边距
- 设置密码弹窗不再透出底层文字
- 整体圆角更柔和美观