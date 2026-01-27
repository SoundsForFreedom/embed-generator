import { useState, useMemo } from "react";
import { Copy, Check, Eye, Plus, Trash2, Palette, Type, BookOpen, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import CodeOutput from "./CodeOutput";

interface Lesson {
    name: string;
    words: string[];
}

interface Theme {
    title: string;
    cssClass: string;
    lessons: Lesson[];
}

// Default data matching code.html structure
const defaultThemes: Theme[] = [
    {
        title: "Klanken",
        cssClass: "",
        lessons: [
            { name: "Les 1: aai, ooi, oei", words: ["aai", "ooi", "oei", "kraai", "kooi", "mooi", "groei"] },
            { name: "Les 2: s / ss", words: ["sok", "glas", "kussen", "mossel", "das", "wassen"] },
            { name: "Les 3: t / d", words: ["hond", "kat", "bed", "wand", "tijd", "stad", "hand"] },
            { name: "Les 4: ee, eu, oo", words: ["been", "zee", "neus", "deur", "boom", "rood"] }
        ]
    },
    {
        title: "BAK - woorden",
        cssClass: "lw-theme-2",
        lessons: [
            { name: "Les 1: Boerderij", words: ["koe", "geit", "kip", "stal", "melk", "trekker", "boer", "paard"] },
            { name: "Les 2: Dierentuin", words: ["leeuw", "tijger", "aap", "slang", "beer", "zebra", "olifant", "giraffe"] },
            { name: "Les 3: School", words: ["pen", "boek", "schrift", "bord", "tas", "potlood", "gum", "liniaal"] },
            { name: "Les 4: Lichaam", words: ["hoofd", "arm", "been", "hand", "voet", "oog", "neus", "mond"] }
        ]
    }
];

interface ColorSettings {
    // Card Header Theme 1
    headerGradient1Start: string;
    headerGradient1End: string;
    // Card Header Theme 2
    headerGradient2Start: string;
    headerGradient2End: string;
    // Card styles
    cardBackground: string;
    cardBorder: string;
    cardShadowColor: string;
    // Button
    buttonBackground: string;
    buttonText: string;
    buttonHoverBackground: string;
    // Lesson item
    lessonItemBackground: string;
    lessonItemBorder: string;
    lessonItemHoverBg: string;
    lessonItemHoverBorder: string;
    lessonNameColor: string;
    // Modal
    modalHeaderGradientStart: string;
    modalHeaderGradientEnd: string;
    modalTitleColor: string;
    // Word list
    wordListItemBg: string;
    wordListItemBorder: string;
    wordListItemColor: string;
    wordListItemHoverBg: string;
    wordListItemHoverBorder: string;
    // Copy button
    copyButtonBg: string;
    copyButtonHoverBg: string;
}

const defaultColors: ColorSettings = {
    headerGradient1Start: "#7c6fea",
    headerGradient1End: "#a5a0f5",
    headerGradient2Start: "#6eb5d9",
    headerGradient2End: "#8ec8e8",
    cardBackground: "#ffffff",
    cardBorder: "#e8e8f0",
    cardShadowColor: "rgba(124, 111, 234, 0.08)",
    buttonBackground: "#7c6fea",
    buttonText: "#ffffff",
    buttonHoverBackground: "#6b5dd9",
    lessonItemBackground: "#f8f9fc",
    lessonItemBorder: "#e8e8f0",
    lessonItemHoverBg: "#eeedfb",
    lessonItemHoverBorder: "#a5a0f5",
    lessonNameColor: "#3d3d5c",
    modalHeaderGradientStart: "#7c6fea",
    modalHeaderGradientEnd: "#e8a0bf",
    modalTitleColor: "#ffffff",
    wordListItemBg: "#f8f9fc",
    wordListItemBorder: "#e8e8f0",
    wordListItemColor: "#3d3d5c",
    wordListItemHoverBg: "#eeedfb",
    wordListItemHoverBorder: "#a5a0f5",
    copyButtonBg: "#6eb5d9",
    copyButtonHoverBg: "#5ca8cf",
};

const WoordenlijstGenerator = () => {
    const [themes, setThemes] = useState<Theme[]>(defaultThemes);
    const [colors, setColors] = useState<ColorSettings>(defaultColors);
    const [copied, setCopied] = useState(false);

    const updateColor = (key: keyof ColorSettings, value: string) => {
        setColors(prev => ({ ...prev, [key]: value }));
    };

    const updateThemeTitle = (themeIndex: number, title: string) => {
        const newThemes = [...themes];
        newThemes[themeIndex].title = title;
        setThemes(newThemes);
    };

    const updateLessonName = (themeIndex: number, lessonIndex: number, name: string) => {
        const newThemes = [...themes];
        newThemes[themeIndex].lessons[lessonIndex].name = name;
        setThemes(newThemes);
    };

    const updateLessonWords = (themeIndex: number, lessonIndex: number, wordsText: string) => {
        const newThemes = [...themes];
        const words = wordsText.split(",").map(w => w.trim()).filter(w => w);
        newThemes[themeIndex].lessons[lessonIndex].words = words;
        setThemes(newThemes);
    };

    const addLesson = (themeIndex: number) => {
        const newThemes = [...themes];
        const lessonNum = newThemes[themeIndex].lessons.length + 1;
        newThemes[themeIndex].lessons.push({
            name: `Les ${lessonNum}: Nieuw`,
            words: ["woord1", "woord2", "woord3"]
        });
        setThemes(newThemes);
        toast.success("Nieuwe les toegevoegd!");
    };

    const removeLesson = (themeIndex: number, lessonIndex: number) => {
        const newThemes = [...themes];
        if (newThemes[themeIndex].lessons.length > 1) {
            newThemes[themeIndex].lessons.splice(lessonIndex, 1);
            setThemes(newThemes);
            toast.success("Les verwijderd!");
        } else {
            toast.error("Minimaal één les vereist!");
        }
    };

    const generatedCode = useMemo(() => {
        // Build lwData array
        const lwDataStr = themes.map(theme => {
            const lessonsStr = theme.lessons.map(lesson => {
                const wordsStr = lesson.words.map(w => `"${w.replace(/"/g, '\\"')}"`).join(", ");
                return `{ n: "${lesson.name.replace(/"/g, '\\"')}", w: [${wordsStr}] }`;
            }).join(",\n                ");
            return `{
            t: "${theme.title.replace(/"/g, '\\"')}", c: "${theme.cssClass}", l: [
                ${lessonsStr}
            ]
        }`;
        }).join(",\n        ");

        return `<!-- LearnWorlds Embed Code - Woordenlijst -->

<style>
    #lw-word-app {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        padding: 20px;
        max-width: 900px;
        margin: 0 auto
    }

    .lw-card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 16px
    }

    .lw-theme-card {
        background: ${colors.cardBackground};
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 12px ${colors.cardShadowColor};
        border: 1px solid ${colors.cardBorder};
        transition: transform .2s, box-shadow .2s
    }

    .lw-theme-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 24px ${colors.cardShadowColor.replace('0.08', '0.12')}
    }

    .lw-card-header {
        padding: 14px 18px;
        background: linear-gradient(135deg, ${colors.headerGradient1Start}, ${colors.headerGradient1End})
    }

    .lw-card-header.lw-theme-2 {
        background: linear-gradient(135deg, ${colors.headerGradient2Start}, ${colors.headerGradient2End})
    }

    .lw-card-title {
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        margin: 0
    }

    .lw-lesson-list {
        list-style: none;
        padding: 12px;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 8px
    }

    .lw-lesson-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        background: ${colors.lessonItemBackground};
        border: 1px solid ${colors.lessonItemBorder};
        border-radius: 10px;
        padding: 12px 14px;
        transition: all .15s
    }

    .lw-lesson-item:hover {
        background: ${colors.lessonItemHoverBg};
        border-color: ${colors.lessonItemHoverBorder};
        transform: translateX(3px)
    }

    .lw-lesson-name {
        font-weight: 500;
        font-size: 13px;
        color: ${colors.lessonNameColor};
        margin: 0
    }

    .lw-btn {
        display: inline-flex;
        align-items: center;
        background: ${colors.buttonBackground};
        color: ${colors.buttonText};
        border: none;
        padding: 8px 16px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: all .15s
    }

    .lw-btn:hover {
        background: ${colors.buttonHoverBackground};
        transform: translateY(-1px);
        box-shadow: 0 4px 12px ${colors.buttonBackground}4d
    }

    .lw-modal-overlay {
        display: none;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: rgba(30, 30, 50, .92) !important;
        z-index: 2147483647 !important;
        align-items: center;
        justify-content: center;
        padding: 16px
    }

    .lw-modal-overlay.lw-active {
        display: flex !important
    }

    .lw-modal {
        position: relative !important;
        z-index: 2147483647 !important;
        background: #fff;
        width: 100%;
        max-width: 420px;
        border-radius: 18px;
        box-shadow: 0 20px 50px rgba(0, 0, 0, .4);
        max-height: calc(100vh - 32px);
        display: flex;
        flex-direction: column;
        overflow: hidden
    }

    .lw-modal-header {
        background: linear-gradient(135deg, ${colors.modalHeaderGradientStart}, ${colors.modalHeaderGradientEnd});
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center
    }

    .lw-modal-title {
        color: ${colors.modalTitleColor};
        font-size: 15px;
        font-weight: 600;
        margin: 0
    }

    .lw-close-btn {
        background: rgba(255, 255, 255, .2);
        border: none;
        color: #fff;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all .15s
    }

    .lw-close-btn:hover {
        background: rgba(255, 255, 255, .3);
        transform: rotate(90deg)
    }

    .lw-modal-body {
        padding: 18px;
        overflow-y: auto;
        flex: 1
    }

    .lw-word-list {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
        gap: 10px
    }

    .lw-word-list li {
        background: ${colors.wordListItemBg};
        border: 1px solid ${colors.wordListItemBorder};
        border-radius: 10px;
        padding: 14px 10px;
        text-align: center;
        font-weight: 600;
        color: ${colors.wordListItemColor};
        font-size: 14px;
        transition: all .15s
    }

    .lw-word-list li:hover {
        background: ${colors.wordListItemHoverBg};
        border-color: ${colors.wordListItemHoverBorder};
        transform: translateY(-2px)
    }

    .lw-modal-footer {
        padding: 14px 18px;
        border-top: 1px solid ${colors.lessonItemBorder};
        display: flex;
        justify-content: flex-end;
        background: ${colors.lessonItemBackground}
    }

    .lw-btn-copy {
        background: ${colors.copyButtonBg}
    }

    .lw-btn-copy:hover {
        background: ${colors.copyButtonHoverBg};
        box-shadow: 0 4px 12px ${colors.copyButtonBg}59
    }

    @media(max-width:600px) {
        #lw-word-app {
            padding: 14px
        }

        .lw-card-grid {
            grid-template-columns: 1fr
        }

        .lw-card-header {
            padding: 12px 16px
        }

        .lw-card-title {
            font-size: 14px
        }

        .lw-lesson-list {
            padding: 10px;
            gap: 6px
        }

        .lw-lesson-item {
            padding: 10px 12px
        }

        .lw-lesson-name {
            font-size: 12px
        }

        .lw-btn {
            padding: 7px 14px;
            font-size: 11px
        }

        .lw-word-list {
            grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))
        }

        .lw-word-list li {
            font-size: 13px;
            padding: 12px 8px
        }
    }

    /* LearnWorlds divider'ı modal açıkken gizle */
    body.lw-modal-open .learnworlds-divider-wrapper,
    body.lw-modal-open .divider-front,
    body.lw-modal-open [class*="learnworlds-divider"],
    body.lw-modal-open [class*="divider-wrapper"] {
        z-index: 0 !important;
        pointer-events: none !important;
    }
</style>

<div id="lw-word-app">
    <div class="lw-card-grid" id="lwCardGrid"></div>
    <div class="lw-modal-overlay" id="lwModalOverlay" onclick="if(event.target===this)lwCloseModal()">
        <div class="lw-modal">
            <div class="lw-modal-header">
                <h3 class="lw-modal-title" id="lwModalTitle">Les</h3>
                <button class="lw-close-btn" onclick="lwCloseModal()">×</button>
            </div>
            <div class="lw-modal-body">
                <ul class="lw-word-list" id="lwWordList"></ul>
            </div>
            <div class="lw-modal-footer">
                <button class="lw-btn lw-btn-copy" id="lwCopyBtn" onclick="lwCopyWords()">Kopiëren</button>
            </div>
        </div>
    </div>
</div>

<script>
    var lwData = [
        ${lwDataStr}
    ];
    var lwCurrentWords = [];

    function lwOpenModal(ti, li) {
        var lesson = lwData[ti].l[li];
        lwCurrentWords = lesson.w;
        document.getElementById('lwModalTitle').textContent = lesson.n;
        document.getElementById('lwWordList').innerHTML = lesson.w.map(function (w) { return '<li>' + w + '</li>' }).join('');
        document.body.classList.add('lw-modal-open');
        document.getElementById('lwModalOverlay').classList.add('lw-active');
        document.body.style.overflow = 'hidden';
    }

    function lwCloseModal() {
        document.getElementById('lwModalOverlay').classList.remove('lw-active');
        document.body.classList.remove('lw-modal-open');
        document.body.style.overflow = '';
    }

    function lwCopyWords() {
        var btn = document.getElementById('lwCopyBtn');
        navigator.clipboard.writeText(lwCurrentWords.join('\\n')).then(function () {
            btn.textContent = '✓ Gekopieerd!';
            btn.disabled = true;
            setTimeout(function () { btn.textContent = 'Kopiëren'; btn.disabled = false }, 1500);
        });
    }

    function lwRenderGrid() {
        var grid = document.getElementById('lwCardGrid');
        grid.innerHTML = '';
        lwData.forEach(function (theme, ti) {
            var card = document.createElement('div');
            card.className = 'lw-theme-card';
            var html = theme.l.map(function (lesson, li) {
                return '<li class="lw-lesson-item"><span class="lw-lesson-name">' + lesson.n + '</span><button class="lw-btn" onclick="lwOpenModal(' + ti + ',' + li + ')">Open</button></li>';
            }).join('');
            card.innerHTML = '<div class="lw-card-header ' + theme.c + '"><h3 class="lw-card-title">' + theme.t + '</h3></div><ul class="lw-lesson-list">' + html + '</ul>';
            grid.appendChild(card);
        });
    }

    lwRenderGrid();
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.getElementById('lwModalOverlay').classList.contains('lw-active')) lwCloseModal() });
</script>`;
    }, [themes, colors]);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode);
            setCopied(true);
            toast.success("Code gekopieerd naar klembord!");
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error("Kopiëren mislukt");
        }
    };

    const renderThemeEditor = (themeIndex: number) => {
        const theme = themes[themeIndex];
        return (
            <div className="space-y-4">
                {/* Theme Title */}
                <div>
                    <Label className="font-bold text-foreground mb-2 block">Thema Titel</Label>
                    <Input
                        value={theme.title}
                        onChange={(e) => updateThemeTitle(themeIndex, e.target.value)}
                        placeholder="Bijv. Klanken of BAK - woorden"
                        className="input-playful"
                    />
                </div>

                {/* Lessons */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label className="font-bold text-foreground">Lessen</Label>
                        <Button
                            onClick={() => addLesson(themeIndex)}
                            size="sm"
                            className="btn-playful bg-primary hover:bg-primary/90"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Les Toevoegen
                        </Button>
                    </div>

                    {theme.lessons.map((lesson, lessonIndex) => (
                        <div
                            key={lessonIndex}
                            className="p-4 bg-muted/30 rounded-xl border-2 border-dashed border-border space-y-3"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-sm text-muted-foreground">Les {lessonIndex + 1}</span>
                                <Button
                                    onClick={() => removeLesson(themeIndex, lessonIndex)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">Les Naam</Label>
                                <Input
                                    value={lesson.name}
                                    onChange={(e) => updateLessonName(themeIndex, lessonIndex, e.target.value)}
                                    placeholder="Bijv. Les 1: aai, ooi, oei"
                                    className="input-playful text-sm"
                                />
                            </div>

                            <div>
                                <Label className="text-xs text-muted-foreground mb-1 block">
                                    Woorden (gescheiden door komma's)
                                </Label>
                                <Textarea
                                    value={lesson.words.join(", ")}
                                    onChange={(e) => updateLessonWords(themeIndex, lessonIndex, e.target.value)}
                                    placeholder="woord1, woord2, woord3, ..."
                                    className="input-playful text-sm min-h-[80px]"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Compact color picker - just color input and label inline
    const ColorPicker = ({ label, colorKey, value }: { label: string; colorKey: keyof ColorSettings; value: string }) => (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => updateColor(colorKey, e.target.value)}
                className="w-7 h-7 rounded cursor-pointer border border-border flex-shrink-0"
            />
            <span className="text-xs text-muted-foreground truncate">{label}</span>
        </div>
    );

    // Color presets for quick selection
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
        setColors(prev => ({
            ...prev,
            headerGradient1Start: preset.primary,
            headerGradient1End: lightenColor(preset.primary, 30),
            headerGradient2Start: preset.secondary,
            headerGradient2End: lightenColor(preset.secondary, 20),
            buttonBackground: preset.primary,
            buttonHoverBackground: darkenColor(preset.primary, 15),
            modalHeaderGradientStart: preset.primary,
            modalHeaderGradientEnd: preset.accent,
            lessonItemHoverBg: lightenColor(preset.primary, 45),
            lessonItemHoverBorder: lightenColor(preset.primary, 25),
            wordListItemHoverBg: lightenColor(preset.primary, 45),
            wordListItemHoverBorder: lightenColor(preset.primary, 25),
            copyButtonBg: preset.secondary,
            copyButtonHoverBg: darkenColor(preset.secondary, 15),
        }));
        toast.success(`${preset.name} thema toegepast!`);
    };

    // Helper functions for color manipulation
    function lightenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    function darkenColor(hex: string, percent: number): string {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
    }

    return (
        <div className="space-y-6">
            <Tabs defaultValue="woorden" className="space-y-6">
                <TabsList className="grid w-full max-w-xl mx-auto grid-cols-4 h-14 rounded-2xl bg-muted p-1">
                    <TabsTrigger value="woorden" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <BookOpen className="w-4 h-4 mr-1" />
                        Klankoefening
                    </TabsTrigger>
                    <TabsTrigger value="klankoefeningen" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <List className="w-4 h-4 mr-1" />
                        BAK woorden
                    </TabsTrigger>
                    <TabsTrigger value="style" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Palette className="w-4 h-4 mr-1" />
                        Style
                    </TabsTrigger>
                    <TabsTrigger value="code" className="rounded-xl font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                        <Copy className="w-4 h-4 mr-1" />
                        Code
                    </TabsTrigger>
                </TabsList>

                {/* Theme 1 Editor */}
                <TabsContent value="woorden" className="animate-pop-in">
                    <div className="card-playful p-6 border-primary/20">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-primary" />
                            {themes[0].title || "Thema 1"}
                        </h2>
                        {renderThemeEditor(0)}
                    </div>
                </TabsContent>

                {/* Theme 2 Editor */}
                <TabsContent value="klankoefeningen" className="animate-pop-in">
                    <div className="card-playful p-6 border-primary/20">
                        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-6">
                            <List className="w-5 h-5 text-primary" />
                            {themes[1].title || "Thema 2"}
                        </h2>
                        {renderThemeEditor(1)}
                    </div>
                </TabsContent>

                {/* Style Tab */}
                <TabsContent value="style" className="animate-pop-in">
                    <div className="card-playful p-4 border-primary/20">
                        {/* Color Presets Row */}
                        <div className="mb-4 p-3 bg-muted/50 rounded-xl">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-muted-foreground mr-2">Snelle thema's:</span>
                                {COLOR_PRESETS.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:border-primary/50 transition-all hover:scale-105"
                                        style={{ background: `linear-gradient(135deg, ${preset.primary}, ${preset.secondary})` }}
                                    >
                                        <span className="text-white text-xs font-bold drop-shadow">{preset.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Split Layout: Colors + Preview */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {/* Left: Compact Color Controls */}
                            <div className="space-y-3">
                                {/* Headers Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <h4 className="text-xs font-bold mb-2 text-muted-foreground">Thema 1 Header</h4>
                                        <div className="flex gap-2">
                                            <ColorPicker label="Start" colorKey="headerGradient1Start" value={colors.headerGradient1Start} />
                                            <ColorPicker label="End" colorKey="headerGradient1End" value={colors.headerGradient1End} />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <h4 className="text-xs font-bold mb-2 text-muted-foreground">Thema 2 Header</h4>
                                        <div className="flex gap-2">
                                            <ColorPicker label="Start" colorKey="headerGradient2Start" value={colors.headerGradient2Start} />
                                            <ColorPicker label="End" colorKey="headerGradient2End" value={colors.headerGradient2End} />
                                        </div>
                                    </div>
                                </div>

                                {/* Cards Row */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <h4 className="text-xs font-bold mb-2 text-muted-foreground">Kaart</h4>
                                        <div className="flex gap-2">
                                            <ColorPicker label="BG" colorKey="cardBackground" value={colors.cardBackground} />
                                            <ColorPicker label="Rand" colorKey="cardBorder" value={colors.cardBorder} />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/30 rounded-lg">
                                        <h4 className="text-xs font-bold mb-2 text-muted-foreground">Knop</h4>
                                        <div className="flex gap-2">
                                            <ColorPicker label="BG" colorKey="buttonBackground" value={colors.buttonBackground} />
                                            <ColorPicker label="Tekst" colorKey="buttonText" value={colors.buttonText} />
                                        </div>
                                    </div>
                                </div>

                                {/* Lesson Items */}
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <h4 className="text-xs font-bold mb-2 text-muted-foreground">Les Items</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        <ColorPicker label="BG" colorKey="lessonItemBackground" value={colors.lessonItemBackground} />
                                        <ColorPicker label="Rand" colorKey="lessonItemBorder" value={colors.lessonItemBorder} />
                                        <ColorPicker label="Hover" colorKey="lessonItemHoverBg" value={colors.lessonItemHoverBg} />
                                        <ColorPicker label="Tekst" colorKey="lessonNameColor" value={colors.lessonNameColor} />
                                    </div>
                                </div>

                                {/* Modal */}
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <h4 className="text-xs font-bold mb-2 text-muted-foreground">Modal</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        <ColorPicker label="Start" colorKey="modalHeaderGradientStart" value={colors.modalHeaderGradientStart} />
                                        <ColorPicker label="End" colorKey="modalHeaderGradientEnd" value={colors.modalHeaderGradientEnd} />
                                        <ColorPicker label="Kopieer" colorKey="copyButtonBg" value={colors.copyButtonBg} />
                                    </div>
                                </div>

                                {/* Word List */}
                                <div className="p-3 bg-muted/30 rounded-lg">
                                    <h4 className="text-xs font-bold mb-2 text-muted-foreground">Woorden</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        <ColorPicker label="BG" colorKey="wordListItemBg" value={colors.wordListItemBg} />
                                        <ColorPicker label="Rand" colorKey="wordListItemBorder" value={colors.wordListItemBorder} />
                                        <ColorPicker label="Tekst" colorKey="wordListItemColor" value={colors.wordListItemColor} />
                                        <ColorPicker label="Hover" colorKey="wordListItemHoverBg" value={colors.wordListItemHoverBg} />
                                    </div>
                                </div>
                            </div>

                            {/* Right: Live Preview */}
                            <div className="lg:sticky lg:top-20">
                                <div className="bg-muted/30 rounded-lg p-2">
                                    <div className="flex items-center gap-2 mb-2 px-2">
                                        <Eye className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-bold text-muted-foreground">Live Preview</span>
                                    </div>
                                    <div className="border rounded-lg overflow-hidden bg-white">
                                        <iframe
                                            srcDoc={generatedCode}
                                            title="Preview"
                                            className="w-full h-[400px] border-0"
                                            sandbox="allow-scripts"
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-2 text-center">
                                        💡 Klik op "Open" om modal te testen
                                    </p>
                                </div>
                            </div>
                        </div>
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
                                        Gekopieerd!
                                    </>
                                ) : (
                                    <>
                                        <Copy className="w-4 h-4 mr-2" />
                                        Kopieer Code
                                    </>
                                )}
                            </Button>
                        </div>

                        <CodeOutput code={generatedCode} />

                        <div className="mt-4 p-4 bg-accent/10 rounded-xl border border-accent/20">
                            <p className="text-sm text-muted-foreground">
                                <strong className="text-accent">💡 Gebruik:</strong> Plak deze code in het
                                HTML/Embed veld van je LearnWorlds pagina. Geen externe bibliotheken nodig!
                            </p>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default WoordenlijstGenerator;
