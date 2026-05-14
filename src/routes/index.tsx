import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const linkBase =
    "rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-cyan-300 hover:text-cyan-300";
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="max-w-xl text-center px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">MovieFlow</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Studio Bridge Demo
        </h1>
        <p className="mt-3 text-sm text-white/60">
          打开个人主页查看 Studio 登录入口，或直接进入登录互通 / 积分互通页面。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/profile"
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200"
          >
            MovieFlow Profile
          </Link>
          <Link to="/studio-login" className={linkBase}>
            登录互通 · 邮箱未占用
          </Link>
          <Link to="/studio-login" search={{ mock: "occupied" }} className={linkBase}>
            登录互通 · 邮箱已占用
          </Link>
          <Link to="/studio-login" search={{ mock: "linked" }} className={linkBase}>
            登录互通 · 已关联
          </Link>
          <Link to="/studio-credits" search={{ mock: "linked" }} className={linkBase}>
            积分互通（已关联）
          </Link>
          <Link to="/studio-login" search={{ mock: "ineligible" }} className={linkBase}>
            订阅不达标
          </Link>
        </div>
      </div>
    </div>
  );
}
