import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { lookupTerm } from "@/lib/glossary";
import { cn } from "@/lib/utils";

/**
 * Small "ⓘ" helper that explains a medical term in simple English, medical
 * wording, Hinglish and Hindi.
 * Usage: <MedicalTermHelp term="Contraindications" /> or with custom label text.
 */
export function MedicalTermHelp({
  term,
  label,
  className,
}: {
  term: string;
  label?: string;
  className?: string;
}) {
  const entry = lookupTerm(term);
  if (!entry) return null;
  const shown = label ?? entry.term;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`What is ${shown}?`}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            className,
          )}
        >
          <Info className="size-3.5" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="max-h-80 w-80 space-y-2 overflow-y-auto text-sm">
        <div>
          <p className="font-display font-semibold">What is {entry.term}?</p>
          {entry.pronunciation && (
            <p className="text-xs text-muted-foreground">Say it: {entry.pronunciation}</p>
          )}
        </div>
        <p className="text-muted-foreground">{entry.simple}</p>
        {entry.medical && (
          <p className="rounded-md border border-border/60 p-2 text-xs">
            <span className="font-medium">Medical definition: </span>
            {entry.medical}
          </p>
        )}
        <p className="rounded-md bg-muted p-2 text-xs text-foreground">{entry.hinglish}</p>
        {entry.hindi && (
          <p className="rounded-md bg-muted p-2 text-xs text-foreground">{entry.hindi}</p>
        )}
        {entry.examples && entry.examples.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Examples: </span>
            {entry.examples.join(", ")}
          </p>
        )}
        {entry.related && entry.related.length > 0 && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Related: </span>
            {entry.related.join(" • ")}
          </p>
        )}
      </PopoverContent>
    </Popover>
  );
}

/** Heading text with an inline term explainer. */
export function TermLabel({
  term,
  label,
  className,
}: {
  term: string;
  label?: string | undefined;
  className?: string | undefined;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {label ?? term}
      <MedicalTermHelp term={term} {...(label ? { label } : {})} />
    </span>
  );
}
