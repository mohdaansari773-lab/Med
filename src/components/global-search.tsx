import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchQuery } from "@/lib/queries";

const RECENT_KEY = "medivault.recent-searches";
const POPULAR = ["Paracetamol", "Crocin", "Losartan", "Metformin", "Analgesic", "PPI"];

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

export function GlobalSearch({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [term, setTerm] = useState("");
  const debounced = useDebounced(term);
  const navigate = useNavigate();
  const [recent, setRecent] = useState<string[]>([]);
  const { data, isFetching } = useQuery(searchQuery(debounced));

  useEffect(() => {
    try {
      setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]") as string[]);
    } catch {
      setRecent([]);
    }
  }, [open]);

  function go(href: string, label: string) {
    const next = [label, ...recent.filter((r) => r !== label)].slice(0, 6);
    setRecent(next);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    onOpenChange(false);
    setTerm("");
    void navigate({ to: href });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-h-[76vh] translate-y-0 gap-3 overflow-hidden p-0 sm:max-w-2xl">
        <DialogTitle className="sr-only">Search MediVault India</DialogTitle>
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search medicine, generic, brand, salt or medical term..."
            className="border-0 shadow-none focus-visible:ring-0"
          />
          {isFetching && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="max-h-[54vh] overflow-y-auto px-2 pb-4">
          {debounced.trim().length < 2 ? (
            <div className="space-y-4 p-3">
              {recent.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Recent searches</p>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <Button key={r} variant="outline" size="sm" onClick={() => setTerm(r)}>
                        {r}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">Popular searches</p>
                <div className="flex flex-wrap gap-2">
                  {POPULAR.map((p) => (
                    <Button key={p} variant="secondary" size="sm" onClick={() => setTerm(p)}>
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (data?.length ?? 0) === 0 && !isFetching ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No match found in the starter database. Try a generic name such as “Paracetamol”.
            </p>
          ) : (
            <ul className="space-y-1">
              {(data ?? []).map((r) => (
                <li key={`${r.kind}-${r.title}-${r.href}`}>
                  <button
                    onClick={() => go(r.href, r.title)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <Badge variant="outline" className="mt-0.5 shrink-0 capitalize">
                      {r.kind}
                    </Badge>
                    <span className="min-w-0">
                      <span className="block truncate font-medium">{r.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {r.subtitle}
                        {r.pronunciation ? ` • ${r.pronunciation}` : ""}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
