## 目标

在当前 MovieFlow 项目里实现 `/aideo` 这个**前端交互页面**，完整覆盖账号绑定与积分互通的三态流程。本轮**只做前端 UI + 模拟数据状态机**（后端聚合接口、Aideo 服务、handoff、签名 JWT 都按需求文档预留 mock，不真实联网），方便后端就绪后直接替换调用层。

设计风格 1:1 参考 [Aideo Studio](/projects/8aaaf081-0540-4002-8518-21a105be9b19)：纯黑背景、青色高亮 `hsl(183 89% 69%)`、Apple liquid-glass 按钮、白描边卡片、圆角 0.5rem。

## 三态覆盖

页面顶层根据"绑定状态 + 资格"渲染不同视图：

1. **不符合资格**（未登录 / 非 Pro 订阅 / Kickoff 计划）
   - 灰态封面 + 原因说明 + 升级 CTA
2. **符合资格但未绑定**
   - 卡片：MovieFlow 邮箱 + "Link Aideo Account" 主按钮
   - 点击 → 调 mock `link/start`，分支：
     - **场景 A（邮箱未占用）**：弹出"设置 Aideo 密码"双输入框 → 提交 → mock 创建账号+绑定 → 进入 *Waiting for link* 浮层（60s × 3s 轮询 + 手动刷新按钮）→ 模拟成功后切到已绑定态
     - **场景 B（邮箱已占用）**：返回 `requires_aideo_auth` → 新标签页打开 Aideo 鉴权 URL（mock）+ Waiting 浮层
3. **已绑定**
   - 顶部状态卡：Aideo 邮箱、绑定时间、刷新按钮、Open Aideo 按钮（场景 C handoff，新标签 + 拦截兜底链接）
   - 余额区：MF 可转 / Aideo 个人可转，两张玻璃卡
   - 双向积分转移面板（核心交互）
   - 最近转移记录表（默认 20 条 + 分页）

## 转移面板交互

- 方向切换 Tab：`MF → Aideo` / `Aideo → MF`，箭头动画
- 数量输入：仅正整数；25% / 50% / Max 快捷
- debounce 600ms → mock `validate`（返回 ok / 余额不足 / 资格失效）
- "Check availability" 手动校验按钮
- "Transfer" → 二次确认 Dialog：方向 / 源 / 目标 / 扣减 / 到账 / rate 1:1 / fee 0
- 确认 → mock `execute`（带 idempotency key，防重复点击 loading 锁），成功后：
  - Toast 成功 + 更新两侧余额 + 在记录表头部插入新行
  - 失败按错误码映射中英文文案

## 文件结构

```
src/
  routes/
    aideo.tsx                          # /aideo 主页面
  components/aideo/
    EligibilityGate.tsx                # 三态根分发
    LinkStatusCard.tsx                 # 绑定状态/Open Aideo
    LinkAccountFlow.tsx                # 场景A密码 / 场景B跳转 / Waiting
    BalanceCards.tsx                   # 两张余额玻璃卡
    TransferPanel.tsx                  # 方向 + 输入 + 校验 + Transfer
    TransferConfirmDialog.tsx
    TransferHistoryTable.tsx
    WaitingForLinkOverlay.tsx
  lib/aideo/
    mock-api.ts                        # 模拟所有 /api/aideo/* 接口 + 状态机
    types.ts                           # 错误码枚举、DTO
    error-messages.ts                  # 错误码 → zh/en 文案
    use-aideo.ts                       # React Query hooks 封装
  styles.css                           # 新增 cyan 主题 token + glass-btn 工具类
```

`mock-api.ts` 用模块级 in-memory store 模拟绑定状态、余额、流水；通过 URL `?mock=eligible|unlinked|linked|occupied` 一键切换初始态，方便演示三态。

## 设计 token（写入 `src/styles.css`）

新增浅层主题切换：在 `/aideo` 路由加 `data-theme="aideo-dark"` 包裹，作用域内覆盖：

- `--background: oklch(0 0 0)`（纯黑）
- `--foreground: oklch(1 0 0)`
- `--primary: oklch(0.85 0.12 195)` ≈ Aideo 青
- `--card: oklch(0.04 0 0)` + 白色 12% 描边
- 复刻 `.glass-btn-v2`（液态玻璃）、`@keyframes glowPulse / fadeIn`
- 卡片圆角 0.5rem，字体 Arial

## 国际化与文案

第一版文案直接 hardcoded zh + en 两份对象，由顶部 locale 切换（默认 zh），不引入 next-intl 依赖。错误码统一通过 `error-messages.ts` 映射。

## 安全 / 后端契约（仅前端预留）

- 所有 fetch 集中在 `lib/aideo/mock-api.ts`，签名与 RPC 相关字段（`idempotency_key`、`handoff_code`、`target_path` 白名单）在客户端按文档生成/校验，便于后端联调时一次性替换为真实 `createServerFn`
- `Open Aideo` 跳转使用 `window.open(url, "_blank", "noopener,noreferrer")`，被拦截时显示可点击兜底链接
- `target_path` 仅允许白名单 `/zh/home`、`/en/home` 等

## 路由与入口

- 新建 `src/routes/aideo.tsx`，配 `head()`（title/description/og）
- 在 `src/routes/__root.tsx` 顶部导航追加 `/aideo` 链接（同时保持现有占位首页不动）

## 不做（与需求一致）

- 不做后端服务（聚合接口、Aideo 服务、handoff JWT、Service HMAC 全部 mock）
- 不做用户解绑 / 换绑 / 撤销转账
- 不做灰度开关
- 不做 admin UI

## 演示路径

构建完成后：
- `/aideo` → 默认未绑定态
- `/aideo?mock=ineligible` → 不符合资格态
- `/aideo?mock=linked` → 已绑定态（可玩转移面板 + 历史）
- `/aideo?mock=occupied` → 触发场景 B 鉴权跳转
