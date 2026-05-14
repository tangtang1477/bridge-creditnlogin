import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import type { Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";

export function ProfileCard({ locale }: { locale: Locale }) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-6 pt-6">
      <div className="flex items-start gap-7">
        {/* Avatar with cyan ring */}
        <div
          className="grid h-[120px] w-[120px] place-items-center rounded-full text-3xl font-medium text-white/85"
          style={{
            background: "#1a1a1a",
            boxShadow:
              "0 0 0 2px #000, 0 0 0 4px rgba(113,240,246,0.85), 0 0 24px rgba(113,240,246,0.35)",
          }}
        >
          L
        </div>

        <div className="flex flex-1 flex-col gap-3 pt-1">
          <h1 className="text-2xl font-medium tracking-tight text-white">la</h1>
          <div className="flex items-center gap-3 text-sm text-white/70">
            <span>
              {tr("profile_likes", locale)} <span className="text-white">0</span>
            </span>
            <span className="text-white/20">|</span>
            <span>
              {tr("profile_credit_rewards", locale)}{" "}
              <span className="text-white">0</span>
            </span>
            <span className="text-white/20">|</span>
            <span>
              {tr("profile_fission_cash", locale)}{" "}
              <span className="text-white">$0.00</span>
            </span>
          </div>
          <div className="mt-2">
            <Link
              to="/studio-login"
              className="glass-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
            >
              {tr("login_to_studio", locale)}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
