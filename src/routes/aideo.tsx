import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/aideo")({
  beforeLoad: ({ search }) => {
    throw redirect({
      to: "/studio-bridge",
      search: { tab: "credits", ...(search as Record<string, unknown>) },
    });
  },
  component: () => null,
});
