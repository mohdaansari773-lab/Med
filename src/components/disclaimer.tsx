import { ShieldAlert } from "lucide-react";
import { DISCLAIMER } from "@/lib/constants";

export function Disclaimer({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={`flex gap-3 rounded-xl border border-warning/40 bg-warning/10 text-warning-foreground ${
        compact ? "p-3 text-xs" : "p-4 text-sm"
      }`}
    >
      <ShieldAlert className="size-5 shrink-0" aria-hidden />
      <p className="leading-relaxed">{DISCLAIMER}</p>
    </div>
  );
}
