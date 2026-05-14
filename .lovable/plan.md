# 方案：MovieFlow 个人主页 × Studio 登录/积分互通

## 目标

1. 高度还原参考截图，做一个 MovieFlow 个人主页（顶部导航 + 用户资料卡 + Shared/My Likes Tab + 空状态）。
2. 在该主页上加一个"登录到 Studio"入口按钮，点击后进入**登录互通页面**，按需求里两种场景跑完整交互。
3. 把 **登录互通** 和 **积分互通** 拆成两个独立页面，支持顶部 Tab 切换查看。

---

## 路由结构

```text
/profile                       MovieFlow 个人主页（新增，参考图还原）
/studio-bridge                 互通中心，两个 Tab：
  ├─ ?tab=login    登录互通（新增，包含两种场景完整交互）
  └─ ?tab=credits  积分互通（复用现有 /aideo 页面内容）
```

入口跳转：
- `/profile` 头像区右侧加 **"登录到 Studio"** 胶囊按钮 → `/studio-bridge?tab=login`
- 顶部导航 "Aideo 世界" → 同样跳 `/studio-bridge`
- 旧 `/aideo` 重定向到 `/studio-bridge?tab=credits`，保留 `?mock=` 状态参数

---

## 页面 1：`/profile` 个人主页（高度还原参考图）

布局（深黑底 #000，参考图风格）：

```text
┌────────────────────────────────────────────────────────────────────┐
│ [M]  首页  Aideo世界  工具箱  素材资产  频道  工作室    [Free Credit] │
│                              [✦ 75354 ▾] [🔔] [💬] [⋯] [充值积分]   │
│                                                       [🌐 ZH ▾] [👤]│
├────────────────────────────────────────────────────────────────────┤
│  ⭕         la                                                       │
│  L          Likes 0  |  Credit rewards 0  |  Fission cash $0.00     │
│             [→ 登录到 Studio] (新增按钮，cyan glow)                  │
├────────────────────────────────────────────────────────────────────┤
│  Shared    My Likes                                                  │
│  ─────                                                               │
│                                                                      │
│                       📁                                             │
│                  No posts yet~                                       │
└────────────────────────────────────────────────────────────────────┘
```

要点：
- Logo "M" 紫蓝渐变；头像描青色环（呼应 Studio 主色）
- 顶部右侧积分胶囊、充值积分按钮使用现有 `.glass-btn` 样式
- "登录到 Studio" 按钮：`.glass-btn` + 右箭头图标，hover 时青色发光加强
- Shared / My Likes 用下划线 Tab（active 下划线）
- 空状态居中蓝色文件夹 emoji + "No posts yet~"
- 顶部导航和资料卡数据用 mock 静态值

---

## 页面 2：`/studio-bridge` 互通中心

顶部新增切换 Tab（pill 样式，沿用 aideo-dark 主题）：

```text
┌─ Studio Bridge ─────────────────────────────┐
│  [ 登录互通 ]  [ 积分互通 ]                   │
└─────────────────────────────────────────────┘
```

- Tab 状态用 `?tab=login|credits` 同步到 URL
- 默认 `login`
- 切换不刷新，仅切换内部组件

### Tab A — 登录互通（新增）

主卡片：显示 MovieFlow 邮箱 + 关联状态 + 一个主 CTA "关联并打开 Studio"。

点击 CTA 后调用 `linkStart()`（已存在 mock），按返回分支驱动两套交互：

**场景一 · 邮箱未占用** (`needs_password`)
1. 弹出 **设置 Studio 密码** 模态（复用现有 `PasswordModal`，但文案改为"设置 Studio 密码 / 确认密码"）
2. 前端基础校验（≥8 位、两次一致），错误用 toast
3. 提交 → `linkCreateAccount(pw)` → 后端创建同邮箱账号 + 绑定
4. 进入 **绑定中** 状态卡（轮询 5s 内自动完成）
5. 绑定成功 → 自动调用 `handoffCreate(target_path)` → `window.open(handoff_url)` 新标签打开 Studio callback
6. 当前页切到"已关联"状态，显示"打开 Studio"按钮（后续点击直接走 handoff，不再要密码）

