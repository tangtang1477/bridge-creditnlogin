import { Link } from "@tanstack/react-router";
import { Bell, MessageSquare, MoreHorizontal, Globe, Gift, Sparkles, ChevronDown, User } from "lucide-react";
import type { Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";

const NAV = [
  { key: "nav_home" as const, to: "/" },
  { key: "nav_studio_world" as const, to: "/studio-bridge" },
  { key: "nav_toolbox" as const, to: "/" },
  { key: "nav_assets" as const, to: "/" },
  { key: "nav_channel" as const, to: "/" },
  { key: "nav_workspace" as const, to: "/" },
];

export function ProfileHeader({
  locale,
  setLocale,
  active = "nav_home",
}: {
  locale: Locale;
  setLocale: (l: Locale) => void;
  active?: (typeof NAV)[number]["key"];
}) {
  return (
    <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-6 px-6">
        {/* Logo */}
        <Link to="/profile" className="flex items-center">
          <span
            className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-black text-white"
            style={{
              background:
                "linear-gradient(135deg, #6a3df0 0%, #3a6df0 50%, #6f3df0 100%)",
              boxShadow: "0 0 16px rgba(106,61,240,0.45)",
            }}
          >
            M
          </span>
        </Link>

        {/* Main nav */}
        <nav className="flex items-center gap-7 text-sm">
          {NAV.map((n) => (
            <Link
              key={n.key}
              to={n.to}
              className={
                active === n.key
                  ? "text-white font-medium"
                  : "text-white/70 hover:text-white transition"
              }
            >
              {tr(n.key, locale)}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Right cluster */}
        <button className="flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/[0.1] transition">
          <Gift className="h-4 w-4 text-white/80" />
          <span>{tr("free_credit", locale)}</span>
        </button>

        <button className="flex items-center gap-1.5 rounded-full bg-white/[0.06] border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/[0.1] transition">
          <Sparkles className="h-4 w-4 text-cyan-300" />
          <span className="font-mono">75354</span>
          <ChevronDown className="h-3.5 w-3.5 text-white/60" />
        </button>

        <button className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.08] transition">
          <Bell className="h-[18px] w-[18px] text-white/85" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-cyan-300" />
        </button>
        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.08] transition">
          <MessageSquare className="h-[18px] w-[18px] text-white/85" />
        </button>
        <button
          className="grid h-9 w-9 place-items-center rounded-full transition"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(113,240,246,0.55), rgba(0,0,0,0.6))",
            boxShadow: "0 0 14px rgba(113,240,246,0.35)",
          }}
        >
          <MoreHorizontal className="h-[18px] w-[18px] text-white" />
        </button>

        <button className="glass-btn rounded-full px-4 py-2 text-sm font-semibold">
          {tr("recharge_credits", locale)}
        </button>

        <button
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-sm text-white/85 hover:bg-white/[0.08] transition"
        >
          <Globe className="h-4 w-4" />
          <span>{locale.toUpperCase()}</span>
          <ChevronDown className="h-3.5 w-3.5 text-white/60" />
        </button>

        <button className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/[0.08] transition">
          <User className="h-[18px] w-[18px] text-white/85" />
        </button>
      </div>
    </header>
  );
}
