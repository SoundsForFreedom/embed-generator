import { useState, useMemo } from "react";
import { Copy, Check, Eye, Printer, Palette, ImageIcon, Type, FileText, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import FlashcardPreview from "./FlashcardPreview";
import CodeOutput from "./CodeOutput";

interface CardData {
  imageUrl: string;
  text: string;
  lessonCode: string;
}

// Parse filename to extract name and lesson code
// Format: "Name - CODE - description.ext" or "Name - description.ext"
// Returns: { name: "Name", lessonCode: "CODE" }
const parseFilename = (filename: string): { name: string; lessonCode: string } => {
  if (!filename) return { name: '', lessonCode: '' };

  // Split by " - " (space-hyphen-space)
  const parts = filename.split(' - ');

  if (parts.length >= 3) {
    // Format: "Name - CODE - description"
    return {
      name: parts[0].trim(),
      lessonCode: parts[1].trim(),
    };
  } else if (parts.length === 2) {
    // Format: "Name - description" (no code yet)
    return {
      name: parts[0].trim(),
      lessonCode: '',
    };
  } else {
    // Just the name
    return {
      name: filename.trim(),
      lessonCode: '',
    };
  }
};

const createDefaultCards = (count: number): CardData[] =>
  Array(count).fill(null).map((_, i) => ({
    imageUrl: "",
    text: `Card ${i + 1}`,
    lessonCode: "",
  }));

// Convert Google Drive link to embed format (using thumbnail format)
const convertGoogleDriveLink = (url: string): string => {
  if (!url || !url.trim()) return url;

  // Already in thumbnail format?
  if (url.includes('drive.google.com/thumbnail')) {
    return url;
  }

  // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  let match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);

  // uc?export=view&id= format
  if (!match) {
    match = url.match(/drive\.google\.com\/uc\?export=view&id=([a-zA-Z0-9_-]+)/);
  }

  // open?id= format
  if (!match) {
    match = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  }

  if (match && match[1]) {
    // Thumbnail format - works more reliably
    return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w800`;
  }

  // Return as-is if it's another URL
  if (url.startsWith('http')) {
    return url;
  }

  return url;
};

// Extract file ID from Google Drive URL
const extractFileId = (url: string): string | null => {
  let match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) match = url.match(/drive\.google\.com\/uc\?export=view&id=([a-zA-Z0-9_-]+)/);
  if (!match) match = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (!match) match = url.match(/drive\.google\.com\/thumbnail\?id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
};

// Fetch filename from API (Vercel serverless function)
const fetchFilenameFromAPI = async (fileId: string): Promise<string> => {
  try {
    // API URL - will be /api/extract-filename when deployed to Vercel
    // For local development, you can change this to your local URL
    const apiUrl = import.meta.env.VITE_API_URL || '/api/extract-filename';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId }),
    });

    if (!response.ok) return '';
    const data = await response.json();
    return data.filename || '';
  } catch {
    return '';
  }
};

const EmbedGenerator = () => {
  const [cardCount, setCardCount] = useState<8 | 16 | 24>(8);
  const [cards, setCards] = useState<CardData[]>(createDefaultCards(8));
  const [borderColor, setBorderColor] = useState("#FF6B9D");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [copied, setCopied] = useState(false);
  const [bulkLinks, setBulkLinks] = useState("");
  const [bulkTexts, setBulkTexts] = useState("");
  const [isLoadingFilenames, setIsLoadingFilenames] = useState(false);

  // Reset cards when cardCount changes
  const handleCardCountChange = (newCount: 8 | 16 | 24) => {
    setCardCount(newCount);
    setCards(prevCards => {
      const newCards = createDefaultCards(newCount);
      // Preserve existing card data
      prevCards.forEach((card, i) => {
        if (i < newCount) {
          newCards[i] = card;
        }
      });
      return newCards;
    });
  };

  const updateCard = (index: number, field: keyof CardData, value: string) => {
    const newCards = [...cards];
    if (field === "imageUrl") {
      value = convertGoogleDriveLink(value.trim());
    }
    newCards[index] = { ...newCards[index], [field]: value };
    setCards(newCards);
  };

  // Bulk link paste with API-based filename extraction
  const applyBulkLinks = async () => {
    const links = bulkLinks.split("\n").filter(l => l.trim());

    // First, apply links immediately using functional update
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      links.forEach((link, i) => {
        if (i < cardCount) {
          updatedCards[i] = {
            ...updatedCards[i],
            imageUrl: convertGoogleDriveLink(link.trim()),
          };
        }
      });
      return updatedCards;
    });
    toast.success(`${Math.min(links.length, cardCount)} image links applied!`);

    // Then, fetch filenames from API in background
    setIsLoadingFilenames(true);

    // Collect all filename results first
    const filenameResults: { index: number; filename: string }[] = [];

    const promises = links.slice(0, cardCount).map(async (link, i) => {
      const fileId = extractFileId(link.trim());
      if (fileId) {
        const filename = await fetchFilenameFromAPI(fileId);
        if (filename) {
          filenameResults.push({ index: i, filename });
        }
      }
    });

    await Promise.all(promises);

    // Use functional update to ensure we're working with latest state
    setCards(prevCards => {
      const updatedCards = [...prevCards];
      filenameResults.forEach(({ index, filename }) => {
        const parsed = parseFilename(filename);
        updatedCards[index] = {
          ...updatedCards[index],
          text: parsed.name,
          lessonCode: parsed.lessonCode,
        };
      });
      return updatedCards;
    });

    setIsLoadingFilenames(false);

    if (filenameResults.length > 0) {
      toast.success(`${filenameResults.length} filenames fetched automatically! 🎉`);
    }
  };

  // Bulk text paste
  const applyBulkTexts = () => {
    const texts = bulkTexts.split("\n").filter(t => t.trim());
    const newCards = [...cards];
    texts.forEach((text, i) => {
      if (i < cardCount) {
        newCards[i] = { ...newCards[i], text: text.trim() };
      }
    });
    setCards(newCards);
    toast.success(`${Math.min(texts.length, cardCount)} texts applied!`);
  };

  const generatedCode = useMemo(() => {
    // Split cards into pages of 8

    const pages: CardData[][] = [];
    for (let i = 0; i < cards.length; i += 8) {
      pages.push(cards.slice(i, i + 8));
    }

    const totalPages = pages.length;
    const containerId = `lw-fc-${Date.now()}`;

    // Generate HTML for all pages (all visible in scroll container)
    const pagesHtml = pages.map((pageCards, pageIndex) => {
      // Extract image IDs for this page
      const imgIds = pageCards.map(c => {
        const match = c.imageUrl.match(/id=([^&]+)/);
        return match ? match[1] : '';
      });

      // Build cards data for JS (including lessonCode)
      const cardsDataJs = pageCards.map((c, i) => `['${imgIds[i]}','${c.text.replace(/'/g, "\\'")}','${(c.lessonCode || '').replace(/'/g, "\\'")}']`).join(',');

      // Cards HTML
      const cardsHtml = pageCards.map(c => `                <div style="border:4px solid ${borderColor};border-radius:16px;overflow:hidden;background:#fff;cursor:pointer;position:relative" onclick="var t=this.querySelector('.lw-card-text');t.classList.toggle('hide')">
                    ${c.lessonCode ? `<div class="lw-lesson-code">${c.lessonCode}</div>` : ''}
                    <div style="aspect-ratio:1;display:flex;align-items:center;justify-content:center;padding:10px;padding-left:${c.lessonCode ? '20px' : '10px'}"><img src="${c.imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain"></div>
                    <div class="lw-card-text" style="max-height:50px">${c.text}</div>
                </div>`).join('\n');

      // Print button for this page
      const printButton = `            <button style="display:block;margin:25px auto;background:${borderColor};color:${textColor};border:none;padding:14px 40px;font-size:16px;font-weight:600;border-radius:30px;cursor:pointer" onclick="(function(){var c='${borderColor}';var tc='${textColor}';var d=[${cardsDataJs}];var r=[d[3],d[2],d[1],d[0],d[7],d[6],d[5],d[4]];function mk(a,s){var lc=a[2]?'<div style=&quot;position:absolute;left:0;top:13%;transform:rotate(-90deg);transform-origin:left top;font-size:8px;font-weight:700;color:'+c+';letter-spacing:0.5px;white-space:nowrap;background:'+c+'20;padding:2px 5px;border-radius:3px&quot;>'+a[2]+'</div>':'';return '<div style=&quot;border:2px solid '+c+';border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column;height:100%;position:relative&quot;>'+lc+'<div style=&quot;flex:1;display:flex;align-items:center;justify-content:center;padding:8px;min-height:0&quot;><img src=&quot;https://drive.google.com/thumbnail?id='+a[0]+'&amp;sz=w800&quot; style=&quot;max-width:100%;max-height:100%;object-fit:contain&quot;></div><div style=&quot;background:'+c+';color:'+(s?tc:c)+';padding:8px;font-size:14pt;font-weight:bold;text-align:center&quot;>'+a[1]+'</div></div>';}function pg(a,s){var h='<div style=&quot;display:grid;grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(2,1fr);gap:10px;width:100%;height:100%&quot;>';for(var i=0;i<a.length;i++)h+=mk(a[i],s);return h+'</div>';}var w=window.open('','_blank','width=1100,height=800');if(!w){alert('Popup blocker may be active. Please allow popups.');return;}w.document.write('<!DOCTYPE html><html><head><meta charset=&quot;UTF-8&quot;><title>Print Page ${pageIndex + 1}</title><style>@page{size:A4 landscape;margin:10mm}*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important;box-sizing:border-box}body{margin:0;font-family:Arial}</style></head><body><div style=&quot;width:100%;height:100vh;padding:10px;box-sizing:border-box&quot;>'+pg(d,true)+'</div><div style=&quot;page-break-before:always;width:100%;height:100vh;padding:10px;box-sizing:border-box&quot;>'+pg(r,false)+'</div><sc'+'ript>setTimeout(function(){window.print();},800);</sc'+'ript></body></html>');w.document.close();})()">🖨️ Print${totalPages > 1 ? ` Pagina ${pageIndex + 1}` : ''} (Double-sided)</button>`;

      return `            <div class="lw-fc-page" data-page="${pageIndex}" style="padding:0 10px">
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
${cardsHtml}
                </div>
${printButton}
            </div>`;
    }).join('\n');

    // Navigation HTML (only if multiple pages)
    const navigationHtml = totalPages > 1 ? `
    <!-- Navigation -->
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
        <button class="lw-fc-prev" style="padding:10px 20px;border-radius:12px;border:none;background:#f3f4f6;font-weight:bold;cursor:pointer">← Vorige</button>
        <div style="display:flex;align-items:center;gap:12px">
            <span class="lw-fc-indicator" style="background:${borderColor};color:#fff;padding:8px 20px;border-radius:20px;font-weight:bold;font-size:14px">📄 Pagina 1 van ${totalPages}</span>
            <div style="display:flex;gap:8px">
${pages.map((_, i) => `                <span class="lw-fc-dot" data-dot="${i}" style="width:12px;height:12px;border-radius:50%;background:${borderColor};opacity:${i === 0 ? '1' : '0.4'};cursor:pointer"></span>`).join('\n')}
            </div>
        </div>
        <button class="lw-fc-next" style="padding:10px 20px;border-radius:12px;border:none;background:#f3f4f6;font-weight:bold;cursor:pointer">Volgende →</button>
    </div>` : '';

    // Navigation JavaScript (only if multiple pages) - includes scroll handling
    const navigationJs = totalPages > 1 ? `
<script>
(function(){
    var container = document.getElementById('${containerId}');
    var scrollContainer = container.querySelector('.lw-fc-scroll');
    var totalPages = ${totalPages};
    
    function getCurrentPage() {
        var scrollLeft = scrollContainer.scrollLeft;
        var pageWidth = scrollContainer.offsetWidth;
        return Math.round(scrollLeft / pageWidth);
    }
    
    function updateIndicators() {
        var currentPage = getCurrentPage();
        var dots = container.querySelectorAll('.lw-fc-dot');
        var indicator = container.querySelector('.lw-fc-indicator');
        var prevBtn = container.querySelector('.lw-fc-prev');
        var nextBtn = container.querySelector('.lw-fc-next');
        
        dots.forEach(function(d, i) { d.style.opacity = i === currentPage ? '1' : '0.4'; });
        indicator.textContent = '📄 Pagina ' + (currentPage + 1) + ' van ' + totalPages;
        prevBtn.style.opacity = currentPage === 0 ? '0.4' : '1';
        prevBtn.style.pointerEvents = currentPage === 0 ? 'none' : 'auto';
        nextBtn.style.opacity = currentPage === totalPages - 1 ? '0.4' : '1';
        nextBtn.style.pointerEvents = currentPage === totalPages - 1 ? 'none' : 'auto';
    }
    
    function scrollToPage(page) {
        var pageWidth = scrollContainer.offsetWidth;
        scrollContainer.scrollTo({ left: pageWidth * page, behavior: 'smooth' });
    }
    
    // Listen for scroll events to update indicator
    scrollContainer.addEventListener('scroll', updateIndicators);
    
    // Page-by-page wheel scroll with debounce
    var isScrolling = false;
    scrollContainer.addEventListener('wheel', function(e) {
        e.preventDefault();
        if (isScrolling) return;
        
        var currentPage = getCurrentPage();
        if (e.deltaY > 10 && currentPage < totalPages - 1) {
            isScrolling = true;
            scrollToPage(currentPage + 1);
            setTimeout(function() { isScrolling = false; }, 500);
        } else if (e.deltaY < -10 && currentPage > 0) {
            isScrolling = true;
            scrollToPage(currentPage - 1);
            setTimeout(function() { isScrolling = false; }, 500);
        }
    }, { passive: false });
    
    // Button clicks
    container.querySelector('.lw-fc-prev').addEventListener('click', function() {
        scrollToPage(Math.max(0, getCurrentPage() - 1));
    });
    container.querySelector('.lw-fc-next').addEventListener('click', function() {
        scrollToPage(Math.min(totalPages - 1, getCurrentPage() + 1));
    });
    
    // Dot clicks
    container.querySelectorAll('.lw-fc-dot').forEach(function(dot, i) {
        dot.addEventListener('click', function() { scrollToPage(i); });
    });
    
    updateIndicators();
})();
<\/script>` : '';

    return `<!-- LearnWorlds Flashcard Embed - Swipe/Scroll + Double-sided Print -->
<style>
.lw-card-text{transition:all 0.5s cubic-bezier(0.4,0,0.2,1);transform-origin:top;background:${borderColor};padding:12px;font-size:18px;font-weight:700;text-align:center;color:${textColor}}
.lw-card-text.hide{max-height:0!important;opacity:0;transform:scaleY(0);filter:blur(4px);padding:0 12px}
.lw-lesson-code{position:absolute;left:0;top:13%;transform:rotate(-90deg);transform-origin:left top;font-size:9px;font-weight:700;color:${borderColor};letter-spacing:0.5px;white-space:nowrap;background:${borderColor}20;padding:3px 6px;border-radius:4px}
.lw-fc-scroll{display:flex;flex-wrap:nowrap;overflow-x:scroll;overflow-y:hidden;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none}
.lw-fc-scroll::-webkit-scrollbar{display:none}
.lw-fc-page{flex-shrink:0;width:100%;scroll-snap-align:start;box-sizing:border-box}
</style>
<div id="${containerId}" style="max-width:1200px;margin:30px auto;padding:20px;font-family:Arial,sans-serif">
${navigationHtml}
    <!-- Scrollable Pages Container -->
    <div class="lw-fc-scroll">
${pagesHtml}
    </div>
    <p style="text-align:center;font-size:12px;color:#888;margin-top:10px">💡 Click on a card to hide/show the text${totalPages > 1 ? ' • Swipe or use arrows to navigate' : ''}</p>
</div>${navigationJs}`;
  }, [cards, borderColor, textColor]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed");
    }
  };

  // Color presets
  const COLOR_PRESETS = [
    // Primaire kleuren
    { name: "Paars", primary: "#7c6fea", secondary: "#6eb5d9", accent: "#e8a0bf" },
    { name: "Blauw", primary: "#3b82f6", secondary: "#06b6d4", accent: "#8b5cf6" },
    { name: "Groen", primary: "#22c55e", secondary: "#10b981", accent: "#84cc16" },
    { name: "Oranje", primary: "#f97316", secondary: "#eab308", accent: "#ef4444" },
    { name: "Roze", primary: "#ec4899", secondary: "#f472b6", accent: "#a855f7" },
    // Natuur kleuren
    { name: "Zee", primary: "#0ea5e9", secondary: "#38bdf8", accent: "#7dd3fc" },
    { name: "Bos", primary: "#15803d", secondary: "#22c55e", accent: "#4ade80" },
    { name: "Zon", primary: "#fbbf24", secondary: "#f59e0b", accent: "#fcd34d" },
    { name: "Koraal", primary: "#fb7185", secondary: "#f43f5e", accent: "#fda4af" },
    { name: "Lavendel", primary: "#a78bfa", secondary: "#8b5cf6", accent: "#c4b5fd" },
    // Modern kleuren
    { name: "Mint", primary: "#34d399", secondary: "#10b981", accent: "#6ee7b7" },
    { name: "Indigo", primary: "#6366f1", secondary: "#4f46e5", accent: "#818cf8" },
    { name: "Amber", primary: "#f59e0b", secondary: "#d97706", accent: "#fbbf24" },
    { name: "Robijn", primary: "#e11d48", secondary: "#be123c", accent: "#fb7185" },
    { name: "Turquoise", primary: "#14b8a6", secondary: "#0d9488", accent: "#5eead4" },
  ];

  const applyPreset = (preset: typeof COLOR_PRESETS[0]) => {
    setBorderColor(preset.primary);
    setTextColor("#ffffff"); // Ensure good contrast
    toast.success(`${preset.name} thema toegepast!`);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-700 mb-3">
            🎨 SoundsForFreedom Flashcards
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">

          </p>
        </header>

        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-14 rounded-2xl bg-muted p-1">
            <TabsTrigger value="editor" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Type className="w-4 h-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Copy className="w-4 h-4 mr-2" />
              Code
            </TabsTrigger>
          </TabsList>

          {/* Editor Tab */}
          <TabsContent value="editor" className="animate-pop-in">
            <div className="card-playful p-6 border-primary/20">
              {/* Card Count Selector */}
              <div className="flex items-center justify-center gap-4 mb-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl border border-primary/20">
                <span className="font-bold text-foreground flex items-center gap-2">
                  📊 Aantal kaarten:
                </span>
                <div className="flex gap-2">
                  {([8, 16, 24] as const).map((count) => (
                    <button
                      key={count}
                      onClick={() => handleCardCountChange(count)}
                      className={`px-6 py-2 rounded-xl font-bold transition-all ${cardCount === count
                        ? 'bg-primary text-white shadow-lg scale-105'
                        : 'bg-muted hover:bg-muted/80 text-foreground hover:scale-102'
                        }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({cardCount === 8 ? '1 pagina' : cardCount === 16 ? '2 paginas' : '3 paginas'})
                </span>
              </div>

              {/* Bulk Paste Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Bulk Links */}
                <div className="p-4 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Link2 className="w-5 h-5 text-primary" />
                    <Label className="font-bold text-foreground">Bulk Image Links</Label>
                  </div>
                  <Textarea
                    value={bulkLinks}
                    onChange={(e) => setBulkLinks(e.target.value)}
                    placeholder={`Paste one link per line (${cardCount} total):\nhttps://drive.google.com/file/d/.../view\nhttps://drive.google.com/file/d/.../view\n...`}
                    className="input-playful text-sm font-mono min-h-[120px] mb-3"
                  />
                  <Button
                    onClick={applyBulkLinks}
                    className="w-full btn-playful bg-primary hover:bg-primary/90"
                    disabled={!bulkLinks.trim() || isLoadingFilenames}
                  >
                    {isLoadingFilenames ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Fetching filenames...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Apply Links
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✨ Google Drive links are automatically converted
                  </p>
                </div>

                {/* Bulk Texts */}
                <div className="p-4 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="w-5 h-5 text-secondary" />
                    <Label className="font-bold text-foreground">Bulk Texts</Label>
                  </div>
                  <Textarea
                    value={bulkTexts}
                    onChange={(e) => setBulkTexts(e.target.value)}
                    placeholder={`Write one text per line (${cardCount} total):\nMonkey\nLion\nElephant\n...`}
                    className="input-playful text-sm min-h-[120px] mb-3"
                  />
                  <Button
                    onClick={applyBulkTexts}
                    className="w-full btn-playful bg-secondary hover:bg-secondary/90"
                    disabled={!bulkTexts.trim()}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Apply Texts
                  </Button>
                </div>
              </div>

              {/* Color Pickers */}
              <div className="flex flex-wrap items-center gap-6 mb-8 p-4 bg-muted/50 rounded-2xl">
                {/* Border Color */}
                <div className="flex items-center gap-3">
                  <Palette className="w-5 h-5 text-primary" />
                  <Label className="font-bold text-foreground">Border:</Label>
                  <input
                    type="color"
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
                  />
                  <Input
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="input-playful w-28 font-mono text-sm"
                  />
                </div>

                {/* Text Color */}
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-secondary" />
                  <Label className="font-bold text-foreground">Text:</Label>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="input-playful w-28 font-mono text-sm"
                  />
                </div>

                {/* Quick color presets */}
                <div className="w-full mt-4">
                  <Label className="font-bold text-foreground mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Snelle thema's (Kies een kleurthema)
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-sm"
                        style={{
                          backgroundColor: preset.primary,
                          backgroundImage: `linear-gradient(to bottom right, ${preset.primary}, ${preset.secondary})`
                        }}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-2xl bg-muted/30 border-2 border-dashed border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ backgroundColor: borderColor }}
                      >
                        {index + 1}
                      </div>
                      <span className="font-bold text-foreground">Card {index + 1}</span>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <ImageIcon className="w-3 h-3" /> Image URL
                        </Label>
                        <Input
                          value={card.imageUrl}
                          onChange={(e) => updateCard(index, "imageUrl", e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="input-playful text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <Type className="w-3 h-3" /> Text
                        </Label>
                        <Input
                          value={card.text}
                          onChange={(e) => updateCard(index, "text", e.target.value)}
                          placeholder="Card text..."
                          className="input-playful text-sm font-semibold"
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                          <FileText className="w-3 h-3" /> Lesson Code
                        </Label>
                        <Input
                          value={card.lessonCode}
                          onChange={(e) => updateCard(index, "lessonCode", e.target.value)}
                          placeholder="e.g. TH1L3"
                          className="input-playful text-sm font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="animate-pop-in">
            <div className="card-playful p-6 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Live Preview
                </h2>
                <Button
                  variant="outline"
                  className="rounded-xl font-bold"
                  onClick={() => window.print()}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Test Print
                </Button>
              </div>

              <FlashcardPreview cards={cards} borderColor={borderColor} textColor={textColor} />
            </div>
          </TabsContent>

          {/* Code Tab */}
          <TabsContent value="code" className="animate-pop-in">
            <div className="card-playful p-6 border-primary/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">
                  📋 Embed Code
                </h2>
                <Button
                  onClick={copyToClipboard}
                  className="btn-playful bg-success hover:bg-success/90 text-success-foreground"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Code
                    </>
                  )}
                </Button>
              </div>

              <CodeOutput code={generatedCode} />

              <div className="mt-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-accent">💡 Usage:</strong> Paste this code into the
                  HTML/Embed area of your LearnWorlds page. No external libraries required!
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div >
  );
};

export default EmbedGenerator;
