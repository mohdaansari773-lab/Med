import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  Pill,
  Dna,
  BookOpen,
  Brain,
  Layers,
  ClipboardCheck,
  Volume2,
  FlaskConical,
  Search,
  Clock,
  Star,
  CalendarCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalSearch } from "@/components/global-search";
import { MedicineCard } from "@/components/medicine-card";
import { Disclaimer } from "@/components/disclaimer";
import { medicinesQuery, drugClassesQuery } from "@/lib/queries";
import { useFavorites, useRecentlyViewed, useReviewSchedule } from "@/hooks/use-user-data";
import { DATASET_LABEL } from "@/lib/constants";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MediVault India — Medicine & Pharmacology Reference" },
      {
        name: "description",
        content:
          "Search medicines, brands, salts and drug classes. Learn pharmacology with ADME, flashcards, quizzes and pronunciations.",
      },
      { property: "og:title", content: "MediVault India — Medicine & Pharmacology Reference" },
      {
        property: "og:description",
        content:
          "An educational medicine reference and pharmacology learning platform for medicines used in India.",
      },
    ],
  }),
  component: Home,
});

const QUICK = [
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/classes", label: "Drug Classes", icon: Dna },
  { to: "/terms", label: "Dictionary", icon: BookOpen },
  { to: "/memory", label: "Drug Memory", icon: Brain },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/quiz", label: "Quiz", icon: ClipboardCheck },
  { to: "/pronunciation", label: "Pronunciation", icon: Volume2 },
  { to: "/adme", label: "ADME", icon: FlaskConical },
] as const;

function Home() {
  const [searchOpen, setSearchOpen] = useState(false);
  const medicines = useQuery(medicinesQuery());
  const classes = useQuery(drugClassesQuery());
  const recent = useRecentlyViewed();
  const { favorites } = useFavorites();
  const { dueToday } = useReviewSchedule();

  const common = (medicines.data ?? []).slice(0, 6);
  const popularClasses = (classes.data ?? []).filter((c) => c.class_type === "pharmacological").slice(0, 8);

  return (
    <div className="space-y-10">
      <section className="hero-gradient -mx-4 rounded-b-3xl px-4 pt-8 pb-10 sm:-mx-6 sm:px-8">
        <Badge variant="secondary" className="mb-3">
          {DATASET_LABEL}
        </Badge>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          MediVault <span className="text-primary">India</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Medicine &amp; Pharmacology Reference
        </p>

        <button
          onClick={() => setSearchOpen(true)}
          className="mt-5 flex w-full max-w-2xl items-center gap-3 rounded-2xl border bg-card px-4 py-4 text-left shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)]"
        >
          <Search className="size-5 text-primary" />
          <span className="truncate text-sm text-muted-foreground">
            Search medicine, generic, brand, salt or medical term...
          </span>
        </button>

        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-cols-8">
          {QUICK.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="surface flex flex-col items-center gap-1.5 p-3 text-center transition-shadow hover:shadow-[var(--shadow-float)]"
            >
              <Icon className="size-5 text-primary" aria-hidden />
              <span className="text-[11px] leading-tight font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {(dueToday.length > 0 || favorites.length > 0 || (recent.data?.length ?? 0) > 0) && (
        <section className="grid gap-3 sm:grid-cols-3">
          <StatTile icon={CalendarCheck} label="Review today" value={dueToday.length} to="/flashcards" />
          <StatTile icon={Star} label="Favourites" value={favorites.length} to="/favorites" />
          <StatTile icon={Clock} label="Recently viewed" value={recent.data?.length ?? 0} to="/learning" />
        </section>
      )}

      {(recent.data?.length ?? 0) > 0 && (
        <section>
          <SectionHeader title="Recently Viewed" />
          <div className="flex flex-wrap gap-2">
            {(recent.data ?? []).map((r) => (
              <Button key={r.id} asChild variant="outline" size="sm">
                <Link
                  to={r.item_type === "medicine" ? "/medicines/$slug" : "/classes/$slug"}
                  params={{ slug: r.item_id }}
                >
                  {r.label ?? r.item_id}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionHeader title="Common Drugs" action={{ to: "/medicines", label: "See all" }} />
        {medicines.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-44 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {common.map((m) => (
              <MedicineCard key={m.id} m={m} />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Popular Classes" action={{ to: "/classes", label: "All classes" }} />
        <div className="flex flex-wrap gap-2">
          {popularClasses.map((c) => (
            <Button key={c.id} asChild variant="secondary" size="sm">
              <Link to="/classes/$slug" params={{ slug: c.slug }}>
                {c.name}
              </Link>
            </Button>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Recommended Learning" />
        <div className="grid gap-3 sm:grid-cols-3">
          <LearnTile
            to="/adme"
            title="ADME step by step"
            body="Absorption → Distribution → Metabolism → Excretion, with simple and student explanations."
          />
          <LearnTile
            to="/memory"
            title="Drug name patterns"
            body="-pril, -sartan, -statin, -prazole and more, with the exceptions clearly flagged."
          />
          <LearnTile
            to="/quiz"
            title="Take a 10-question quiz"
            body="Test drug classes, mechanisms, ADME and medical terminology."
          />
        </div>
      </section>

      <Disclaimer />
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}

function SectionHeader({
  title,
  action,
}: {
  title: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {action && (
        <Button asChild variant="ghost" size="sm">
          <Link to={action.to}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}

function StatTile({
  icon: Icon,
  label,
  value,
  to,
}: {
  icon: typeof Star;
  label: string;
  value: number;
  to: string;
}) {
  return (
    <Link to={to} className="surface flex items-center gap-3 p-4">
      <Icon className="size-5 text-primary" aria-hidden />
      <div>
        <p className="font-display text-xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Link>
  );
}

function LearnTile({ to, title, body }: { to: string; title: string; body: string }) {
  return (
    <Link to={to} className="surface block p-4 transition-shadow hover:shadow-[var(--shadow-float)]">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{body}</p>
    </Link>
  );
}
