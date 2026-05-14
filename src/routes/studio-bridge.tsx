import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/studio-bridge")({
  beforeLoad: ({ search }) => {
    const s = search as Record<string, unknown>;
    const tab = s.tab === "credits" ? "credits" : "login";
    const mock = typeof s.mock === "string" ? { mock: s.mock } : {};
    throw redirect({
      to: tab === "credits" ? "/studio-credits" : "/studio-login",
      search: mock,
    });
  },
  component: () => null,
});
