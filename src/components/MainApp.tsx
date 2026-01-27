import { useState } from "react";
import { Layers, FileText, BookOpen } from "lucide-react";
import EmbedGenerator from "./EmbedGenerator";
import GatenTekstGenerator from "./GatenTekstGenerator";
import WoordenlijstGenerator from "./WoordenlijstGenerator";

type AppMode = "flashcards" | "gaten-tekst" | "woordenlijst";

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
            <button
              onClick={() => setMode("woordenlijst")}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${mode === "woordenlijst"
                ? "bg-primary text-primary-foreground shadow-lg scale-105"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
            >
              <BookOpen className="w-5 h-5" />
              Woordenlijst
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {mode === "flashcards" ? (
        <EmbedGenerator />
      ) : mode === "gaten-tekst" ? (
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-700 mb-3">
                🎵 SoundsForFreedom Gaten tekst
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">

              </p>
            </header>

            <GatenTekstGenerator />
          </div>
        </div>
      ) : (
        <div className="p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <header className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-700 mb-3">
                📚 SoundsForFreedom Woordenlijst
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">

              </p>
            </header>

            <WoordenlijstGenerator />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainApp;

