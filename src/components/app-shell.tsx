import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Menu, Moon, Sun, LogIn, LogOut, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { GlobalSearch } from "@/components/global-search";
import { MAIN_NAV, SECONDARY_NAV, MOBILE_NAV } from "@/components/nav-items";
import { APP_NAME, APP_TAGLINE, APP_VERSION, DATABASE_VERSION } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { usePreferences } from "@/hooks/use-preferences";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin } = useAuth();
  const items = [...MAIN_NAV, ...SECONDARY_NAV.filter((s) => s.to !== "/admin" || isAdmin)];
  return (
    <nav className="flex flex-col gap-0.5">
      {items.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onNavigate}
          activeOptions={{ exact: to === "/" }}
          activeProps={{
            className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark, toggleTheme } = usePreferences();
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    void navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 sm:px-6">
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 overflow-y-auto p-4">
              <SheetTitle className="mb-4 font-display">{APP_NAME}</SheetTitle>
              <NavList onNavigate={() => setMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Stethoscope className="size-4" />
            </span>
            <span className="font-display text-sm leading-tight font-semibold sm:text-base">
              MediVault <span className="text-primary">India</span>
            </span>
          </Link>

          <button
            onClick={() => setSearchOpen(true)}
            className="ml-auto flex h-9 max-w-md flex-1 items-center gap-2 rounded-full border bg-card px-3 text-sm text-muted-foreground transition-colors hover:bg-accent"
            aria-label="Search medicines"
          >
            <Search className="size-4" />
            <span className="truncate">Search medicine, brand, salt…</span>
          </button>

          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle dark mode">
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => void signOut()}
              aria-label="Sign out"
            >
              <LogOut className="size-4" />
            </Button>
          ) : (
            <Button asChild variant="ghost" size="icon" aria-label="Sign in">
              <Link to="/auth">
                <LogIn className="size-4" />
              </Link>
            </Button>
          )}
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r bg-sidebar p-4 lg:block">
          <NavList />
          <p className="mt-6 px-3 text-[11px] leading-relaxed text-muted-foreground">
            {APP_TAGLINE}
            <br />v{APP_VERSION} • Database v{DATABASE_VERSION}
          </p>
        </aside>

        <main className="animate-fade-up min-w-0 flex-1 px-4 pt-5 pb-28 sm:px-6 lg:pb-12">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-background/95 backdrop-blur lg:hidden"
        aria-label="Primary"
      >
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: to === "/" }}
            activeProps={{ className: "text-primary" }}
            className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground"
          >
            <Icon className="size-5" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
