/* Free and open source: see licence.txt.

The Wrap viewer for web-based slide presentations.

A single web page contains a series of slides forming a presentation.
Each slide uses the 'section', 'aside', or 'template' tag.  Sections are the
main slides.  An aside is a slide which is only shown if a link to it is
followed, though it is included if the slides are printed.  A template contains
div elements such as icons and navigation links which are copied into
every slide which is based on that template.  Features are:

- Single-signon ticket parameters are removed from URLs.
- The current slide is remembered in the browser and restored on returning.
- Visiting url#42 overrides the remembered slide and loads slide 42.
- Clicking on the page number produces e.g. url#42 that can be bookmarked.
- Different slides can be based on different templates.
- A slide number and navigation links can be added to a slide automatically.
- Slides are numbered 1,2,3... and asides after slide 3 are named 3a,3b,3c...
- Program text is automatically resized to fit available width and height.
- Program text can be highlighted using the hljs library.
- Program text can have a filename or a link to a file added automatically.
- Links can be made to jump to other slides or asides.
- A child window, controlled by the current one, is created with ALT+w.
- The slides can be printed to a PDF file (Alt+p prepares for printing).
- An animation can be added to a slide.
*/

'use strict';

// Initialise the wrap viewer.
var wrap = newWrap();
function newWrap() {
    // Define the global variables used by the viewer and set it going on load.
    // Make doKey a public method, in case this is a child window.
    var url, slides, slide, languages, animation, child, swipeX, swipeY;
    window.addEventListener("load", start);
    window.addEventListener("resize", resize);
    return { doKey: doKey };

    // Prepare everything.  Process program text after fonts are loaded.
    function start() {
        child = undefined;
        removeTicket();
        url = getURL();
        slides = getSlides();
        addNames(slides);
        applyTemplates(slides);
        addNavigation(slides);
        getAnimations(slides);
        wireUpLinks(slides);
        getBookmark();
        findLanguages();
        loadFonts();
        document.onkeydown = keyDown;
        document.fonts.ready.then(processPrograms);
    }

    // Get rid of a Single-Sign-On ticket on the URL, if any
    function removeTicket() {
        var here = location.href;
        var ticket = here.indexOf('?ticket=');
        if (ticket < 0) return;
        here = here.substring(0, ticket);
        if (history && history.replaceState) history.replaceState('','',here);
        else location.href = here;
    }

    // Get the url of the current page, without query or fragment suffixes.
    function getURL() {
        var here = location.href;
        var pos = here.indexOf('?');
        if (pos >= 0) here = here.substring(0, pos);
        pos = here.indexOf('#');
        if (pos >= 0) here = here.substring(0, pos);
        return here;
    }

    // Divide the page into slides, and return a table of slides.  The slides
    // are the top level elements, classified according to their tag names into
    // templates, sections and asides.  The slides are allocated sequential
    // ids, used as keys in the slides table.  If a slide has an explicit id
    // attribute, it acts as a synonym, i.e. an extra key in the table.  The
    // first section slide is given the synonym 'title'.  The default template,
    // with no id attribute, is given the synonym 'template'.
    function getSlides() {
        var body = document.body;
        var id = 0;
        var slides = [];
        var titleFound = false;
        for (var i=0; i<body.children.length; i++) {
            var node = body.children[i];
            var tag = node.tagName.toLowerCase();
            var slide = { id: id++ };
            if (tag == 'template') slide.type = 'template';
            else if (tag == 'section') slide.type = 'section';
            else if (tag == 'aside') slide.type = 'aside';
            else slide.type = "?";
            slide.node = node;
            if (slide.type == 'template' && node.content) {
                slide.node = document.importNode(node.content, true);
            }
            slides[slide.id] = slide;
            if (node.id) slides[node.id] = slide;
            if (slide.type == 'section' && ! titleFound) {
                slides['title'] = slide;
                titleFound = true;
            }
            if (slide.type == 'template' && ! node.id) {
                slides['template'] = slide;
            }
        }
        return slides;
    }

    // Create a name for each section slide, and aside, for display. Section
    // slides are main-sequence slides numbered from 1.  Asides are not
    // displayed, other than by following links, and are named according to the
    // preceding section slide, e.g. 3a, 3b,...  Back and next ids are stored
    // for sequential navigation between slides.
    function addNames(slides) {
        var sections = [];
        for (var i=0; i<slides.length; i++) {
            if (slides[i].type == 'section') sections.push(slides[i]);
        }
        var letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var sectionNo = -1, asideNo = -1;
        for (var i=0; i<slides.length; i++) {
            var slide = slides[i];
            if (slide.type == 'section') {
                sectionNo++;
                slide.name = "" + (1 + sectionNo);
                if (sectionNo == 0) slide.back = null;
                else slide.back = sections[sectionNo-1].id;
                if (sectionNo == sections.length - 1) slide.next = null;
                else slide.next = sections[sectionNo+1].id;
                asideNo = -1;
            } else if (slide.type == 'aside') {
                asideNo++;
                if (slide.id == 0) slide.back = null;
                else slide.back = slide.id - 1;
                if (slide.id == slides.length - 1) slide.next = null;
                else slide.next = slide.id + 1;
                slide.name = "" + (1 + sectionNo) + letters.charAt(asideNo);
            }
            else continue;
        }
    }

    // For each slide, add the default style, and copy the elements into it from
    // its template.  A class attribute may specify a non-default template.
    function applyTemplates(slides) {
        for (var id=0; id<slides.length; id++) {
            var slide = slides[id];
            if (slide.type != 'section' && slide.type != 'aside') continue;
            slide.node.style.position = 'relative';
            slide.node.style.display = "none";
            var template = slides['template'];
            var classes = slide.node.classList;
            for (var c=0; c<classes.length; c++) {
                var cls = classes[c];
                if (slides[cls]) template = slides[cls];
            }
            if (template) {
                var templateChildren = template.node.children;
                for (var t=0; t<templateChildren.length; t++) {
                    var child = templateChildren[t];
                    slide.node.appendChild(child.cloneNode(true));
                }
            }
        }
    }

    // Add navigation to each slide.  Replace the contents of .here with the
    // slide name and attach the makeBookmark function. Make .back and .next
    // links point to previous and next slides. Make .up and .down links point
    // to the previous and next section.
    function addNavigation(slides) {
        var up = slides[0].name, down = slides[0].name;
        for (var id=0; id<slides.length; id++) {
            var slide = slides[id];
            if (slide.type != 'section' && slide.type != 'aside') continue;
            var thisUp = slide.node.dataset.up;
            var thisDown = slide.node.dataset.down;
            if (thisDown) down = thisDown;
            slide.node.ontouchstart = grab;
            slide.node.ontouchend = drag;
            var links = slide.node.getElementsByTagName('a');
            for (var i=0; i<links.length; i++) {
                var link = links[i];
                if (! link.classList) continue;
                if (link.classList.contains('up')) {
                    if (! slide.back) link.style.visibility = 'hidden';
                    else if (thisUp) link.href = '#' + thisUp;
                    else link.href = '#' + up;
                }
                if (link.classList.contains('back')) {
                    if (! slide.back) link.style.visibility = 'hidden';
                    else link.href = '#' + slide.back;
                }
                else if (link.classList.contains('here')) {
                    link.href = '#' + slide.id;
                    link.onclick = makeBookmark;
                }
                else if (link.classList.contains('next')) {
                    if (! slide.next) link.style.visibility = 'hidden';
                    else link.href = '#' + slide.next;
                }
                if (link.classList.contains('down')) {
                    if (! slide.next) link.style.visibility = 'hidden';
                    else link.href = '#' + down;
                }
            }
            if (thisUp) up = slide.name;
            var here = slide.node.querySelector(".here");
            if (! here) continue;
            while (here.firstChild) here.removeChild(here.firstChild);
            here.appendChild(document.createTextNode(slide.name));
        }
    }

    // Find any animation there might be on each slide.
    function getAnimations(slides) {
        for (var id=0; id<slides.length; id++) {
            var slide = slides[id];
            if (slide.type != 'section' && slide.type != 'aside') continue;
            var ann = slide.node.dataset.animate;
            if (ann && window[ann]) slide.animation = window[ann];
        }
    }

    // Wire up the links which jump between slides.
    function wireUpLinks(slides) {
        var links = document.getElementsByTagName("a");
        for (var i=0; i<links.length; i++) {
            var link = links[i];
            if (link.classList.contains("jump")) {
                link.onclick = function(e) { jump(e); }
            }
        }
    }

    // Follow a jump link.  Note: the browser extends "#name" to "url#name".
    function jump(e) {
        var id = e.target.href;
        id = id.substring(id.indexOf('#') + 1);
        show(id);
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    // Explicitly start loading all the fonts.  Otherwise, fonts which happen
    // not to appear on the initially displayed slide are not loaded by the
    // time resizeProgram is called, leading to incorrect measurements.
    function loadFonts() {
        var list = document.fonts.values();
        var item = list.next();
        while (! item.done) {
            item.value.load();
            item = list.next();
        }
    }

    // Adjust program text in pre elements.  Do highlighting before resizing, in
    // case it affects the text size.
    function processPrograms() {
        var pres = document.querySelectorAll('pre');
        for (var i=0; i<pres.length; i++) {
            var pre = pres[i];
            highlightProgram(pre);
            resizeProgram(pre);
            labelProgram(pre);
        }
    }

    // On a window resize, re-process the programs.
    function resize() {
        var pres = document.querySelectorAll('pre');
        for (var i=0; i<pres.length; i++) {
            var pre = pres[i];
            resizeProgram(pre);
        }
    }

    // Remove an initial newline from a pre, to avoid a gap, and highlight.
    function highlightProgram(pre) {
        var text = pre.textContent;
        if (text.startsWith("\n")) text = text.substring(1);
        else if (text.startsWith("\r\n")) text = text.substring(2);
        if (typeof hljs != 'undefined') return;
        var lang = getLanguage(pre);
        if (lang == undefined) return;
        text = hljs.highlight(lang, text, true).value;
        pre.innerHTML = text;
        pre.classList.add("hljs");
    }

    // Reduce the font size of a pre element, until the text fits.
    // Even with a monospaced web-font, pixel measurements differ between
    // browsers, because of sub-pixel rendering, so measurement is dynamic.
    // Every page must contain some text in the program font, e.g. the page
    // number, otherwise there may be no visible text in the program font when
    // the presentation is loaded, so the browser doesn't load the font by the
    // time this function is called.
    function resizeProgram(pre) {
        var style = getComputedStyle(pre);
        var size = parseInt(style.fontSize);
        while (overflow(pre) && size > 10) {
            size--;
            pre.style.fontSize = size + "px";
        }
    }

    //  Add a filename to a pre as a top right overlay, possibly as a link.
    function labelProgram(pre) {
        var path = document.body.dataset.path;
        var file = pre.dataset.file;
        var name = pre.dataset.name;
        if (! file && ! name) return;
        var label;
        if (file) {
            label = document.createElement('a');
            if (path) label.href = path + file;
            else label.href = file;
        }
        else if (name) {
            label = document.createElement('span');
        }
        label.appendChild(document.createTextNode(file || name));
        label.style.float = "right";
        label.style.margin = "0";
        label.style.color = "green";
        label.style.backgroundColor = "#bee";
        pre.insertBefore(label, pre.firstChild);
    }

    // Find the language of a node, or undefined if there isn't one or if the
    // language found isn't recognised by hljs.
    function getLanguage(node) {
        var lang = node.dataset.lang;
        if (languages.indexOf(lang) >= 0) return lang;
        if (lang != undefined) return undefined;
        lang = document.body.dataset.lang;
        if (languages.indexOf(lang) >= 0) return lang;
        return undefined;
    }

    // Find the languages and aliases that hljs, as currently included in the
    // presentation, supports.
    function findLanguages() {
        languages = [];
        if (typeof hljs == 'undefined') return;
        var list = hljs.listLanguages();
        for (var i=0; i<list.length; i++) {
            languages.push(list[i]);
            var aliases = hljs.getLanguage(list[i]).aliases;
            if (aliases == undefined) continue;
            for (var a=0; a<aliases.length; a++) languages.push(aliases[a]);
        }
    }

    // Check whether the text in a (pre) element overflows its container. The
    // element has to be cloned and displayed off-screen to be measured, because
    // the original has display=none. It is assumed that the parent element is a
    // section representing a slide. The parent has to be cloned to make the
    // measurements accurate.
    function overflow(element) {
        var parent = element.parentNode;
        var index = Array.prototype.indexOf.call(parent.children, element);
        var parent2 = parent.cloneNode(true);
        parent2.style.position = 'relative';
        parent2.style.top = '2000px';
        parent2.style.display = "block";
        document.body.appendChild(parent2);
        var element2 = parent2.children[index];
        var result =
            element2.scrollWidth > element2.clientWidth ||
            element2.scrollHeight > element2.clientHeight;
        document.body.removeChild(parent2);
        return result;
    }

    // Remember the current section id using localStorage.
    function setBookmark() {
        localStorage.setItem(url+"#slide", slide.id);
    }

    // Change the url to refer to the current slide, for bookmarking.
    function makeBookmark(e) {
        e.stopPropagation();
        e.preventDefault();
        var mark = url + "#" + slide.id;
        if (history && history.replaceState) history.pushState({},'',mark);
    }

    // Get the remembered slide or aside.  Allow #id on the url to override it.
    function getBookmark() {
        var here = location.href;
        var pos = here.indexOf('?');
        if (pos >= 0) here = here.substring(0, pos);
        pos = here.indexOf('#');
        if (pos >= 0) {
            here = here.substring(pos+1);
            if (here in slides && slides[here].type != 'template') {
                show(here);
                return;
            }
        }
        var id = localStorage.getItem(url+"#slide");
        if (id in slides && slides[id].type != 'template') show(id);
        else show('title');
    }

    // Display a slide or aside
    function show(id, back) {
        if (animation) {
            animation.stop();
            animation = null;
        }
        if (slide) slide.node.style.display = 'none';
        slide = slides[id];
        if (! slide) slide = slides['title'];
        slide.node.style.display = 'block';
        setBookmark(slide.id);
        if (slide.animation) {
            animation = slide.animation;
            animation.init(slide.node);
            if (back) animation.end();
            else animation.start();
        }
    }

    // Catch a key event. Ignore events which have already been processed.
    // Ignore function keys, and most alt or meta combinations, which are likely
    // to be browser shortcuts, other than Alt+w and Alt+p. Ignore Ctrl+c to
    // allow copying. Ignore raw modifier key events. Handle the key, and
    // duplicate it on the child window, if any.
    function keyDown(event) {
        var key = event.key, shift = event.shiftKey, ctrl = event.ctrlKey;
        if (event.defaultPrevented) return;
        if (key.length > 1 && key[0] == 'F') return;
        if (ctrl && key == 'c') return;
        if (event.altKey || event.metaKey) {
            if (key == 'w') createChild();
            else if (key == 'p') preview();
            else return;
        }
        if (key == 'Shift' || key == 'Control') return;
        event.preventDefault();
        event.stopPropagation();
        doKey(key, shift, ctrl);
        if (child) child.wrap.doKey(key, shift, ctrl);
    }

    // Create a child window, driven from this one.
    function createChild() {
        child = window.open(url, "child");
    }

    // Deal with key press from this window or the parent window.  Offer the
    // key to the animation, if any, otherwise navigate.
    function doKey(key, shift, ctrl) {
        var used = false;
        if (animation && animation.key) used = animation.key(key, shift, ctrl);
        if (used) return;

        if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
            if (slide.next != undefined) show(slide.next);
        }
        else if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
            if (slide.back != undefined) show(slide.back, true);
        }
    }

    // Deal with the start of a drag/swipe gesture with mouse or touch.
    function grab(e) {
        if (e.changedTouches) e = e.changedTouches[0];
        swipeX = e.clientX;
        swipeY = e.clientY;
    }

    // Deal with the end of a drag/swipe gesture with mouse or touch. A swipe
    // has to be more horizontal than vertical and at least 10 pixels.
    function drag(e) {
        if (e.changedTouches) e = e.changedTouches[0];
        if (Math.abs(e.clientX - swipeX) <= Math.abs(e.clientY - swipeY)) return;
        if (e.clientX > swipeX + 10) {
            if (slide.back != undefined) show(slide.back);
        } else if (e.clientX < swipeX - 10) {
            if (slide.next != undefined) show(slide.next);
        }
    }

    // Prepare for printing by making all slides visible, and fast-forwarding
    // all animations to the end.
    function preview() {
        if (animation) { animation.stop(); animation = null; }
        for (var i=0; i<slides.length; i++) {
            var slide = slides[i];
            if (slide.type == 'section' || slide.type == 'aside') {
                slide.node.style.position = 'relative';
                slide.node.style.display = 'block';
                slide.node.style.width = '1024px';
                slide.node.style.height = '768px';
                slide.node.style.minHeight = '0';
                if (slide.animation) {
                    slide.animation.init(slide.node);
                    slide.animation.end();
                }
            }
        }
    }

    // End of wrap function and module.
}
