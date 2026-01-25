/**
 * LearnWorlds Audio-Text Embed Component
 * Version: 2.0.0 - Multi-page print support
 * 
 * Features:
 * - Paragraph navigation with keyboard support
 * - Hide/show words in parentheses
 * - SoundCloud integration
 * - Multi-page print support
 */
(function() {
    'use strict';

    var currentIndex = 0;
    var totalParagraphs = 0;
    var paragraphStates = []; // true = hidden, false = visible

    // Helper functions
    function $(id) {
        return document.getElementById(id);
    }

    function $$(selector) {
        return document.querySelectorAll(selector);
    }

    // Initialize the component
    function initialize() {
        // Set title and author
        var titleEl = $('lw-titel');
        var authorEl = $('lw-auteur');

        if (titleEl && typeof LIED_TITEL !== 'undefined') {
            titleEl.textContent = LIED_TITEL;
        }

        if (authorEl && typeof LIED_AUTEUR !== 'undefined') {
            authorEl.textContent = LIED_AUTEUR;
        }

        // Get content container
        var container = $('lw-tekst');
        if (!container || typeof TEKST_INHOUD === 'undefined') {
            return;
        }

        // Parse content and create structure
        var temp = document.createElement('div');
        temp.innerHTML = TEKST_INHOUD;
        var paragraphs = temp.querySelectorAll('p');
        totalParagraphs = paragraphs.length;

        if (totalParagraphs === 0) {
            return;
        }

        // Build HTML with wrapped words
        var html = '';
        for (var i = 0; i < paragraphs.length; i++) {
            // Replace (word) with span.lw-word
            var content = paragraphs[i].innerHTML.replace(
                /\(([^)]+)\)/g,
                '<span class="lw-word">$1</span>'
            );

            html += '<div class="lw-para-wrap" data-idx="' + i + '">';
            html += '<p data-i="' + i + '">' + content + '</p>';
            html += '<div class="lw-inline-btns">';
            html += '<button class="lw-inline-btn hide-btn" data-i="' + i + '">▼</button>';
            html += '<button class="lw-inline-btn show-btn show" data-i="' + i + '">▲</button>';
            html += '</div></div>';

            paragraphStates[i] = false;
        }

        container.innerHTML = html;

        // Set SoundCloud URL
        var scIframe = $('lw-sc');
        if (scIframe && typeof SOUNDCLOUD_URL !== 'undefined' && SOUNDCLOUD_URL) {
            scIframe.src = SOUNDCLOUD_URL;
        }

        // Bind button events
        bindEvents();

        // Initial update
        updateDisplay();
    }

    // Bind all event handlers
    function bindEvents() {
        var btnPrev = $('btnVorige');
        var btnNext = $('btnVolgende');
        var btnToggle = $('btnWissel');
        var btnHideAll = $('btnVerbergAlles');
        var btnShowAll = $('btnToonAlles');
        var btnPrint = $('btnAfdrukken');

        if (btnPrev) {
            btnPrev.onclick = function() {
                if (currentIndex > 0) {
                    currentIndex--;
                    updateDisplay();
                    scrollToCurrentParagraph();
                }
            };
        }

        if (btnNext) {
            btnNext.onclick = function() {
                if (currentIndex < totalParagraphs - 1) {
                    currentIndex++;
                    updateDisplay();
                    scrollToCurrentParagraph();
                }
            };
        }

        if (btnToggle) {
            btnToggle.onclick = toggleCurrentParagraph;
        }

        if (btnHideAll) {
            btnHideAll.onclick = function() {
                setAllParagraphs(true);
            };
        }

        if (btnShowAll) {
            btnShowAll.onclick = function() {
                setAllParagraphs(false);
            };
        }

        if (btnPrint) {
            btnPrint.onclick = handlePrint;
        }

        // Paragraph click events
        var wrappers = $$('.lw-para-wrap');
        for (var j = 0; j < wrappers.length; j++) {
            var paragraph = wrappers[j].querySelector('p');
            if (paragraph) {
                paragraph.onclick = function(e) {
                    var wrap = e.target.closest('.lw-para-wrap');
                    if (!wrap) return;

                    var paraIdx = parseInt(wrap.getAttribute('data-idx'));

                    // Remove selected class from all
                    var allWraps = $$('.lw-para-wrap');
                    for (var k = 0; k < allWraps.length; k++) {
                        allWraps[k].classList.remove('selected');
                    }

                    // Add selected class to clicked
                    wrap.classList.add('selected');
                    currentIndex = paraIdx;
                    updateDisplay();
                };
            }
        }

        // Inline hide/show buttons
        var hideBtns = $$('.hide-btn');
        var showBtns = $$('.show-btn');

        for (var h = 0; h < hideBtns.length; h++) {
            hideBtns[h].onclick = function(e) {
                e.stopPropagation();
                var paraIdx = parseInt(this.getAttribute('data-i'));
                hideParagraph(paraIdx);
            };
        }

        for (var s = 0; s < showBtns.length; s++) {
            showBtns[s].onclick = function(e) {
                e.stopPropagation();
                var paraIdx = parseInt(this.getAttribute('data-i'));
                showParagraph(paraIdx);
            };
        }
    }

    // Hide words in a specific paragraph
    function hideParagraph(paraIdx) {
        var p = document.querySelector('[data-i="' + paraIdx + '"]');
        if (!p) return;

        paragraphStates[paraIdx] = true;
        var words = p.querySelectorAll('.lw-word');
        for (var i = 0; i < words.length; i++) {
            words[i].classList.add('hide');
        }
        updateDisplay();
    }

    // Show words in a specific paragraph
    function showParagraph(paraIdx) {
        var p = document.querySelector('[data-i="' + paraIdx + '"]');
        if (!p) return;

        paragraphStates[paraIdx] = false;
        var words = p.querySelectorAll('.lw-word');
        for (var i = 0; i < words.length; i++) {
            words[i].classList.remove('hide');
        }
        updateDisplay();
    }

    // Update the display (indicator, active state, toggle button)
    function updateDisplay() {
        // Update indicator
        var indicator = $('lw-ind');
        if (indicator) {
            indicator.textContent = (currentIndex + 1) + '/' + totalParagraphs;
        }

        // Update active paragraph
        var paragraphs = $$('[data-i]');
        for (var i = 0; i < paragraphs.length; i++) {
            if (paragraphs[i].tagName === 'P') {
                paragraphs[i].classList.remove('active');
            }
        }

        var currentPara = document.querySelector('p[data-i="' + currentIndex + '"]');
        if (currentPara) {
            currentPara.classList.add('active');
        }

        // Update toggle button text
        var toggleBtn = $('btnWissel');
        if (toggleBtn) {
            toggleBtn.textContent = paragraphStates[currentIndex] ? 'Tonen' : 'Verbergen';
            toggleBtn.classList.toggle('on', paragraphStates[currentIndex]);
        }
    }

    // Scroll to current paragraph
    function scrollToCurrentParagraph() {
        var p = document.querySelector('p[data-i="' + currentIndex + '"]');
        if (p) {
            p.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }

    // Toggle current paragraph visibility
    function toggleCurrentParagraph() {
        var p = document.querySelector('p[data-i="' + currentIndex + '"]');
        if (!p) return;

        paragraphStates[currentIndex] = !paragraphStates[currentIndex];
        var words = p.querySelectorAll('.lw-word');

        for (var i = 0; i < words.length; i++) {
            words[i].classList.toggle('hide', paragraphStates[currentIndex]);
        }

        updateDisplay();
    }

    // Set all paragraphs to hidden or visible
    function setAllParagraphs(hidden) {
        var paragraphs = $$('p[data-i]');

        for (var i = 0; i < paragraphs.length; i++) {
            var idx = parseInt(paragraphs[i].getAttribute('data-i'));

            if (paragraphStates[idx] !== hidden) {
                paragraphStates[idx] = hidden;
                var words = paragraphs[i].querySelectorAll('.lw-word');

                for (var j = 0; j < words.length; j++) {
                    words[j].classList.toggle('hide', hidden);
                }
            }
        }

        updateDisplay();
    }

    // Handle print with multi-page support
    function handlePrint() {
        // Prepare for printing
        var mainContainer = document.querySelector('.lw-main');
        var contentContainer = document.querySelector('.lw-content');

        if (mainContainer) {
            // Temporarily remove fixed positioning issues
            mainContainer.style.paddingBottom = '0';
            mainContainer.style.overflow = 'visible';
            mainContainer.style.height = 'auto';
        }

        if (contentContainer) {
            contentContainer.style.overflow = 'visible';
            contentContainer.style.height = 'auto';
            contentContainer.style.maxHeight = 'none';
        }

        // Small delay to ensure styles are applied
        setTimeout(function() {
            window.print();

            // Restore styles after print dialog closes
            setTimeout(function() {
                if (mainContainer) {
                    mainContainer.style.paddingBottom = '';
                    mainContainer.style.overflow = '';
                    mainContainer.style.height = '';
                }
                if (contentContainer) {
                    contentContainer.style.overflow = '';
                    contentContainer.style.height = '';
                    contentContainer.style.maxHeight = '';
                }
            }, 500);
        }, 100);
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        setTimeout(initialize, 10);
    }
})();
