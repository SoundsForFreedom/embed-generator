import { useState, useMemo, useEffect, useRef } from "react";

interface CardData {
  imageUrl: string;
  text: string;
  lessonCode?: string;
}

interface FlashcardPreviewProps {
  cards: CardData[];
  borderColor: string;
  textColor?: string;
}

const FlashcardPreview = ({ cards, borderColor, textColor = "#FFFFFF" }: FlashcardPreviewProps) => {
  const [hiddenTexts, setHiddenTexts] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const toggleText = (index: number) => {
    setHiddenTexts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Split cards into pages of 8
  const pages = useMemo(() => {
    const result: CardData[][] = [];
    for (let i = 0; i < cards.length; i += 8) {
      result.push(cards.slice(i, i + 8));
    }
    return result;
  }, [cards]);

  // Reset to first page if pages change
  useEffect(() => {
    if (currentPage >= pages.length && pages.length > 0) {
      setCurrentPage(0);
    }
  }, [pages.length, currentPage]);

  // Handle scroll to update current page indicator
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const pageWidth = container.offsetWidth;
      const newPage = Math.round(scrollLeft / pageWidth);
      if (newPage !== currentPage && newPage >= 0 && newPage < pages.length) {
        setCurrentPage(newPage);
      }
    };

    // Page-by-page wheel scroll
    const handleWheel = (e: WheelEvent) => {
      if (pages.length <= 1) return;
      e.preventDefault();

      if (e.deltaY > 10 && currentPage < pages.length - 1) {
        // Scroll down = next page
        scrollToPage(currentPage + 1);
      } else if (e.deltaY < -10 && currentPage > 0) {
        // Scroll up = prev page
        scrollToPage(currentPage - 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [currentPage, pages.length]);

  const totalPages = pages.length;

  // Scroll to a specific page
  const scrollToPage = (pageIndex: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const pageWidth = container.offsetWidth;
    container.scrollTo({
      left: pageWidth * pageIndex,
      behavior: 'smooth'
    });
    setCurrentPage(pageIndex);
  };

  // Print function for current page
  const printCurrentPage = () => {
    const pageCards = pages[currentPage] || [];
    if (!pageCards.length) return;

    const printWindow = window.open('', '_blank', 'width=1100,height=800');
    if (!printWindow) {
      alert('Popup blocker may be active. Please allow popups.');
      return;
    }

    // Normal order cards - colored background with textColor
    const cardsHtml = pageCards.map((c) => `
      <div style="border:2px solid ${borderColor};border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column;height:100%;position:relative">
        ${c.lessonCode ? `<div style="position:absolute;left:0;top:13%;transform:rotate(-90deg);transform-origin:left top;font-size:8px;font-weight:700;color:${borderColor};letter-spacing:0.5px;white-space:nowrap;background:${borderColor}20;padding:2px 5px;border-radius:3px">${c.lessonCode}</div>` : ''}
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:8px;min-height:0">
          <img src="${c.imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain">
        </div>
        <div style="background:${borderColor};color:${textColor};padding:8px;font-size:14pt;font-weight:bold;text-align:center">${c.text}</div>
      </div>
    `).join('');

    // Reversed order (for double-sided printing): row1: 4-3-2-1, row2: 8-7-6-5
    const row1 = pageCards.slice(0, 4).reverse();
    const row2 = pageCards.slice(4, 8).reverse();
    const reversedCards = [...row1, ...row2];

    // Reversed cards - colored background, hidden text (same color as bg)
    const reversedCardsHtml = reversedCards.map(c => `
      <div style="border:2px solid ${borderColor};border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column;height:100%;position:relative">
        ${c.lessonCode ? `<div style="position:absolute;left:0;top:13%;transform:rotate(-90deg);transform-origin:left top;font-size:8px;font-weight:700;color:${borderColor};letter-spacing:0.5px;white-space:nowrap;background:${borderColor}20;padding:2px 5px;border-radius:3px">${c.lessonCode}</div>` : ''}
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:8px;min-height:0">
          <img src="${c.imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain">
        </div>
        <div style="background:${borderColor};color:${borderColor};padding:8px;font-size:14pt;font-weight:bold;text-align:center">${c.text}</div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Print Flashcards - Page ${currentPage + 1}</title>
  <style>
    @page { size: A4 landscape; margin: 10mm; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    body { font-family: Arial, sans-serif; margin: 0; }
    .page { width: 100%; height: 100vh; display: grid; grid-template-columns: repeat(4, 1fr); grid-template-rows: repeat(2, 1fr); gap: 10px; padding: 10px; box-sizing: border-box; }
    .page-break { page-break-before: always; }
    @media screen { body { background: #f3f4f6; padding: 20px; } .page { background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); margin-bottom: 20px; height: auto; aspect-ratio: 297/210; } }
  </style>
</head>
<body>
  <div class="page">
    ${cardsHtml}
  </div>
  <div class="page page-break">
    ${reversedCardsHtml}
  </div>
  <script>
    window.onload = function() { setTimeout(function() { window.print(); }, 800); };
  <\/script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  // Render a single card
  const renderCard = (card: CardData, globalIndex: number) => (
    <div
      key={globalIndex}
      onClick={() => toggleText(globalIndex)}
      className="cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95"
    >
      <div
        className="bg-white rounded-2xl overflow-hidden flex flex-col relative"
        style={{
          border: `4px solid ${borderColor}`,
        }}
      >
        {/* Lesson Code - colored text on semi-transparent bg */}
        {card.lessonCode && (
          <div
            className="absolute left-0 top-2 text-[9px] font-bold tracking-wide whitespace-nowrap px-1.5 py-0.5 rounded"
            style={{
              color: borderColor,
              backgroundColor: `${borderColor}20`,
              transform: 'rotate(-90deg)',
              transformOrigin: 'left top'
            }}
          >
            {card.lessonCode}
          </div>
        )}
        {/* Image container - white background, centered image */}
        <div className={`bg-white aspect-square flex items-center justify-center p-2.5 ${card.lessonCode ? 'pl-5' : ''}`}>
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt={card.text}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="text-5xl">🖼️</div>
          )}
        </div>

        {/* Text - colored background, disappears with magic effect on click */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out ${hiddenTexts.has(globalIndex)
            ? 'max-h-0 opacity-0 scale-y-0 blur-sm'
            : 'max-h-14 opacity-100 scale-y-100 blur-0'
            }`}
          style={{
            background: borderColor,
            padding: hiddenTexts.has(globalIndex) ? "0 12px" : "12px",
            transformOrigin: 'top',
          }}
        >
          <p className="text-center font-bold text-base" style={{ color: textColor }}>
            {card.text || "Text..."}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-200">
      {/* Page Navigation - only show if multiple pages */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-4">
          {/* Previous Button */}
          <button
            onClick={() => scrollToPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${currentPage === 0
              ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
              }`}
          >
            ← Vorige
          </button>

          {/* Page Indicator */}
          <div className="flex items-center gap-3">
            <span
              className="px-5 py-2 rounded-full text-sm font-bold text-white shadow-lg"
              style={{ backgroundColor: borderColor }}
            >
              📄 Pagina {currentPage + 1} van {totalPages}
            </span>

            {/* Page Dots */}
            <div className="flex gap-2">
              {pages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToPage(idx)}
                  className={`w-3 h-3 rounded-full transition-all ${idx === currentPage
                    ? 'scale-125'
                    : 'opacity-40 hover:opacity-70'
                    }`}
                  style={{
                    backgroundColor: borderColor,
                  }}
                  title={`Pagina ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={() => scrollToPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${currentPage === totalPages - 1
              ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:scale-105'
              }`}
          >
            Volgende →
          </button>
        </div>
      )}

      {/* Horizontal Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-scroll overflow-y-hidden"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          flexWrap: 'nowrap',
        }}
      >
        {pages.map((pageCards, pageIndex) => (
          <div
            key={pageIndex}
            className="px-2"
            style={{
              flexShrink: 0,
              width: '100%',
              scrollSnapAlign: 'start',
            }}
          >
            {/* Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
              {pageCards.map((card, cardIndex) => {
                const globalIndex = pageIndex * 8 + cardIndex;
                return renderCard(card, globalIndex);
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Print button for current page */}
      <div className="flex justify-center mt-6">
        <button
          onClick={printCurrentPage}
          className="px-10 py-3.5 rounded-full font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
          style={{
            backgroundColor: borderColor,
            boxShadow: `0 4px 16px ${borderColor}40`
          }}
        >
          🖨️ Print {totalPages > 1 ? `Pagina ${currentPage + 1}` : ''} (Double-sided)
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        💡 Click on a card to hide/show the text
        {totalPages > 1 && ' • Swipe or use arrows to navigate'}
      </p>
    </div>
  );
};

export default FlashcardPreview;
