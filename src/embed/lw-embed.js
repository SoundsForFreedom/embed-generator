/**
 * LearnWorlds Audio-Text Embed Component
 * Version: 3.1.0 - Custom Waveform Bar Player
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
    var isSeeking = false;
    var audioDuration = 0;
    var waveBars = [];

    function $(id) { return document.getElementById(id); }
    function $$(selector) { return document.querySelectorAll(selector); }

    // Format time helper
    function formatTime(ms) {
        if (!ms || isNaN(ms)) return "0:00";
        var totalSec = Math.floor(ms / 1000);
        var min = Math.floor(totalSec / 60);
        var sec = totalSec % 60;
        return min + ":" + (sec < 10 ? "0" : "") + sec;
    }

    // Create waveform bars
    function createWaveBars() {
        var container = $('lw-wave-visualizer');
        if (!container) return;

        var count = 50; // Number of bars
        var html = '';
        for (var i = 0; i < count; i++) {
            var height = Math.floor(Math.random() * 60) + 30; // 30-90%
            var delay = (Math.random() * -1.2).toFixed(2);
            html += '<div class="lw-wave-bar" data-bar="' + i + '" style="height:' + height + '%; animation-delay:' + delay + 's"></div>';
        }

        // Insert before the seek slider
        var seekSlider = $('lw-seek-slider');
        if (seekSlider) {
            var temp = document.createElement('div');
            temp.innerHTML = html;
            while (temp.firstChild) {
                container.insertBefore(temp.firstChild, seekSlider);
            }
        } else {
            container.innerHTML = html;
        }

        waveBars = $$('.lw-wave-bar');
    }

    // Update waveform UI based on playback progress
    function updateWaveUI(currentMs) {
        if (audioDuration <= 0 || isSeeking) return;

        var percent = currentMs / audioDuration;
        var activeIndex = Math.floor(percent * waveBars.length);
        var timeDisplay = $('lw-time-display');
        var seekSlider = $('lw-seek-slider');

        if (timeDisplay) timeDisplay.textContent = formatTime(currentMs);
        if (seekSlider) seekSlider.value = currentMs;

        for (var i = 0; i < waveBars.length; i++) {
            if (i <= activeIndex) {
                waveBars[i].classList.add('active');
            } else {
                waveBars[i].classList.remove('active');
            }

            if (isPlaying) {
                waveBars[i].classList.add('animate');
            } else {
                waveBars[i].classList.remove('animate');
            }
        }
    }

    // Set play state UI
    function setPlayStateUI(playing) {
        isPlaying = playing;
        var playBtn = $('lw-play-btn');
        if (playBtn) {
            playBtn.innerHTML = playing
                ? '<svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
                : '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        }

        for (var i = 0; i < waveBars.length; i++) {
            if (playing) {
                waveBars[i].classList.add('animate');
            } else {
                waveBars[i].classList.remove('animate');
            }
        }
    }

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

        // Create waveform bars
        createWaveBars();

        // Load API for waveform player
        loadScWidgetApi(function () {
            vocalWidget = SC.Widget(scVocal);

            // Vocal widget events
            vocalWidget.bind(SC.Widget.Events.READY, function () {
                vocalWidget.getDuration(function (d) {
                    audioDuration = d;
                    var seekSlider = $('lw-seek-slider');
                    if (seekSlider) seekSlider.max = d;
                });
                // Get track title
                vocalWidget.getCurrentSound(function (sound) {
                    if (sound && sound.title) {
                        var titleEl = $('lw-track-title');
                        if (titleEl) titleEl.textContent = sound.title;
                    }
                });
            });
            vocalWidget.bind(SC.Widget.Events.PLAY, function () { setPlayStateUI(true); });
            vocalWidget.bind(SC.Widget.Events.PAUSE, function () { setPlayStateUI(false); });
            vocalWidget.bind(SC.Widget.Events.FINISH, function () { setPlayStateUI(false); updateWaveUI(0); });
            vocalWidget.bind(SC.Widget.Events.PLAY_PROGRESS, function (e) {
                if (activePlayer === 'vocal') updateWaveUI(e.currentPosition);
            });

            // Instrumental setup (if available)
            if (scInst && typeof SOUNDCLOUD_URL_INSTRUMENTAL !== 'undefined' && SOUNDCLOUD_URL_INSTRUMENTAL) {
                scInst.src = SOUNDCLOUD_URL_INSTRUMENTAL;
                instWidget = SC.Widget(scInst);

                // Show mode switch
                var modeSwitch = $('lw-mode-switch');
                if (modeSwitch) {
                    modeSwitch.style.display = 'flex';
                }

                instWidget.bind(SC.Widget.Events.READY, function () {
                    instWidget.setVolume(100);
                });
                instWidget.bind(SC.Widget.Events.PLAY, function () { setPlayStateUI(true); });
                instWidget.bind(SC.Widget.Events.PAUSE, function () { setPlayStateUI(false); });
                instWidget.bind(SC.Widget.Events.FINISH, function () { setPlayStateUI(false); updateWaveUI(0); });
                instWidget.bind(SC.Widget.Events.PLAY_PROGRESS, function (e) {
                    if (activePlayer === 'instrumental') updateWaveUI(e.currentPosition);
                });
            }
        });

        bindEvents();
        updateDisplay();
    }

    function bindEvents() {
        var btnPrev = $('btnVorige');
        var btnNext = $('btnVolgende');
        var btnToggle = $('btnWissel');
        var btnHideAll = $('btnVerbergAlles');
        var btnShowAll = $('btnToonAlles');
        var btnPrint = $('btnAfdrukken');

        // Custom audio player controls
        var playBtn = $('lw-play-btn');
        var seekSlider = $('lw-seek-slider');
        var modeBtns = $$('.lw-mode-btn');

        if (btnPrev) btnPrev.onclick = function () { if (currentIndex > 0) { currentIndex--; updateDisplay(); scrollToCurrentParagraph(); } };
        if (btnNext) btnNext.onclick = function () { if (currentIndex < totalParagraphs - 1) { currentIndex++; updateDisplay(); scrollToCurrentParagraph(); } };
        if (btnToggle) btnToggle.onclick = toggleCurrentParagraph;
        if (btnHideAll) btnHideAll.onclick = function () { setAllParagraphs(true); };
        if (btnShowAll) btnShowAll.onclick = function () { setAllParagraphs(false); };
        if (btnPrint) btnPrint.onclick = handlePrint;

        // Play/Pause button
        if (playBtn) {
            playBtn.onclick = function () {
                var widget = activePlayer === 'vocal' ? vocalWidget : instWidget;
                if (widget) widget.toggle();
            };
        }

        // Mode switch buttons (Vocal/Instrumental)
        for (var m = 0; m < modeBtns.length; m++) {
            modeBtns[m].onclick = function () {
                var newMode = this.getAttribute('data-mode');
                if (newMode === activePlayer) return;

                // Update button UI
                for (var n = 0; n < modeBtns.length; n++) {
                    modeBtns[n].classList.remove('active');
                }
                this.classList.add('active');

                // Switch audio
                var statusEl = $('lw-track-status');
                if (newMode === 'instrumental' && vocalWidget && instWidget) {
                    vocalWidget.getPosition(function (pos) {
                        vocalWidget.pause();
                        instWidget.seekTo(pos);
                        if (isPlaying) instWidget.play();
                        activePlayer = 'instrumental';
                        if (statusEl) statusEl.textContent = 'INSTRUMENTAL';
                    });
                } else if (newMode === 'vocal' && vocalWidget && instWidget) {
                    instWidget.getPosition(function (pos) {
                        instWidget.pause();
                        vocalWidget.seekTo(pos);
                        if (isPlaying) vocalWidget.play();
                        activePlayer = 'vocal';
                        if (statusEl) statusEl.textContent = 'VOCAL';
                    });
                }
            };
        }

        // Seek slider
        if (seekSlider) {
            seekSlider.onmousedown = function () {
                isSeeking = true;
            };

            seekSlider.ontouchstart = function () {
                isSeeking = true;
            };

            seekSlider.oninput = function () {
                var ms = parseInt(this.value);
                var timeDisplay = $('lw-time-display');
                if (timeDisplay) timeDisplay.textContent = formatTime(ms);

                // Visual feedback during drag
                var percent = audioDuration > 0 ? (ms / audioDuration) : 0;
                var activeIndex = Math.floor(percent * waveBars.length);
                for (var i = 0; i < waveBars.length; i++) {
                    if (i <= activeIndex) {
                        waveBars[i].classList.add('active');
                    } else {
                        waveBars[i].classList.remove('active');
                    }
                }
            };

            seekSlider.onchange = function () {
                var ms = parseInt(this.value);
                var widget = activePlayer === 'vocal' ? vocalWidget : instWidget;
                if (widget) widget.seekTo(ms);
                isSeeking = false;
            };

            seekSlider.onmouseup = function () {
                isSeeking = false;
            };

            seekSlider.ontouchend = function () {
                isSeeking = false;
            };
        }

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
