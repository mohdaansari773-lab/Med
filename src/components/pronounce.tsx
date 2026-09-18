import { Volume2, Rabbit, Turtle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { storedSpeechRate } from "@/hooks/use-preferences";

function speak(text: string, rate: number) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.lang = "en-IN";
  window.speechSynthesis.speak(utter);
}

export function PronounceButtons({ text, compact = false }: { text: string; compact?: boolean }) {
  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Listen to pronunciation of ${text}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          speak(text, storedSpeechRate(1));
        }}
      >
        <Volume2 className="size-4" />
      </Button>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={() => speak(text, storedSpeechRate(1))}>
        <Volume2 className="size-4" /> Listen
      </Button>
      <Button variant="outline" size="sm" onClick={() => speak(text, 0.6)}>
        <Turtle className="size-4" /> Slow
      </Button>
      <Button variant="outline" size="sm" onClick={() => speak(text, 1.15)}>
        <Rabbit className="size-4" /> Normal+
      </Button>
    </div>
  );
}
