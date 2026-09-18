import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Pill,
  Dna,
  BookOpen,
  Brain,
  Layers,
  ClipboardCheck,
  Volume2,
  FlaskConical,
  Scale,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/disclaimer";
import {
  APP_NAME,
  APP_TAGLINE,
  APP_VERSION,
  DATABASE_VERSION,
  DATASET_LABEL,
  DISCLAIMER,
} from "@/lib/constants";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MediVault India — Our Approach to Medicine Data" },
      {
        name: "description",
        content:
          "What MediVault India is, which learning tools it offers, how medicine data is verified, and the references behind the starter database.",
      },
      { property: "og:title", content: "About MediVault India" },
      {
        property: "og:description",
        content:
          "Medicine reference and pharmacology learning: Drug Memory, AI Explain, ADME, flashcards, quizzes and comparison.",
      },
    ],
  }),
  component: AboutPage,
});

const FEATURES = [
  {
    icon: Pill,
    title: "Medicine reference",
    body: "Generic name, salt, strengths, dosage forms, brands in India, uses, warnings and adverse effects in one clean profile.",
    to: "/medicines",
  },
  {
    icon: Dna,
    title: "Pharmacology learning",
    body: "Therapeutic and pharmacological classes, mechanisms of action and how drug families relate to each other.",
    to: "/classes",
  },
  {
    icon: Brain,
    title: "Drug Memory",
    body: "Name-suffix patterns like -pril, -sartan, -statin and -prazole, plus mnemonics with their exceptions flagged.",
    to: "/memory",
  },
  {
    icon: Lightbulb,
    title: "AI Explain",
    body: "Any topic explained simply, in Hindi, in Hinglish, for a student or in detail — built from the record you are reading.",
    to: "/medicines",
  },
  {
    icon: FlaskConical,
    title: "ADME",
    body: "Absorption, Distribution, Metabolism and Excretion step by step, with pharmacokinetic values beside them.",
    to: "/adme",
  },
  {
    icon: Layers,
    title: "Flashcards",
    body: "Spaced-repetition cards that resurface topics right when you are about to forget them.",
    to: "/flashcards",
  },
  {
    icon: ClipboardCheck,
    title: "Quiz",
    body: "10 or 20 question sets across classes, mechanisms, ADME and terminology, with scores saved to your progress.",
    to: "/quiz",
  },
  {
    icon: Scale,
    title: "Medicine comparison",
    body: "Compare two generics side by side: class, mechanism, ADME, adverse effects and cautions.",
    to: "/compare",
  },
  {
    icon: Volume2,
    title: "Pronunciation",
    body: "Phonetic spelling plus device text-to-speech at normal or slow speed.",
    to: "/pronunciation",
  },
  {
    icon: BookOpen,
    title: "Medical dictionary",
    body: "Everyday-language definitions of the terms that make pharmacology feel intimidating.",
    to: "/terms",
  },
] as const;

function AboutPage() {
  return (
    <div className="animate-fade-up space-y-8">
      <header className="hero-gradient -mx-4 rounded-b-3xl px-4 pt-8 pb-8 sm:-mx-6 sm:px-8">
        <Badge variant="secondary" className="mb-3">
          {DATASET_LABEL}
        </Badge>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          MediVault <span className="text-primary">India</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">{APP_TAGLINE}</p>
      </header>

      <section className="surface space-y-3 p-5">
        <h2 className="font-display text-lg font-semibold">What {APP_NAME} is</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {APP_NAME} is an educational medicine reference and pharmacology learning app focused on
          medicines commonly used in India. It brings the things students and curious patients
          usually hunt for across many places — what a medicine is, which class it belongs to, how it
          works, what the body does with it, and what to watch out for — into one consistent,
          readable profile.
        </p>
        <h3 className="pt-2 font-display font-semibold">Why it exists</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Pharmacology is mostly memory plus pattern recognition. The app is built to support both:
          reference pages you can trust to be structured the same way every time, and learning tools
          — Drug Memory, flashcards, quizzes and AI Explain — that turn reading into recall. Nothing
          here is a prescription tool.
        </p>
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold">What you can do here</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, to }) => (
            <Link
              key={title}
              to={to}
              className="surface press-feedback block p-4 transition-shadow hover:shadow-[var(--shadow-float)]"
            >
              <Icon className="size-5 text-primary" aria-hidden />
              <h3 className="mt-2 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="surface space-y-3 p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
          <ShieldCheck className="size-5 text-primary" aria-hidden /> Data quality &amp; verification
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Every medicine record carries a verification status, a last-verified date and a data
          version. Records are written from standard references rather than generated freehand, and
          any field that could not be checked is shown as <em>Not yet verified</em> instead of being
          filled with a plausible guess. Brand entries are only marked verified once their
          composition has been confirmed.
        </p>
        <div>
          <h3 className="font-display font-semibold">References used</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>WHO Model List of Essential Medicines</li>
            <li>National List of Essential Medicines (NLEM), India</li>
            <li>KD Tripathi, Essentials of Medical Pharmacology</li>
            <li>Goodman &amp; Gilman&apos;s The Pharmacological Basis of Therapeutics</li>
            <li>Manufacturer product information and package inserts</li>
          </ul>
        </div>
        <p className="text-sm text-muted-foreground">
          The current dataset is labelled <strong>{DATASET_LABEL}</strong>. It is a curated set of
          commonly used medicines — it does <strong>not</strong> contain every medicine available in
          India, and it grows over time through the reviewed admin editor.
        </p>
      </section>

      <section className="surface grid gap-3 p-5 sm:grid-cols-3">
        <Meta label="App version" value={`v${APP_VERSION}`} />
        <Meta label="Database version" value={`v${DATABASE_VERSION}`} />
        <Meta label="Dataset" value={DATASET_LABEL} />
      </section>

      <section className="surface space-y-2 p-5">
        <h2 className="font-display text-lg font-semibold">Educational disclaimer</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{DISCLAIMER}</p>
      </section>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/medicines">Browse medicines</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/settings">Open settings</Link>
        </Button>
      </div>

      <Disclaimer />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="font-display text-base font-semibold">{value}</p>
    </div>
  );
}
