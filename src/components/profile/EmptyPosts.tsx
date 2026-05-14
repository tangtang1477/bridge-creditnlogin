import { useState } from "react";
import type { Locale } from "@/lib/aideo/types";
import { tr } from "@/lib/aideo/i18n";

export function EmptyPosts({ locale }: { locale: Locale }) {
  const [tab, setTab] = useState<"shared" | "likes">("shared");

  const Tab = ({ k, label }: { k: typeof tab; label: string }) => (
    <button
      onClick={() => setTab(k)}
      className={`relative pb-3 text-sm transition ${
        tab === k ? "text-white font-medium" : "text-white/55 hover:text-white/80"
      }`}
    >
      {label}
      {tab === k && (
        <span className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-white" />
      )}
    </button>
  );

  return (
    <section className="mx-auto mt-10 w-full max-w-[1600px] px-6">
      <div className="flex items-center gap-7 border-b border-white/10">
        <Tab k="shared" label={tr("profile_shared", locale)} />
        <Tab k="likes" label={tr("profile_my_likes", locale)} />
      </div>

      <div className="flex flex-col items-center justify-center pt-32 pb-20">
        <div className="text-7xl mb-4 select-none" aria-hidden>
          📁
        </div>
        <p className="text-sm text-white/55">{tr("profile_no_posts", locale)}</p>
      </div>
    </section>
  );
}
