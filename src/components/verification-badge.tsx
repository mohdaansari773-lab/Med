import { Badge } from "@/components/ui/badge";

const LABELS: Record<string, string> = {
  verified: "Verified",
  under_review: "Not yet verified",
  draft: "Draft",
  needs_update: "Needs update",
  archived: "Archived",
};

/**
 * Verification is factual only: anything that is not fully sourced reads as
 * "Not yet verified". It never implies a brand or company is better or safer.
 */
export function VerificationBadge({
  status,
  className,
}: {
  status: string | null | undefined;
  className?: string;
}) {
  const s = status ?? "under_review";
  return (
    <Badge variant={s === "verified" ? "default" : "outline"} className={className}>
      {LABELS[s] ?? "Not yet verified"}
    </Badge>
  );
}
