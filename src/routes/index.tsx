import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="max-w-xl text-center px-6">
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">MovieFlow</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Studio Bridge Demo
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Open the profile page to see the Studio sign-in entry, or jump straight into the bridge.
          Add <code>?mock=linked</code>, <code>?mock=occupied</code>, or <code>?mock=ineligible</code> to switch states.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/profile"
            className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200"
          >
            MovieFlow Profile
          </Link>
          <Link
            to="/studio-bridge"
            search={{ tab: "login" }}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Login Bridge
          </Link>
          <Link
            to="/studio-bridge"
            search={{ tab: "credits", mock: "linked" }}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Credits Bridge (linked)
          </Link>
          <Link
            to="/studio-bridge"
            search={{ tab: "login", mock: "occupied" }}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Occupied email
          </Link>
          <Link
            to="/studio-bridge"
            search={{ tab: "login", mock: "ineligible" }}
            className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Ineligible
          </Link>
        </div>
      </div>
    </div>
  );
}
