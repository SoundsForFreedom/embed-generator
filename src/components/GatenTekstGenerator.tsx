import { useState, useMemo } from "react";
import { Copy, Check, Eye, Download, Trash2, Music, FileText, Image, Palette, Type, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

import lwEmbedCssRaw from "../embed/lw-embed.css?raw";
import lwEmbedJsRaw from "../embed/lw-embed.js?raw";

// SVG Pattern Catalog - High Quality Designs
const SVG_PATTERNS = {
  // Flower/Clover - User's design (scaled to fit viewBox)
  "flower": {
    name: "� Çiçek",
    topLeft: `<path transform="scale(0.9) translate(-20,-20)" d="M41.43,87.43c-2.62-1.17-4.18-1.81-5.69-2.54A42.67,42.67,0,0,1,19,70.58c-5.44-7.88-6.47-16.4-3.67-25.36C18,36.57,24.71,30.8,36,33.42c7.14,1.65,13.81,5.3,20.68,8.09,1.26.52,2.45,1.21,3.42,1.69,2.08-1.2,1.74-2.74,1.44-4-2.4-10.6,1.51-19.72,6.83-28.4a21.58,21.58,0,0,1,5.9-6.11c11.62-8.16,31.82-5.19,40.61,5.85,3,3.68,4.65,7.83,4.21,12.7-.33,3.63-.5,7.27-.79,11.63,2.68-1.39,4.71-2.36,6.66-3.46,10.9-6.18,22.22-6.68,33.9-2.58a47.34,47.34,0,0,1,4.84,1.77,21.79,21.79,0,0,1,11.95,13.62C178,51.34,177,57.36,174.22,64,168.71,77.31,159,85.74,145.68,90.54A41,41,0,0,0,142,92.38a68.91,68.91,0,0,0,7.17,3.94,59.43,59.43,0,0,1,19.27,12.61,24.61,24.61,0,0,1,7.83,16.65c.48,9.35-6.85,19.15-16.38,21.58a39.76,39.76,0,0,1-32.1-5.16c-2.59-1.63-5.14-3.31-8.49-5.48-.29,2.19-.75,3.51-.58,4.75,1.53,11.38-.87,22.23-5,32.68-1.91,4.88-5.49,8.33-11.41,9.15-4.3.61-8.42,1.1-12.7.17a20.8,20.8,0,0,1-13.18-8.88c-5.1-7.48-8.41-15.61-8.54-24.81,0-4,0-8,0-12.8a17.91,17.91,0,0,0-3.32,1.75c-8.76,7.73-18.67,13.27-30.23,15.4-12.51,2.31-23.17-1-31.38-11.1C.74,140.07-.81,131.7.45,127.2,2.07,121.42,4.18,115.84,8,111c8-10,17.45-17.89,29.81-21.89C38.63,88.86,39.36,88.41,41.43,87.43Z"/>`,
    bottomRight: `<path transform="scale(0.9) translate(130,130)" d="M41.43,87.43c-2.62-1.17-4.18-1.81-5.69-2.54A42.67,42.67,0,0,1,19,70.58c-5.44-7.88-6.47-16.4-3.67-25.36C18,36.57,24.71,30.8,36,33.42c7.14,1.65,13.81,5.3,20.68,8.09,1.26.52,2.45,1.21,3.42,1.69,2.08-1.2,1.74-2.74,1.44-4-2.4-10.6,1.51-19.72,6.83-28.4a21.58,21.58,0,0,1,5.9-6.11c11.62-8.16,31.82-5.19,40.61,5.85,3,3.68,4.65,7.83,4.21,12.7-.33,3.63-.5,7.27-.79,11.63,2.68-1.39,4.71-2.36,6.66-3.46,10.9-6.18,22.22-6.68,33.9-2.58a47.34,47.34,0,0,1,4.84,1.77,21.79,21.79,0,0,1,11.95,13.62C178,51.34,177,57.36,174.22,64,168.71,77.31,159,85.74,145.68,90.54A41,41,0,0,0,142,92.38a68.91,68.91,0,0,0,7.17,3.94,59.43,59.43,0,0,1,19.27,12.61,24.61,24.61,0,0,1,7.83,16.65c.48,9.35-6.85,19.15-16.38,21.58a39.76,39.76,0,0,1-32.1-5.16c-2.59-1.63-5.14-3.31-8.49-5.48-.29,2.19-.75,3.51-.58,4.75,1.53,11.38-.87,22.23-5,32.68-1.91,4.88-5.49,8.33-11.41,9.15-4.3.61-8.42,1.1-12.7.17a20.8,20.8,0,0,1-13.18-8.88c-5.1-7.48-8.41-15.61-8.54-24.81,0-4,0-8,0-12.8a17.91,17.91,0,0,0-3.32,1.75c-8.76,7.73-18.67,13.27-30.23,15.4-12.51,2.31-23.17-1-31.38-11.1C.74,140.07-.81,131.7.45,127.2,2.07,121.42,4.18,115.84,8,111c8-10,17.45-17.89,29.81-21.89C38.63,88.86,39.36,88.41,41.43,87.43Z"/>`
  },
  // Leaf organic shape
  "leaf": {
    name: "🍃 Yaprak",
    topLeft: `<path d="M10,160 Q10,10 160,10 Q80,80 80,160 Q80,80 10,160 Z"/>`,
    bottomRight: `<path d="M310,160 Q310,310 160,310 Q240,240 240,160 Q240,240 310,160 Z"/>`
  },
  // Simple circle/blob
  "circle": {
    name: "⭕ Daire",
    topLeft: `<circle cx="80" cy="80" r="120"/>`,
    bottomRight: `<circle cx="240" cy="240" r="140"/>`
  },
  // Cloud shape
  "cloud": {
    name: "☁️ Bulut",
    topLeft: `<path d="M20,120 Q20,60 80,60 Q100,20 140,40 Q180,20 180,60 Q220,60 200,100 Q220,140 180,140 Q160,180 100,160 Q40,180 20,120 Z"/>`,
    bottomRight: `<path d="M140,280 Q140,220 200,220 Q220,180 260,200 Q300,180 300,220 Q340,220 320,260 Q340,300 300,300 Q280,340 220,320 Q160,340 140,280 Z"/>`
  },
  // Star
  "star": {
    name: "⭐ Yıldız",
    topLeft: `<polygon points="80,10 95,60 150,60 105,95 120,150 80,115 40,150 55,95 10,60 65,60"/>`,
    bottomRight: `<polygon points="240,170 260,230 320,230 270,270 290,330 240,290 190,330 210,270 160,230 220,230"/>`
  },
  // Heart
  "heart": {
    name: "❤️ Kalp",
    topLeft: `<path d="M80,40 C80,20 55,10 40,25 C10,50 80,120 80,120 C80,120 150,50 120,25 C105,10 80,20 80,40 Z"/>`,
    bottomRight: `<path d="M240,200 C240,180 215,170 200,185 C170,210 240,280 240,280 C240,280 310,210 280,185 C265,170 240,180 240,200 Z"/>`
  },
  // Music note
  "music": {
    name: "🎵 Nota",
    topLeft: `<g><ellipse cx="50" cy="110" rx="25" ry="18"/><rect x="72" y="30" width="6" height="82"/><ellipse cx="110" cy="80" rx="22" ry="16"/><rect x="130" y="15" width="6" height="67"/><path d="M78,30 Q105,15 136,20" stroke-width="6" fill="none"/></g>`,
    bottomRight: `<g><ellipse cx="230" cy="280" rx="22" ry="16"/><rect x="249" y="205" width="5" height="77"/><ellipse cx="280" cy="255" rx="20" ry="14"/><rect x="297" y="190" width="5" height="67"/></g>`
  },
  // Waves
  "wave": {
    name: "� Dalga",
    topLeft: `<path d="M-20,80 Q30,40 80,80 Q130,120 180,80 Q230,40 280,80 L280,180 Q230,140 180,180 Q130,220 80,180 Q30,140 -20,180 Z"/>`,
    bottomRight: `<path d="M40,260 Q90,220 140,260 Q190,300 240,260 Q290,220 340,260 L340,340 Q290,300 240,340 Q190,380 140,340 Q90,300 40,340 Z"/>`
  },
  // Sparkle/Diamond
  "sparkle": {
    name: "✨ Parıltı",
    topLeft: `<g><polygon points="60,10 70,50 110,60 70,70 60,110 50,70 10,60 50,50"/><polygon points="120,60 127,85 150,90 127,95 120,120 113,95 90,90 113,85" opacity="0.6"/></g>`,
    bottomRight: `<g><polygon points="250,200 265,250 310,265 265,280 250,330 235,280 190,265 235,250"/><polygon points="190,250 198,278 225,285 198,292 190,320 182,292 155,285 182,278" opacity="0.6"/></g>`
  },
  "none": {
    name: "❌ Desen Yok",
    topLeft: "",
    bottomRight: ""
  }
};

const FONT_OPTIONS = [
  { value: "Quicksand", label: "Quicksand" },
  { value: "Fredoka", label: "Fredoka" },
  { value: "Nunito", label: "Nunito" },
  { value: "system-ui", label: "Sistem Fontu" },
  { value: "Comic Sans MS", label: "Comic Sans" },
  { value: "Arial Rounded MT Bold", label: "Arial Rounded" },
];

// Extract SoundCloud URL from embed code
const extractSoundCloudUrl = (embedCode: string): string | null => {
  if (!embedCode.trim()) return null;
  const srcMatch = embedCode.match(/src\s*=\s*["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) return srcMatch[1];
  if (embedCode.includes('soundcloud.com')) {
    const urlMatch = embedCode.match(/(https?:\/\/[^\s"'<>]+)/i);
    if (urlMatch) return urlMatch[1];
  }
  return null;
};

// Convert Google Drive URL to direct embed
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return "";
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }
  return url;
};

// Convert lyrics text to paragraphs
const convertTextToParagraphs = (text: string): string => {
  if (!text.trim()) return '';
  const lines = text.split('\n');
  const paragraphs: string[] = [];
  let currentParagraph: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (currentParagraph.length > 0) {
        paragraphs.push(currentParagraph.join('<br>'));
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(line);
    }
  }
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join('<br>'));
  }
  return paragraphs.map(p => `<p>${p}</p>`).join('\n');
};

const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const escapeForJs = (text: string): string => {
  return text.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");
};

const GatenTekstGenerator = () => {
  // Basic info
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [soundcloudEmbed, setSoundcloudEmbed] = useState("");
  const [soundcloudEmbedInstrumental, setSoundcloudEmbedInstrumental] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [copied, setCopied] = useState(false);

  // Page background
  const [pageBgColor, setPageBgColor] = useState("#dcfce7");

  // Corner patterns
  const [topLeftPattern, setTopLeftPattern] = useState("flower");
  const [bottomRightPattern, setBottomRightPattern] = useState("flower");
  const [patternColor, setPatternColor] = useState("#86efac");
  const [patternOpacity, setPatternOpacity] = useState([0.3]);
  const [patternSize, setPatternSize] = useState([200]); // SVG size in px
  const [patternMargin, setPatternMargin] = useState([20]); // distance from edge in px

  // Character images
  const [leftImageUrl1, setLeftImageUrl1] = useState("");
  const [leftImageUrl2, setLeftImageUrl2] = useState("");
  const [showImages, setShowImages] = useState(true);
  const [imageSize, setImageSize] = useState([180]); // px value as slider
  const [imageMargin, setImageMargin] = useState([40]); // distance from edge in px

  // Text styles
  const [fontFamily, setFontFamily] = useState("Quicksand");
  const [fontSize, setFontSize] = useState([2]);
  const [textColor, setTextColor] = useState("#374151");
  const [titleColor, setTitleColor] = useState("#15803d");
  const [titleSize, setTitleSize] = useState([2.5]); // rem
  const [authorColor, setAuthorColor] = useState("#666666");
  const [authorSize, setAuthorSize] = useState([1.2]); // rem

  // Word styles
  const [wordColor, setWordColor] = useState("#ea580c");
  const [placeholderColor, setPlaceholderColor] = useState("#dc2626");

  // Panel styles
  const [panelBgColor, setPanelBgColor] = useState("#ffffff");
  const [useGlass, setUseGlass] = useState(true);

  const extractedUrl = useMemo(() => extractSoundCloudUrl(soundcloudEmbed), [soundcloudEmbed]);
  const extractedUrlInstrumental = useMemo(() => extractSoundCloudUrl(soundcloudEmbedInstrumental), [soundcloudEmbedInstrumental]);
  const convertedImage1 = useMemo(() => convertGoogleDriveUrl(leftImageUrl1), [leftImageUrl1]);
  const convertedImage2 = useMemo(() => convertGoogleDriveUrl(leftImageUrl2), [leftImageUrl2]);

  // Generate corner decoration - using proper inline SVG with explicit dimensions
  // Uses patterns from SVG_PATTERNS catalog - NO blur for LearnWorlds compatibility
  const generateCornerHtml = (position: 'topLeft' | 'bottomRight', patternId: string, color: string, opacity: number, size: number, margin: number) => {
    if (patternId === 'none') return '';

    const pattern = SVG_PATTERNS[patternId as keyof typeof SVG_PATTERNS];
    if (!pattern) return '';

    const svgContent = position === 'topLeft' ? pattern.topLeft : pattern.bottomRight;
    if (!svgContent) return '';

    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 134, g: 239, b: 172 };
    };
    const rgb = hexToRgb(color);

    // Create SVG with FIXED position, NO blur - using catalog pattern
    return `<svg class="lw-corner-svg" 
      xmlns="http://www.w3.org/2000/svg" 
      width="${size}" height="${size}" 
      viewBox="0 0 320 320"
      style="position:fixed;pointer-events:none;z-index:0;${position === 'topLeft' ? `top:${margin}px;left:${margin}px;` : `bottom:${margin}px;right:${margin}px;`}">
      <g fill="rgb(${rgb.r},${rgb.g},${rgb.b})" fill-opacity="${opacity}" stroke="rgb(${rgb.r},${rgb.g},${rgb.b})" stroke-opacity="${opacity}">
        ${svgContent}
      </g>
    </svg>`;
  };

  const generatedCode = useMemo(() => {
    const displayTitle = title || "Title";
    const displayAuthor = author || "Author";

    // Process Vocal URL
    let soundCloudUrl = extractedUrl || "SOUNDCLOUD_URL_HERE";
    if (soundCloudUrl !== "SOUNDCLOUD_URL_HERE") {
      soundCloudUrl = soundCloudUrl.replace(/visual=true/gi, "visual=false");
      if (!soundCloudUrl.includes("visual=")) {
        soundCloudUrl += (soundCloudUrl.includes("?") ? "&" : "?") + "visual=false";
      }
    }

    // Process Instrumental URL
    let soundCloudUrlInst = extractedUrlInstrumental || "";
    if (soundCloudUrlInst) {
      soundCloudUrlInst = soundCloudUrlInst.replace(/visual=true/gi, "visual=false");
      if (!soundCloudUrlInst.includes("visual=")) {
        soundCloudUrlInst += (soundCloudUrlInst.includes("?") ? "&" : "?") + "visual=false";
      }
    }

    const textHtml = convertTextToParagraphs(lyrics) || "<p>Lyrics here...</p>";
    const inlineCss = lwEmbedCssRaw.replace(/<\/style>/gi, "<\\/style>").trim();
    const inlineJs = lwEmbedJsRaw.replace(/<\/script>/gi, "<\\/script>").trim();

    // Generate corner decorations
    const topLeftHtml = generateCornerHtml('topLeft', topLeftPattern, patternColor, patternOpacity[0], patternSize[0], patternMargin[0]);
    const bottomRightHtml = generateCornerHtml('bottomRight', bottomRightPattern, patternColor, patternOpacity[0], patternSize[0], patternMargin[0]);

    // Generate images HTML
    const leftImageHtml = showImages && convertedImage1 ?
      `<div class="lw-side-image lw-left" style="left:${imageMargin[0]}px;">
        <img class="lw-character-image" style="max-width:${imageSize[0]}px;max-height:${imageSize[0]}px;" src="${convertedImage1}" alt="Character 1" onerror="this.style.display='none'"/>
      </div>` : '';

    const rightImageHtml = showImages && convertedImage2 ?
      `<div class="lw-side-image lw-right" style="right:${imageMargin[0]}px;">
        <img class="lw-character-image" style="max-width:${imageSize[0]}px;max-height:${imageSize[0]}px;" src="${convertedImage2}" alt="Character 2" onerror="this.style.display='none'"/>
      </div>` : '';

    // CSS variable overrides
    const cssVars = `
:root {
  --lw-page-bg: ${pageBgColor};
  --lw-panel-bg: ${panelBgColor};
  --lw-text-color: ${textColor};
  --lw-font-family: '${fontFamily}', sans-serif;
  --lw-font-size: ${fontSize[0]}rem;
  --lw-word-color: ${wordColor};
  --lw-placeholder-color: ${placeholderColor};
  --lw-title-color: ${titleColor};
  --lw-title-size: ${titleSize[0]}rem;
  --lw-author-color: ${authorColor};
  --lw-author-size: ${authorSize[0]}rem;
}`;

    // Toggle button html with SVGs and Text
    // Initially hidden (display:none), JS will show it if both URLs exist
    const toggleButtonHtml = `
        <button class="lw-btn tog" id="btnAudioToggle" title="Mod Değiştir" style="display:none; min-width:160px; justify-content:center;">
          <span class="icon-vocal" style="display:none; align-items:center; gap:8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="8" x2="16" y1="22" y2="22"/></svg>
            <span>Vocal</span>
          </span>
          <span class="icon-inst" style="display:flex; align-items:center; gap:8px;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" x2="23" y1="1" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94 0v5.8"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" x2="12" y1="19" y2="22"/><line x1="8" x2="16" y1="22" y2="22"/></svg>
            <span>Instrumental</span>
          </span>
        </button>
        <div class="lw-div"></div>`;

    return `<!-- ${escapeHtml(displayTitle)} - LearnWorlds Embed v3.0 -->
<style data-lw-embed>
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&family=Quicksand:wght@400;500;600;700&display=swap');
${cssVars}
${inlineCss}
</style>

<script>
var SOUNDCLOUD_URL_VOCAL = "${soundCloudUrl}";
var SOUNDCLOUD_URL_INSTRUMENTAL = "${soundCloudUrlInst}";
var LIED_TITEL = "${escapeForJs(displayTitle)}";
var LIED_AUTEUR = "${escapeForJs(displayAuthor)}";
var TEKST_INHOUD = \`
${textHtml}
\`;
<\/script>

<!-- HTML Structure -->
<div class="lw-wrapper" id="lw-wrapper">
  <!-- Corner Decorations -->
  ${topLeftHtml}
  ${bottomRightHtml}
  
  <!-- Character Images -->
  ${leftImageHtml}
  ${rightImageHtml}
  
  <div class="lw-screen-view">
    <div class="lw-main">
      <div class="lw-header">
        <h1 class="lw-title" id="lw-titel"></h1>
        <span class="lw-author" id="lw-auteur"></span>
      </div>
      
      <div class="lw-content-layout">
        <div class="lw-lyrics-panel${useGlass ? ' glass' : ''}">
          <div class="lw-content" id="lw-tekst"></div>
        </div>
      </div>
    </div>

    <div class="lw-bar">
      <div class="lw-row">
        <button class="lw-btn nav" id="btnVorige">◀</button>
        <span class="lw-ind" id="lw-ind">1/1</span>
        <button class="lw-btn nav" id="btnVolgende">▶</button>
        <div class="lw-div"></div>
        <button class="lw-btn tog" id="btnWissel">Hide</button>
        <div class="lw-div"></div>
        <button class="lw-btn" id="btnVerbergAlles">Alles ▼</button>
        <button class="lw-btn" id="btnToonAlles">Alles ▲</button>
        <div class="lw-div"></div>
        <button class="lw-btn pr icon-btn" id="btnAfdrukken" title="Yazdır">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/></svg>
        </button>
        <div class="lw-div"></div>
        ${toggleButtonHtml}
      </div>
    </div>

    <!-- Dual Audio Containers -->
    <div class="lw-audio" id="lw-audio-vocal">
      <iframe id="lw-sc-vocal" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" src="${soundCloudUrl}"></iframe>
    </div>
    <div class="lw-audio" id="lw-audio-inst" style="display:none;">
      <iframe id="lw-sc-inst" width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay; encrypted-media" src="${soundCloudUrlInst}"></iframe>
    </div>

  </div>

  <div class="lw-print-view" aria-hidden="true">
    <div id="lw-print-root"></div>
  </div>
</div>

<script data-lw-embed>
${inlineJs}
<\/script>`;
  }, [title, author, extractedUrl, extractedUrlInstrumental, lyrics, pageBgColor, topLeftPattern, bottomRightPattern,
    patternColor, patternOpacity, convertedImage1, convertedImage2, showImages, imageSize,
    fontFamily, fontSize, textColor, wordColor, placeholderColor, panelBgColor, useGlass]);

  const previewHtml = useMemo(() => {
    const displayTitle = title || 'Title';
    const displayAuthor = author || 'Author';
    const textHtml = convertTextToParagraphs(lyrics) || '<p>Lyrics will appear here...</p>';
    return { title: displayTitle, author: displayAuthor, textHtml };
  }, [title, author, lyrics]);

  const codeSize = useMemo(() => {
    const bytes = new Blob([generatedCode]).size;
    return { bytes, kb: Math.round(bytes / 1024 * 100) / 100 };
  }, [generatedCode]);

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

  const saveAsFile = async () => {
    const safeTitle = (title || 'embed-code').replace(/[<>:"/\\|?*]/g, '_').trim();
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("File downloaded!");
  };

  const clearAll = () => {
    setTitle("");
    setAuthor("");
    setSoundcloudEmbed("");
    setSoundcloudEmbedInstrumental("");
    setLyrics("");
    setLeftImageUrl1("");
    setLeftImageUrl2("");
    toast.success("All fields cleared");
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="editor" className="space-y-6">
        <TabsList className="grid w-full max-w-lg mx-auto grid-cols-4 h-14 rounded-2xl bg-muted p-1">
          <TabsTrigger value="editor" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <FileText className="w-4 h-4 mr-1" />
            İçerik
          </TabsTrigger>
          <TabsTrigger value="style" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Palette className="w-4 h-4 mr-1" />
            Stil
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Eye className="w-4 h-4 mr-1" />
            Önizleme
          </TabsTrigger>
          <TabsTrigger value="code" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            <Copy className="w-4 h-4 mr-1" />
            Kod
          </TabsTrigger>
        </TabsList>

        {/* Content Editor Tab */}
        <TabsContent value="editor" className="animate-pop-in">
          <div className="card-playful p-6 border-primary/20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label className="font-bold text-foreground mb-2 block">Başlık</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Şarkı başlığını girin..."
                    className="input-playful"
                  />
                </div>

                <div>
                  <Label className="font-bold text-foreground mb-2 block">Sanatçı / Yazar</Label>
                  <Input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="Sanatçı adını girin..."
                    className="input-playful"
                  />
                </div>

                <div>
                  <Label className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    SoundCloud Embed Kodu
                  </Label>
                  <Textarea
                    value={soundcloudEmbed}
                    onChange={(e) => setSoundcloudEmbed(e.target.value)}
                    placeholder='<iframe width="100%" height="166" ... src="https://w.soundcloud.com/player/..."></iframe>'
                    className="input-playful font-mono text-sm min-h-[80px]"
                  />
                  {soundcloudEmbed.trim() && (
                    <div className={`mt-2 p-2 rounded-lg text-sm ${extractedUrl
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
                      : 'bg-red-500/10 border border-red-500/30 text-red-600'
                      }`}>
                      {extractedUrl ? `✓ URL bulundu` : `✗ URL bulunamadı`}
                    </div>
                  )}
                </div>

                <div>
                  <Label className="font-bold text-foreground mb-2 flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    SoundCloud Enstrümantal (Opsiyonel)
                  </Label>
                  <Textarea
                    value={soundcloudEmbedInstrumental}
                    onChange={(e) => setSoundcloudEmbedInstrumental(e.target.value)}
                    placeholder='Enstrümantal versiyon embed kodu...'
                    className="input-playful font-mono text-sm min-h-[80px]"
                  />
                  {soundcloudEmbedInstrumental.trim() && (
                    <div className={`mt-2 p-2 rounded-lg text-sm ${extractedUrlInstrumental
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600'
                      : 'bg-red-500/10 border border-red-500/30 text-red-600'
                      }`}>
                      {extractedUrlInstrumental ? `✓ URL bulundu` : `✗ URL bulunamadı`}
                    </div>
                  )}
                </div>

                {/* Character Images */}
                <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                  <Label className="font-bold text-foreground flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Karakter Resimleri
                  </Label>

                  <div className="flex items-center gap-2">
                    <Switch checked={showImages} onCheckedChange={setShowImages} />
                    <span className="text-sm">Resimleri göster</span>
                  </div>

                  {showImages && (
                    <>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">Sol Üst Resim (Google Drive)</Label>
                        <Input
                          value={leftImageUrl1}
                          onChange={(e) => setLeftImageUrl1(e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view"
                          className="input-playful text-xs"
                        />
                        {convertedImage1 && leftImageUrl1 !== convertedImage1 && (
                          <p className="text-xs text-emerald-600 mt-1">✓ Link dönüştürüldü</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">Sol Alt Resim (Google Drive)</Label>
                        <Input
                          value={leftImageUrl2}
                          onChange={(e) => setLeftImageUrl2(e.target.value)}
                          placeholder="https://drive.google.com/file/d/.../view"
                          className="input-playful text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">
                          Resim Boyutu: {imageSize[0]}px
                        </Label>
                        <Slider
                          value={imageSize}
                          onValueChange={setImageSize}
                          min={50}
                          max={500}
                          step={10}
                          className="my-2"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground mb-1 block">
                          Kenardan Uzaklık: {imageMargin[0]}px
                        </Label>
                        <Slider
                          value={imageMargin}
                          onValueChange={setImageMargin}
                          min={10}
                          max={200}
                          step={5}
                          className="my-2"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column - Lyrics */}
              <div>
                <Label className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Şarkı Sözleri
                </Label>
                <Textarea
                  value={lyrics}
                  onChange={(e) => setLyrics(e.target.value)}
                  placeholder={`Şarkı sözlerini girin...

Her kıta boş satırla ayrılmalı.

Örnek:
Birinci satır
İkinci satır

Üçüncü satır
Dördüncü satır

Gizlenecek kelimeleri parantez içine alın: (kelime)`}
                  className="input-playful font-mono min-h-[400px]"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  💡 Gizlenecek kelimeler: <code className="bg-muted px-1 rounded">(kelime)</code>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-border">
              <Button onClick={copyToClipboard} className="btn-playful bg-primary hover:bg-primary/90">
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Kopyalandı!" : "Kodu Kopyala"}
              </Button>
              <Button onClick={saveAsFile} className="btn-playful bg-amber-500 hover:bg-amber-500/90 text-white">
                <Download className="w-4 h-4 mr-2" />
                Dosya Kaydet
              </Button>
              <Button onClick={clearAll} variant="outline" className="rounded-xl">
                <Trash2 className="w-4 h-4 mr-2" />
                Temizle
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Style Tab */}
        <TabsContent value="style" className="animate-pop-in">
          <div className="card-playful p-6 border-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Page Background */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Sayfa Arka Planı
                </h3>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={pageBgColor}
                    onChange={(e) => setPageBgColor(e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border-2 border-border"
                  />
                  <Input
                    value={pageBgColor}
                    onChange={(e) => setPageBgColor(e.target.value)}
                    className="input-playful font-mono text-sm flex-1"
                  />
                </div>
              </div>

              {/* Corner Patterns */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-3 md:col-span-2">
                <h3 className="font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Köşe Desenleri
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Sol Üst</Label>
                    <Select value={topLeftPattern} onValueChange={setTopLeftPattern}>
                      <SelectTrigger className="input-playful">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SVG_PATTERNS).map(([id, p]) => (
                          <SelectItem key={id} value={id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sağ Alt</Label>
                    <Select value={bottomRightPattern} onValueChange={setBottomRightPattern}>
                      <SelectTrigger className="input-playful">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(SVG_PATTERNS).map(([id, p]) => (
                          <SelectItem key={id} value={id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col gap-1 items-center">
                      <Label className="text-xs text-muted-foreground">Renk</Label>
                      <input
                        type="color"
                        value={patternColor}
                        onChange={(e) => setPatternColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-border"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground flex justify-between">
                        <span>Opaklık</span>
                        <span>{patternOpacity[0].toFixed(2)}</span>
                      </Label>
                      <Slider
                        value={patternOpacity}
                        onValueChange={setPatternOpacity}
                        min={0.1}
                        max={1}
                        step={0.05}
                        className="my-2"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground flex justify-between">
                        <span>Boyut</span>
                        <span>{patternSize[0]}px</span>
                      </Label>
                      <Slider
                        value={patternSize}
                        onValueChange={setPatternSize}
                        min={100}
                        max={600}
                        step={10}
                        className="my-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground flex justify-between">
                        <span>Uzaklık</span>
                        <span>{patternMargin[0]}px</span>
                      </Label>
                      <Slider
                        value={patternMargin}
                        onValueChange={setPatternMargin}
                        min={-100}
                        max={200}
                        step={5}
                        className="my-2"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                <h3 className="font-bold flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Yazı Ayarları
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Yazı Tipi</Label>
                    <Select value={fontFamily} onValueChange={setFontFamily}>
                      <SelectTrigger className="input-playful">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map((f) => (
                          <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title Style */}
                  <div className="border-t border-border/50 pt-2">
                    <Label className="text-xs font-bold text-muted-foreground mb-2 block">Başlık Stili</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 items-center">
                        <input
                          type="color"
                          value={titleColor}
                          onChange={(e) => setTitleColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border border-border"
                          title="Başlık Rengi"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground flex justify-between">
                          <span>Boyut</span>
                          <span>{titleSize[0]}rem</span>
                        </Label>
                        <Slider
                          value={titleSize}
                          onValueChange={setTitleSize}
                          min={1.5}
                          max={4}
                          step={0.1}
                          className="my-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Author Style */}
                  <div className="border-t border-border/50 pt-2">
                    <Label className="text-xs font-bold text-muted-foreground mb-2 block">Yazar Stili</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 items-center">
                        <input
                          type="color"
                          value={authorColor}
                          onChange={(e) => setAuthorColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border border-border"
                          title="Yazar Rengi"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground flex justify-between">
                          <span>Boyut</span>
                          <span>{authorSize[0]}rem</span>
                        </Label>
                        <Slider
                          value={authorSize}
                          onValueChange={setAuthorSize}
                          min={0.8}
                          max={2}
                          step={0.1}
                          className="my-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Body Style */}
                  <div className="border-t border-border/50 pt-2">
                    <Label className="text-xs font-bold text-muted-foreground mb-2 block">İçerik Stili</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 items-center">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          className="w-8 h-8 rounded cursor-pointer border border-border"
                          title="Metin Rengi"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-[10px] text-muted-foreground flex justify-between">
                          <span>Boyut</span>
                          <span>{fontSize[0]}rem</span>
                        </Label>
                        <Slider
                          value={fontSize}
                          onValueChange={setFontSize}
                          min={1}
                          max={3.5}
                          step={0.1}
                          className="my-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Word Styles */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                <h3 className="font-bold">Gizlenecek Kelimeler</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={wordColor}
                    onChange={(e) => setWordColor(e.target.value)}
                    className="w-8 h-6 rounded cursor-pointer border border-border"
                  />
                  <span className="text-xs">Kelime Rengi</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={placeholderColor}
                    onChange={(e) => setPlaceholderColor(e.target.value)}
                    className="w-8 h-6 rounded cursor-pointer border border-border"
                  />
                  <span className="text-xs">Gizli Rengi</span>
                </div>
              </div>

              {/* Panel Styles */}
              <div className="p-4 bg-muted/50 rounded-xl space-y-3">
                <h3 className="font-bold">Panel Stilleri</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={panelBgColor}
                    onChange={(e) => setPanelBgColor(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border border-border"
                  />
                  <span className="text-sm">Arka Plan</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={useGlass} onCheckedChange={setUseGlass} />
                  <span className="text-sm">Glass Efekt</span>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="animate-pop-in">
          <div className="card-playful p-6 border-primary/20">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
              <Eye className="w-5 h-5 text-primary" />
              Canlı Önizleme
            </h2>

            {/* Preview container */}
            <div
              className="rounded-2xl overflow-hidden relative min-h-[500px]"
              style={{ backgroundColor: pageBgColor }}
            >
              {/* Corner patterns preview */}
              {/* Background Patterns (Real SVG Preview) */}
              <div
                dangerouslySetInnerHTML={{
                  __html: generateCornerHtml('topLeft', topLeftPattern, patternColor, patternOpacity[0], patternSize[0], patternMargin[0])
                    .replace('position:fixed', 'position:absolute')
                }}
              />
              <div
                dangerouslySetInnerHTML={{
                  __html: generateCornerHtml('bottomRight', bottomRightPattern, patternColor, patternOpacity[0], patternSize[0], patternMargin[0])
                    .replace('position:fixed', 'position:absolute')
                }}
              />

              {/* Header - CENTERED */}
              <div className="flex flex-col items-center text-center p-6">
                <h3
                  style={{
                    color: titleColor,
                    fontFamily: fontFamily,
                    fontSize: `${titleSize[0]}rem`,
                    fontWeight: 700,
                    margin: 0
                  }}
                >
                  {previewHtml.title}
                </h3>
                <span
                  style={{
                    color: authorColor,
                    fontSize: `${authorSize[0]}rem`,
                    fontFamily: fontFamily,
                    fontWeight: 500,
                    marginTop: '0.25rem'
                  }}
                >
                  {previewHtml.author}
                </span>
              </div>

              {/* Content layout - LEFT IMAGE | PANEL | RIGHT IMAGE */}
              <div className="flex items-center justify-center gap-6 px-6 pb-6">
                {/* Left Image */}
                {showImages && convertedImage1 && (
                  <img
                    src={convertedImage1}
                    alt="Character 1"
                    className="object-contain"
                    style={{
                      position: 'fixed',
                      left: `${imageMargin[0]}px`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 5,
                      maxWidth: `${imageSize[0]}px`,
                      maxHeight: `${imageSize[0]}px`
                    }}
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                  />
                )}

                {/* Lyrics panel */}
                <div
                  className={`flex-1 max-w-2xl rounded-2xl p-6 ${useGlass ? 'backdrop-blur-md bg-white/80 shadow-xl' : ''}`}
                  style={{ backgroundColor: useGlass ? undefined : panelBgColor }}
                >
                  <div
                    className="leading-relaxed [&>p]:mb-3 [&>p:last-child]:mb-0"
                    style={{
                      fontFamily: fontFamily,
                      fontSize: `${fontSize[0]}rem`,
                      color: textColor
                    }}
                    dangerouslySetInnerHTML={{
                      __html: previewHtml.textHtml
                        .replace(/\(([^)]+)\)/g, `<span style="color:${wordColor}">$1</span>`)
                    }}
                  />
                </div>

                {/* Right Image */}
                {showImages && convertedImage2 && (
                  <img
                    src={convertedImage2}
                    alt="Character 2"
                    className="object-contain"
                    style={{
                      position: 'fixed',
                      right: `${imageMargin[0]}px`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      zIndex: 5,
                      maxWidth: `${imageSize[0]}px`,
                      maxHeight: `${imageSize[0]}px`
                    }}
                    onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="animate-pop-in">
          <div className="card-playful p-6 border-primary/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                📋 Embed Kodu
              </h2>
              <div className="flex gap-2">
                <Button onClick={saveAsFile} variant="outline" className="rounded-xl">
                  <Download className="w-4 h-4 mr-2" />
                  Kaydet
                </Button>
                <Button onClick={copyToClipboard} className="btn-playful bg-emerald-500 hover:bg-emerald-500/90 text-white">
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? "Kopyalandı!" : "Kopyala"}
                </Button>
              </div>
            </div>

            <pre className="bg-gray-900 text-cyan-300 p-4 rounded-xl overflow-auto max-h-[500px] text-sm font-mono whitespace-pre-wrap break-all">
              {generatedCode}
            </pre>

            <div className="mt-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-sm text-muted-foreground">
              📏 Kod boyutu: <strong>{codeSize.bytes} bayt</strong> ({codeSize.kb} KB)
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GatenTekstGenerator;
