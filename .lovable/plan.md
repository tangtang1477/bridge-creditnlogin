## 调整内容

### 1. 按钮配色（Transfer / Open Aideo 等主按钮）
当前 `.glass-btn` 文字色为 `#001417`（近黑），在青色半透明背景上对比度低、看不清。

修改 `src/styles.css` 中 `.glass-btn`：
- 文字色改为纯白 `#ffffff`，加 `font-weight: 600` 和轻微 `text-shadow: 0 1px 2px rgba(0,0,0,0.4)` 提升清晰度
- 默认背景加深青色饱和度：`linear-gradient(180deg, rgba(113,240,246,0.55), rgba(69,196,246,0.35), rgba(113,240,246,0.40))`
- hover 状态再提亮一档，保持发光感
- 统一应用到所有使用 `.glass-btn` 的位置（Open Studio、Transfer、确认弹窗的确认按钮、链接账号流程中的主按钮）

### 2. 全量替换 "Aideo" → "Studio"
仅改文案，不改代码标识符（变量名、类型名、API key 名、URL path、`data-theme="aideo-dark"`、文件路径、mock 参数 `?mock=...` 等保持不变）。

涉及文件（仅修改用户可见字符串）：
- `src/lib/aideo/i18n.ts`：所有中英文案中的 "Aideo" → "Studio"（如 `aideo_balance` 的值 "Aideo 积分" → "Studio 积分"，"Open Aideo" → "Open Studio"，"关联 Aideo 账号" → "关联 Studio 账号" 等）
- `src/lib/aideo/error-messages.ts`：错误提示中的 "Aideo" → "Studio"
- `src/components/aideo/TransferPanel.tsx`：`sourceLabel`/`targetLabel` 中的字面量 `"Aideo"` → `"Studio"`
- `src/components/aideo/TransferConfirmDialog.tsx`：弹窗中的 `"Aideo"` 字面量 → `"Studio"`
- `src/components/aideo/LinkAccountFlow.tsx`：流程文案中的 "Aideo" → "Studio"
- `src/routes/aideo.tsx`：页面标题/副标题中可见的 "Aideo" → "Studio"
- `src/routes/index.tsx`：入口卡片标题/描述中可见的 "Aideo" → "Studio"

不修改：路由 `/aideo`、文件夹 `aideo/`、类型字段 `aideo_email` / `aideo_transferable` / `movieflow_to_aideo`、`data-theme="aideo-dark"`。

### 3. 增大圆角
当前 `--radius: 0.5rem`，按钮/输入框/卡片/Tab 大量使用 `rounded-md`（≈0.375rem），偏小。

调整：
- `[data-theme="aideo-dark"]` 作用域内：`--radius: 0.875rem`，使衍生的 `--radius-md`（calc(var(--radius)-2px) ≈ 0.75rem）和 `--radius-lg`（≈0.875rem）整体变大
- `.glass-btn` 默认 `border-radius: 0.875rem`（约 14px），适配新的视觉调性
- 主要触点（balance 卡片、glass-card、Transfer 面板、确认弹窗、Tab 容器、输入框、25%/50%/Max 小按钮、Refresh 按钮）由 `rounded-md` 升级为 `rounded-xl`（≈1rem）；小按钮（25%/Max 等）使用 `rounded-lg`（≈0.875rem）保持比例和谐
- Direction Tab 内部激活态由 `rounded` 升级为 `rounded-lg`
- TransferHistoryTable 的容器与分页按钮同步升级

仅在 `aideo-dark` 主题作用域内生效，不影响主站其它页面。

### 验证
- 视觉：刷新 `/aideo?mock=linked`，确认按钮文字清晰、所有 "Aideo" 文案变为 "Studio"、圆角更柔和统一
- 三态：检查 `?mock=ineligible|unlinked|linked|occupied` 四种状态下的文案一致性
- 构建通过
