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
          Credits bridge demo
        </h1>
        <p className="mt-3 text-sm text-white/60">
          Open the <code>/aideo</code> page to try the full three-state experience.
          Add <code>?mock=linked</code>, <code>?mock=occupied</code>, or <code>?mock=ineligible</code> to switch states.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/aideo"
            className="rounded-xl bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-200"
          >
            Open Studio
          </Link>
          <a
            href="/aideo?mock=linked"
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Linked state
          </a>
          <a
            href="/aideo?mock=occupied"
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Occupied email
          </a>
          <a
            href="/aideo?mock=ineligible"
            className="rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-cyan-300 hover:text-cyan-300"
          >
            Ineligible
          </a>
        </div>
      </div>
    </div>
  );
}