**场景二 · 邮箱已占用** (`requires_aideo_auth`)
1. 直接 `window.open(aideo_auth_url)` 新标签打开 Studio 鉴权页
2. 当前页显示 **等待 Studio 端完成鉴权** 卡片（轮询 + 窗口聚焦刷新 + "我已完成"按钮，复用 `WaitingOverlay` 思路但改成 inline 卡片更贴合页面，不用全屏遮罩）
3. Studio 端校验密码 + 绑定 → 轮询返回 `linked: true`
4. 同样自动 handoff 打开目标页

**已关联态**：
- 顶部绿色徽标 "已关联 · email"
- 主 CTA 改为 "打开 Studio"（→ handoffCreate → 新标签）
- 次按钮 "解除关联（即将上线）" 占位禁用

**Mock 联动**：复用 `?mock=ineligible|unlinked|occupied|linked`。

### Tab B — 积分互通（复用现有）

把现有 `/aideo` 页面里 `LinkStatusCard / BalanceCards / TransferPanel / TransferHistoryTable` 部分原样搬进来。`IneligibleView`、`LinkAccountFlow` 由 Tab A 负责，这里只在 `link.linked === true` 时渲染积分模块；未关联时显示一个引导卡："请先在『登录互通』完成关联" + 跳转按钮。

---

## 文件改动

新增：
- `src/routes/profile.tsx` — 个人主页（参考图还原）
- `src/components/profile/ProfileHeader.tsx` — 顶部导航（含 logo / 主导航 / 积分 / 充值 / 语言 / 头像）
- `src/components/profile/ProfileCard.tsx` — 头像 + 用户名 + 数据 + "登录到 Studio" 按钮
- `src/components/profile/EmptyPosts.tsx` — Shared / My Likes Tab + 空状态
- `src/routes/studio-bridge.tsx` — 互通中心壳，包含 Tab 切换
- `src/components/aideo/LoginBridgePanel.tsx` — Tab A 登录互通主面板（重组现有 `LinkAccountFlow` 流程，inline 化）
- `src/components/aideo/CreditsBridgePanel.tsx` — Tab B 积分互通（抽取自 `aideo.tsx`）

修改：
- `src/routes/aideo.tsx` → 改为重定向到 `/studio-bridge?tab=credits`（或直接删，更新 `index.tsx` 入口卡片）
- `src/routes/index.tsx` → 入口卡新增 "MovieFlow Profile (`/profile`)" 和 "Studio Bridge (`/studio-bridge`)"
- `src/lib/aideo/i18n.ts` → 新增个人主页 + Tab 切换文案（zh/en）
- `src/lib/aideo/mock-api.ts` → 新增 `getMockProfile()`（用户名 la、Likes/Credit rewards/Fission cash 数据）

不动：
- `mock-api.ts` 现有 `linkStart / linkCreateAccount / handoffCreate / getEligibility / getLinkStatus` 等接口
- `styles.css`（沿用现有 `.glass-btn` / `.glass-card` / `aideo-dark` 主题，必要时仅微调；本轮不改色板）

---

## 验证

1. `/profile` 视觉与参考图对照（顶部 nav 项、紫色 M logo、青色头像环、用户名"la"、三项数据、Shared/My Likes、文件夹空状态、间距）。
2. 点击 "登录到 Studio" → 进入 `/studio-bridge?tab=login`。
3. `?mock=unlinked` → 走场景一：密码模态 → 等待 → 自动 handoff 弹新标签。
4. `?mock=occupied` → 走场景二：直接弹 Studio 鉴权页 + inline 等待卡 + 手动刷新可触发完成。
5. `?mock=linked` → 直接显示"打开 Studio"按钮 + 切到积分 Tab 可看到余额/转账。
6. `?mock=ineligible` → 两个 Tab 都显示订阅不达标卡片。
7. Tab 切换 URL 同步、刷新保留状态。
8. `/aideo?mock=linked` 旧链接自动跳到 `/studio-bridge?tab=credits&mock=linked`。

