import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/drug-memory")({
  beforeLoad: () => {
    throw redirect({ to: "/memory", replace: true });
  },
});
