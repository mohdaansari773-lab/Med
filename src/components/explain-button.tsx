import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { explainTopic } from "@/lib/ai.functions";

type Mode = "simple" | "hindi" | "hinglish" | "student" | "detailed";

const MODES: { key: Mode; label: string }[] = [
  { key: "simple", label: "Explain Simply" },
  { key: "hindi", label: "Explain in Hindi" },
  { key: "hinglish", label: "Explain in Hinglish" },
  { key: "student", label: "Explain for Student" },
  { key: "detailed", label: "Explain in Detail" },
];

export function ExplainButton({
  topic,
  context,
  size = "sm",
  variant = "secondary",
  label = "Explain",
}: {
  topic: string;
  context?: string;
  size?: "sm" | "default" | "icon";
  variant?: "secondary" | "outline" | "ghost";
  label?: string;
}) {
  const explain = useServerFn(explainTopic);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("simple");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  async function run(m: Mode) {
    setMode(m);
    setLoading(true);
    setText("");
    try {
      const res = await explain({ data: { topic, context: context ?? "", mode: m } });
      setText(res.text);
    } catch {
      setText("The explanation assistant could not be reached. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o && !text && !loading) void run("simple");
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant} size={size} aria-label={`Explain ${topic}`}>
          <Lightbulb className="size-4" />
          {size !== "icon" && label}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="uppercase tracking-wide">{topic}</DialogTitle>
          <DialogDescription>
            Explanations are generated from the reference record in this app. Always verify against
            the medicine record and a qualified professional.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <Button
              key={m.key}
              size="sm"
              variant={mode === m.key ? "default" : "outline"}
              onClick={() => void run(m.key)}
              disabled={loading}
            >
              {m.label}
            </Button>
          ))}
        </div>

        <div className="min-h-24 rounded-lg bg-muted p-4 text-sm leading-relaxed whitespace-pre-wrap">
          {loading ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Preparing explanation…
            </span>
          ) : (
            text || "Choose an explanation style above."
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
