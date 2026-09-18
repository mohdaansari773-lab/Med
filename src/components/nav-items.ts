import {
  Home,
  Pill,
  Dna,
  BookOpen,
  Brain,
  Layers,
  GraduationCap,
  Sparkles,
  ClipboardCheck,
  Volume2,
  FlaskConical,
  Scale,
  Star,
  BarChart3,
  Settings,
  Info,
  ShieldCheck,
  Factory,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { to: string; label: string; icon: LucideIcon };

export const MAIN_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/classes", label: "Classes", icon: Dna },
  { to: "/manufacturers", label: "Pharma Companies", icon: Factory },
  { to: "/terms", label: "Medical Terms", icon: BookOpen },
  { to: "/memory", label: "Drug Memory", icon: Brain },
  { to: "/learn", label: "Learning Path", icon: GraduationCap },
  { to: "/study", label: "Study with AI", icon: Sparkles },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/quiz", label: "Quiz", icon: ClipboardCheck },
  { to: "/pronunciation", label: "Pronunciation", icon: Volume2 },
  { to: "/adme", label: "ADME", icon: FlaskConical },
  { to: "/compare", label: "Compare", icon: Scale },
  { to: "/favorites", label: "Favorites", icon: Star },
  { to: "/learning", label: "My Learning", icon: BarChart3 },
];

export const SECONDARY_NAV: NavItem[] = [
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/about", label: "About", icon: Info },
  { to: "/admin", label: "Admin", icon: ShieldCheck },
];

export const MOBILE_NAV: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/medicines", label: "Medicines", icon: Pill },
  { to: "/classes", label: "Classes", icon: Dna },
  { to: "/flashcards", label: "Learn", icon: Layers },
  { to: "/learning", label: "Progress", icon: BarChart3 },
];
