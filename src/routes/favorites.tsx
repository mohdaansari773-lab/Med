import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/use-user-data";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/favorites")({
  head: () => ({
    meta: [
      { title: "Favorites — MediVault India" },
      { name: "description", content: "Your saved medicines, drug classes and medical terms." },
      { property: "og:title", content: "Favorites — MediVault India" },
      { property: "og:description", content: "Your saved pharmacology reference items." },
    ],
  }),
  component: FavoritesPage,
});

function FavoritesPage() {
  const { user } = useAuth();
  const { favorites, isLoading } = useFavorites();

  if (!user)
    return (
      <div className="surface mx-auto max-w-md p-8 text-center">
        <h1 className="font-display text-xl font-semibold">Sign in to save favourites</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Favourites, learning progress and review schedules are stored with your account.
        </p>
        <Button asChild className="mt-4">
          <Link to="/auth">Sign in</Link>
        </Button>
      </div>
    );

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold">Favorites</h1>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : favorites.length === 0 ? (
        <p className="surface p-6 text-center text-sm text-muted-foreground">
          Nothing saved yet. Tap the star on any medicine.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {favorites.map((f) => (
            <li key={f.id} className="surface flex items-center justify-between gap-2 p-3">
              <div>
                <p className="font-medium">{f.label ?? f.item_id}</p>
                <Badge variant="outline" className="mt-1 capitalize">
                  {f.item_type}
                </Badge>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link
                  to={f.item_type === "class" ? "/classes/$slug" : "/medicines/$slug"}
                  params={{ slug: f.item_id }}
                >
                  Open
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
