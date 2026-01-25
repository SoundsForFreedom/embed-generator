import { useState } from "react";

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

  return (
    <div className="bg-white rounded-3xl p-5 border border-gray-200">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-5xl mx-auto">
        {cards.map((card, index) => (
          <div
            key={index}
            onClick={() => toggleText(index)}
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
                className={`overflow-hidden transition-all duration-500 ease-out ${hiddenTexts.has(index)
                  ? 'max-h-0 opacity-0 scale-y-0 blur-sm'
                  : 'max-h-14 opacity-100 scale-y-100 blur-0'
                  }`}
                style={{
                  background: borderColor,
                  padding: hiddenTexts.has(index) ? "0 12px" : "12px",
                  transformOrigin: 'top',
                }}
              >
                <p className="text-center font-bold text-base" style={{ color: textColor }}>
                  {card.text || "Text..."}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Print button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => {
            // Build card data for print
            const imgIds = cards.map(c => {
              const match = c.imageUrl.match(/id=([^&]+)/);
              return match ? match[1] : '';
            });

            const printWindow = window.open('', '_blank', 'width=1100,height=800');
            if (!printWindow) {
              alert('Popup blocker may be active. Please allow popups.');
              return;
            }

            // Normal order cards - colored background with textColor
            const cardsHtml = cards.map((c, i) => `
              <div style="border:2px solid ${borderColor};border-radius:10px;overflow:hidden;background:#fff;display:flex;flex-direction:column;height:100%;position:relative">
                ${c.lessonCode ? `<div style="position:absolute;left:0;top:13%;transform:rotate(-90deg);transform-origin:left top;font-size:8px;font-weight:700;color:${borderColor};letter-spacing:0.5px;white-space:nowrap;background:${borderColor}20;padding:2px 5px;border-radius:3px">${c.lessonCode}</div>` : ''}
                <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:8px;min-height:0">
                  <img src="${c.imageUrl}" style="max-width:100%;max-height:100%;object-fit:contain">
                </div>
                <div style="background:${borderColor};color:${textColor};padding:8px;font-size:14pt;font-weight:bold;text-align:center">${c.text}</div>
              </div>
            `).join('');

            // Reversed order (for double-sided printing): row1: 4-3-2-1, row2: 8-7-6-5
            const row1 = cards.slice(0, 4).reverse();
            const row2 = cards.slice(4, 8).reverse();
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
  <title>Print Flashcards</title>
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
          }}
          className="px-10 py-3.5 rounded-full font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5"
          style={{
            backgroundColor: borderColor,
            boxShadow: `0 4px 16px ${borderColor}40`
          }}
        >
          🖨️ Printen (Double-sided)
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        💡 Click on a card to hide/show the text
      </p>
    </div>
  );
};

export default FlashcardPreview;
