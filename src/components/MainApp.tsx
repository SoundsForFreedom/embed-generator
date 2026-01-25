import { useState } from "react";
import { Layers, FileText } from "lucide-react";
import EmbedGenerator from "./EmbedGenerator";
import GatenTekstGenerator from "./GatenTekstGenerator";

type AppMode = "flashcards" | "gaten-tekst";

const MainApp = () => {
  const [mode, setMode] = useState<AppMode>("flashcards");

  return (
    <div className="min-h-screen bg-background">
      {/* Mode Selector Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setMode("flashcards")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === "flashcards"
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              <Layers className="w-5 h-5" />
              Flashcards
            </button>
            <button
              onClick={() => setMode("gaten-tekst")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === "gaten-tekst"
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              <FileText className="w-5 h-5" />
              Gaten tekst
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {mode === "flashcards" ? (
        <EmbedGenerator />
      ) : (
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gradient mb-3">
                🎵 Gaten tekst Generator
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Create fill-in-the-blank embed codes with SoundCloud integration.
                Put words in parentheses to hide them!
              </p>
            </header>

            <GatenTekstGenerator />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainApp;
