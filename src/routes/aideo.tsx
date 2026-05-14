import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/aideo")({
  beforeLoad: ({ search }) => {
    const s = search as Record<string, unknown>;
    const mock = typeof s.mock === "string" ? { mock: s.mock } : {};
    throw redirect({ to: "/studio-credits", search: mock });
  },
  component: () => null,
});
