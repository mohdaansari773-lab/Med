import { Link, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExplainButton } from "@/components/explain-button";
import { PronounceButtons } from "@/components/pronounce";
import { useFavorites } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";
import type { MedicineListItem } from "@/lib/queries";

export function MedicineCard({ m }: { m: MedicineListItem }) {
  const navigate = useNavigate();
  const { toggle, isFavorite } = useFavorites();
  const saved = isFavorite("medicine", m.slug);

  const open = () => void navigate({ to: "/medicines/$slug", params: { slug: m.slug } });

  function toggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle.mutate(
      { item_type: "medicine", item_id: m.slug, label: m.display_name },
      {
        onSuccess: (r) =>
          toast.success(r === "added" ? "Saved to favourites" : "Removed from favourites"),
        onError: () => toast.error("Sign in to save favourites."),
      },
    );
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`Open ${m.display_name}`}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      }}
      className="surface press-feedback flex cursor-pointer flex-col gap-3 p-4 transition-shadow hover:shadow-[var(--shadow-float)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{m.display_name}</h3>
          <p className="text-xs text-muted-foreground">
            {m.pronunciation_en ? `${m.pronunciation_en} • ` : ""}
            {m.salt ?? m.generic_name}
          </p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <PronounceButtons text={m.generic_name} compact />
        </div>
      </div>

      {m.category && (
        <div className="flex flex-wrap gap-1.5">
          <Badge variant="secondary">{m.category}</Badge>
          {m.key_suffix && <Badge variant="outline">{m.key_suffix}</Badge>}
        </div>
      )}

      <p className="line-clamp-2 text-sm text-muted-foreground">{m.description}</p>

      {/* Actions stop propagation so they never open the detail page. */}
      <div
        className="mt-auto flex flex-wrap items-center gap-2 pt-1"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <ExplainButton topic={m.display_name} context={m.description ?? ""} />
        <Button
          variant="ghost"
          size="icon"
          aria-label={
            saved
              ? `Remove ${m.display_name} from favourites`
              : `Add ${m.display_name} to favourites`
          }
          aria-pressed={saved}
          onClick={toggleFavorite}
        >
          <Star
            className={cn(
              "size-4 transition-transform",
              saved && "fill-current text-primary animate-pop",
            )}
          />
        </Button>
        <Link
          to="/medicines/$slug"
          params={{ slug: m.slug }}
          className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-primary"
        >
          Open profile
        </Link>
      </div>
    </article>
  );
}
