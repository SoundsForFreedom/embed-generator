/**
 * LearnWorlds Audio-Text Embed Component
 * Version: 3.0.0 - Dual Audio Support (Vocal/Instrumental)
 */
(function () {
    'use strict';

    var currentIndex = 0;
    var totalParagraphs = 0;
    var paragraphStates = [];

    // Player state
    var activePlayer = 'vocal'; // 'vocal' or 'instrumental'
    var vocalWidget = null;
    var instWidget = null;
    var isPlaying = false;

    function $(id) { return document.getElementById(id); }
    function $$(selector) { return document.querySelectorAll(selector); }

    // Load SoundCloud Widget API
    function loadScWidgetApi(callback) {
        if (window.SC) {
            callback();
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://w.soundcloud.com/player/api.js';
        script.onload = callback;
        document.head.appendChild(script);
    }

    function initialize() {
        // Set content
        var titleEl = $('lw-titel');
        var authorEl = $('lw-auteur');
        if (titleEl && typeof LIED_TITEL !== 'undefined') titleEl.textContent = LIED_TITEL;
        if (authorEl && typeof LIED_AUTEUR !== 'undefined') authorEl.textContent = LIED_AUTEUR;

        var container = $('lw-tekst');
        if (!container || typeof TEKST_INHOUD === 'undefined') return;

        // Parse content
        var temp = document.createElement('div');
        temp.innerHTML = TEKST_INHOUD;
        var paragraphs = temp.querySelectorAll('p');
        totalParagraphs = paragraphs.length;
        if (totalParagraphs === 0) return;

        // Build HTML
        var html = '';
        for (var i = 0; i < paragraphs.length; i++) {
            var content = paragraphs[i].innerHTML.replace(/\(([^)]+)\)/g, '<span class="lw-word">$1</span>');
            html += '<div class="lw-para-wrap" data-idx="' + i + '">';
            html += '<p data-i="' + i + '">' + content + '</p>';
            html += '<div class="lw-inline-btns">';
            html += '<button class="lw-inline-btn hide-btn" data-i="' + i + '">▼</button>';
            html += '<button class="lw-inline-btn show-btn show" data-i="' + i + '">▲</button>';
            html += '</div></div>';
            paragraphStates[i] = false;
        }
        container.innerHTML = html;

        // Dual Audio Setup
        var scVocal = $('lw-sc-vocal');
        var scInst = $('lw-sc-inst');
        var toggleAudioBtn = $('btnAudioToggle');

        // Set URLs if provided
        if (scVocal && typeof SOUNDCLOUD_URL_VOCAL !== 'undefined' && SOUNDCLOUD_URL_VOCAL) {
            scVocal.src = SOUNDCLOUD_URL_VOCAL;
        }

        if (scInst && typeof SOUNDCLOUD_URL_INSTRUMENTAL !== 'undefined' && SOUNDCLOUD_URL_INSTRUMENTAL) {
            scInst.src = SOUNDCLOUD_URL_INSTRUMENTAL;
            // Only initialize dual logic if we have both players
            if (scVocal && toggleAudioBtn) {
                // Determine layout mode
                toggleAudioBtn.style.display = 'inline-flex';

                // Load API and init widgets
                loadScWidgetApi(function () {
                    vocalWidget = SC.Widget(scVocal);
                    instWidget = SC.Widget(scInst);

                    // Sync play state
                    vocalWidget.bind(SC.Widget.Events.PLAY, function () { isPlaying = true; });
                    vocalWidget.bind(SC.Widget.Events.PAUSE, function () { isPlaying = false; });
                    instWidget.bind(SC.Widget.Events.PLAY, function () { isPlaying = true; });
                    instWidget.bind(SC.Widget.Events.PAUSE, function () { isPlaying = false; });

                    // Ensure instrumental is ready
                    instWidget.bind(SC.Widget.Events.READY, function () {
                        instWidget.setVolume(100);
                    });
                });
            }
        } else {
            // Fallback for single player (old style or vocal only) -> Rename ID in HTML or handle legacy
            // If only vocal is present, we are fine.
            if (toggleAudioBtn) toggleAudioBtn.style.display = 'none';
        }

        bindEvents();
        updateDisplay();
    }

    function toggleAudioMode() {
        if (!vocalWidget || !instWidget) return;

        var btn = $('btnAudioToggle');
        var iconVocal = btn.querySelector('.icon-vocal');
        var iconInst = btn.querySelector('.icon-inst');
        var scVocalContainer = $('lw-audio-vocal');
        var scInstContainer = $('lw-audio-inst');

        if (activePlayer === 'vocal') {
            // Switch to Instrumental
            vocalWidget.getPosition(function (pos) {
                vocalWidget.pause();

                instWidget.seekTo(pos);
                if (isPlaying) {
                    instWidget.play();
                }

                // UI Update
                scVocalContainer.style.display = 'none';
                scInstContainer.style.display = 'block';
                activePlayer = 'instrumental';

                // Show Microphone icon (to switch back to vocal)
                iconVocal.style.display = 'inline-flex';
                iconInst.style.display = 'none';
                btn.title = "Vokal'e Geç";
            });
        } else {
            // Switch to Vocal
            instWidget.getPosition(function (pos) {
                instWidget.pause();

                vocalWidget.seekTo(pos);
                if (isPlaying) {
                    vocalWidget.play();
                }

                // UI Update
                scInstContainer.style.display = 'none';
                scVocalContainer.style.display = 'block';
                activePlayer = 'vocal';

                // Show Music icon (to switch back to instrumental)
                iconVocal.style.display = 'none';
                iconInst.style.display = 'inline-flex';
                btn.title = "Enstrümantal'e Geç";
            });
        }
    }

    function bindEvents() {
        var btnPrev = $('btnVorige');
        var btnNext = $('btnVolgende');
        var btnToggle = $('btnWissel');
        var btnHideAll = $('btnVerbergAlles');
        var btnShowAll = $('btnToonAlles');
        var btnPrint = $('btnAfdrukken');
        var btnAudioToggle = $('btnAudioToggle');

        if (btnPrev) btnPrev.onclick = function () { if (currentIndex > 0) { currentIndex--; updateDisplay(); scrollToCurrentParagraph(); } };
        if (btnNext) btnNext.onclick = function () { if (currentIndex < totalParagraphs - 1) { currentIndex++; updateDisplay(); scrollToCurrentParagraph(); } };
        if (btnToggle) btnToggle.onclick = toggleCurrentParagraph;
        if (btnHideAll) btnHideAll.onclick = function () { setAllParagraphs(true); };
        if (btnShowAll) btnShowAll.onclick = function () { setAllParagraphs(false); };
        if (btnPrint) btnPrint.onclick = handlePrint;
        if (btnAudioToggle) btnAudioToggle.onclick = toggleAudioMode;

        // Paragraph click events
        var wrappers = $$('.lw-para-wrap');
        for (var j = 0; j < wrappers.length; j++) {
            var paragraph = wrappers[j].querySelector('p');
            if (paragraph) {
                paragraph.onclick = function (e) {
                    var wrap = e.target.closest('.lw-para-wrap');
                    if (!wrap) return;
                    var paraIdx = parseInt(wrap.getAttribute('data-idx'));
                    var allWraps = $$('.lw-para-wrap');
                    for (var k = 0; k < allWraps.length; k++) allWraps[k].classList.remove('selected');
                    wrap.classList.add('selected');
                    currentIndex = paraIdx;
                    updateDisplay();
                };
            }
        }

        // Inline buttons
        var hideBtns = $$('.hide-btn');
        var showBtns = $$('.show-btn');
        for (var h = 0; h < hideBtns.length; h++) {
            hideBtns[h].onclick = function (e) { e.stopPropagation(); hideParagraph(parseInt(this.getAttribute('data-i'))); };
        }
        for (var s = 0; s < showBtns.length; s++) {
            showBtns[s].onclick = function (e) { e.stopPropagation(); showParagraph(parseInt(this.getAttribute('data-i'))); };
        }
    }

    function hideParagraph(paraIdx) {
        var p = document.querySelector('[data-i="' + paraIdx + '"]');
        if (!p) return;
        paragraphStates[paraIdx] = true;
        var words = p.querySelectorAll('.lw-word');
        for (var i = 0; i < words.length; i++) words[i].classList.add('hide');
        updateDisplay();
    }

    function showParagraph(paraIdx) {
        var p = document.querySelector('[data-i="' + paraIdx + '"]');
        if (!p) return;
        paragraphStates[paraIdx] = false;
        var words = p.querySelectorAll('.lw-word');
        for (var i = 0; i < words.length; i++) words[i].classList.remove('hide');
        updateDisplay();
    }

    function updateDisplay() {
        var indicator = $('lw-ind');
        if (indicator) indicator.textContent = (currentIndex + 1) + '/' + totalParagraphs;

        var paragraphs = $$('[data-i]');
        for (var i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].tagName === 'P') paragraphs[i].classList.remove('active');
        }
        var currentPara = document.querySelector('p[data-i="' + currentIndex + '"]');
        if (currentPara) currentPara.classList.add('active');

        var toggleBtn = $('btnWissel');
        if (toggleBtn) {
            toggleBtn.textContent = paragraphStates[currentIndex] ? 'Tonen' : 'Verbergen';
            toggleBtn.classList.toggle('on', paragraphStates[currentIndex]);
        }
    }

    function scrollToCurrentParagraph() {
        var p = document.querySelector('p[data-i="' + currentIndex + '"]');
        if (p) p.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function toggleCurrentParagraph() {
        var p = document.querySelector('p[data-i="' + currentIndex + '"]');
        if (!p) return;
        paragraphStates[currentIndex] = !paragraphStates[currentIndex];
        var words = p.querySelectorAll('.lw-word');
        for (var i = 0; i < words.length; i++) words[i].classList.toggle('hide', paragraphStates[currentIndex]);
        updateDisplay();
    }

    function setAllParagraphs(hidden) {
        var paragraphs = $$('p[data-i]');
        for (var i = 0; i < paragraphs.length; i++) {
            var idx = parseInt(paragraphs[i].getAttribute('data-i'));
            if (paragraphStates[idx] !== hidden) {
                paragraphStates[idx] = hidden;
                var words = paragraphs[i].querySelectorAll('.lw-word');
                for (var j = 0; j < words.length; j++) words[j].classList.toggle('hide', hidden);
            }
        }
        updateDisplay();
    }

    // Print logic
    function buildPrintClone() {
        var main = document.querySelector('.lw-screen-view .lw-main') || document.querySelector('.lw-main');
        if (!main) return null;
        var clone = main.cloneNode(true);
        var idEls = clone.querySelectorAll('[id]');
        for (var i = 0; i < idEls.length; i++) idEls[i].removeAttribute('id');
        var activeEls = clone.querySelectorAll('p.active');
        for (var j = 0; j < activeEls.length; j++) activeEls[j].classList.remove('active');
        var inlineBtns = clone.querySelectorAll('.lw-inline-btns');
        for (var k = 0; k < inlineBtns.length; k++) inlineBtns[k].parentNode && inlineBtns[k].parentNode.removeChild(inlineBtns[k]);
        return clone;
    }

    function getEmbedCssText() {
        var styleEl = document.querySelector('style[data-lw-embed]');
        return styleEl ? styleEl.innerHTML : '';
    }

    function openPrintPopupAndPrint() {
        var printWindow = window.open('', '_blank', 'width=1200,height=800');
        if (!printWindow) return false;
        var clone = buildPrintClone();
        if (!clone) return false;
        var cssText = getEmbedCssText();
        var html = '<!DOCTYPE html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Print</title><style>' + cssText + '</style><style>html, body { margin: 0; padding: 0; } @media screen { body { background: #f3f4f6; padding: 20px; } .lw-main { max-width: 900px; margin: 0 auto; box-shadow: 0 6px 30px rgba(0,0,0,0.12); } } .lw-bar, .lw-audio, .lw-inline-btns { display: none !important; }</style></head><body>' + clone.outerHTML + '<script>window.onload = function() { setTimeout(function() { window.focus(); window.print(); }, 250); };<\/script></body></html>';
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        return true;
    }

    function handlePrint() {
        try {
            var ok = openPrintPopupAndPrint();
            if (!ok) window.print();
        } catch (e) { window.print(); }
    }

    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('beforeprint', function () { });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 10);
    }
})();
