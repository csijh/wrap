/* Free and open source: see licence.txt.

The Wrap viewer for web-based slide presentations.

A single web page contains a series of slides forming a presentation.
Each slide uses the 'section', 'aside', or 'template' tag.  Sections are the
main slides.  An aside is a slide which is only shown if a link to it is
followed, though it is included if the slides are printed.  A template contains
div elements such as icons and navigation links which are copied into
every slide which is based on that template.  Features are:

- Slides are 1024x768 pixels, to fit old VGA projectors.
- Single-signon ticket parameters are removed from the URL.
- The current slide is remembered in the browser and restored on returning.
- Visiting url#42 overrides the remembered slide and loads slide 42.
- Different slides can be based on different templates.
- A slide number and navigation links can be added to a slide automatically.
- Slides are numbered 1,2,3... and asides after slide 3 are named 3a,3b,3c...
- Program text is automatically resized to fit available width.
- Program text can be highlighted using the hljs library.
- Program text can have a filename or a link to a file added automatically.
- Links can be made to jump to other slides or asides.
- The slides can be printed to a PDF file ('p' prepares for printing).
- An animation can be added to a slide.
- Prev goes to the end of the animation on the previous slide.
TODO
- Key presses are offered to the animation, and otherwise used for navigation.
- Key presses and their timings can be recorded to accompany a screencast.
- Live programming is supported, if the server supports it.
- Create sketch animations, typing animations etc.

- Make defs for PU/PD and arrow keys, but not for space/Enter/BS which might be
  needed for editing on screen,  Offer key presses to animations first.
  Animations can use PU = stop or skip-back/prev and
  PD = start or skip/next
  Home/End
*/

'use strict';

// Initialise the wrap viewer.
wrap();
function wrap() {
    // Child window, for extended desktop situations.  The keypresses in the
    // parent window are sent to the child, so the two windows stay in step.
    // The parent is a previewer and controller for the child off screen.
    var child = undefined;
    wrap.doKey = doKey;

    // Make slides 1024x768 for old VGA projectors.  Subtract 3 from the height
    // if projecting from a Chromebook.
    var screenWidth = 1024, screenHeight = 765;

    // Define the global variables used by the viewer and set it going on load.
    var url, slides, slide, animation;
    window.addEventListener("load", start);
    return;

    // Prepare everything.  Since processing program text takes time, delay it
    // so that the page loads in the meantime.
    function start() {
        removeTicket();
        url = getURL();
        slides = getSlides();
        addNames(slides);
        applyTemplates(slides);
        addNavigation(slides);
        getAnimations(slides);
        addCanvasOverlays(slides);
        wireUpLinks(slides);
        getBookmark();
        document.onkeydown = keyPress;
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
    // preceding section slide, e.g. 3a, 3b,...  Prev and next ids are stored
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
                if (sectionNo == 0) slide.prev = null;
                else slide.prev = sections[sectionNo-1].id;
                if (sectionNo == sections.length - 1) slide.next = null;
                else slide.next = sections[sectionNo+1].id;
                asideNo = -1;
            } else if (slide.type == 'aside') {
                asideNo++;
                if (slide.id == 0) slide.prev = null;
                else slide.prev = slide.id - 1;
                if (slide.id == slides.length - 1) slide.next = null;
                else slide.next = slide.id + 1;
                slide.name = "" + (1 + sectionNo) + letters.charAt(asideNo);
            }
            else continue;
        }
    }

    // For each slide, add the default style, and copy the divs into it from
    // its template.  A class attribute may specify a non-default template.
    function applyTemplates(slides) {
        for (var id=0; id<slides.length; id++) {
            var slide = slides[id];
            if (slide.type != 'section' && slide.type != 'aside') continue;
            slide.node.style.position = 'relative';
            slide.node.style.width = screenWidth + "px";
            slide.node.style.height = screenHeight + "px";
            var template = slides['template'];
            var classes = slide.node.classList;
            for (var c=0; c<classes.length; c++) {
                var cls = classes[c];
                if (slides[cls]) template = slides[cls];
            }
            if (template) {
                var templateChildren = template.node.querySelectorAll("div");
                for (var t=0; t<templateChildren.length; t++) {
                    var child = templateChildren[t];
                    child.style.display = 'block';
                    slide.node.appendChild(child.cloneNode(true));
                }
            }
        }
    }

    // Add navigation to each slide.  Replace the contents of .here with the
    // name, and make .prev and .next links point to previous and next slides.
    function addNavigation(slides) {
        for (var id=0; id<slides.length; id++) {
            var slide = slides[id];
            if (slide.type != 'section' && slide.type != 'aside') continue;
            var links = slide.node.getElementsByTagName('a');
            for (var i=0; i<links.length; i++) {
                var link = links[i];
                if (! link.classList) continue;
                if (link.classList.contains('prev')) {
                    if (! slide.prev) link.style.visibility = 'hidden';
                    else link.href = '#' + slide.prev;
                }
                else if (link.classList.contains('next')) {
                    if (! slide.next) link.style.visibility = 'hidden';
                    else link.href = '#' + slide.next;
                }
            }
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

    // Create full-sreen canvas overlays for animations to draw on.  One is
    // needed per animated slide, so that printing works properly.
    function addCanvasOverlays(slides) {
        for (var id=0; id<slides.length; id++) {
            var slide = slides[id];
            if (! slide.animation) continue;
            var canvas = document.createElement("canvas");
            canvas.width = "1024";
            canvas.height = "768";
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.pointerEvents = "none";
            var brush = canvas.getContext("2d");
            brush.font = "32px SourceCode";
            slide.node.appendChild(canvas);
            slide.canvas = canvas;
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

    // Follow a jump link.  Note browser extends "#name" to "url#name".
    function jump(e) {
        var id = e.target.href;
        id = id.substring(id.indexOf('#') + 1);
        show(id);
        e.stopPropagation();
        e.preventDefault();
        return false;
    }

    // Highlight and resize program text in pre elements.  Do the highlighting
    // first, in case it affects the text size.
    function processPrograms() {
        highlightPrograms();
        resizePrograms();
    }

    // If hljs is loaded, find all program fragments and highlight them.  Also
    // add an optional link to a program file, or just a program filename.
    // Take the language from the filename, if necessary.
    function highlightPrograms() {
        if (typeof hljs == undefined) return;
        var languages = [
            "html", "xml", "c", "cpp", "makefile", "haskell", "bash", "sh",
            "javascript", "js", "sql", "java", "http", "css"];
        var pres = document.querySelectorAll('pre');
        for (var i=0; i<pres.length; i++) {
            var pre = pres[i];
            var classes = pre.classList;
            var file = pre.dataset.file;
            var name = pre.dataset.name;
            if (file) {
                var lang = file.substr(file.lastIndexOf('.')+1);
                if (languages.indexOf(lang) >= 0 && ! classes.contains(lang)) {
                    pre.className += " " + lang;
                }
            }
            if (name) {
                var lang;
                if (name.indexOf('.') >= 0)
                    lang = name.substr(name.lastIndexOf('.')+1);
                else if (name.indexOf(' ') >= 0)
                    lang = name.substr(name.lastIndexOf(' ')+1);
                else lang = name;
                if (languages.indexOf(lang) >= 0 && ! classes.contains(lang)) {
                    pre.className += " " + lang;
                }
            }
            var isCode = false;
            for (var n=0; n<classes.length; n++) {
                if (languages.indexOf(classes[n]) >= 0) isCode = true;
            }
            if (! isCode) continue;
            hljs.highlightBlock(pre);
            if (file) {
                var link = document.createElement('a');
                link.href = file;
                link.style.float = "right";
                link.style.margin = "0";
                link.style.color = "green";
                link.style.backgroundColor = "#bee";
                link.appendChild(document.createTextNode(file));
                pre.insertBefore(link, pre.firstChild);
            }
            if (name) {
                var span = document.createElement('span');
                span.style.float = "right";
                span.style.margin = "0";
                if (name.indexOf("bad") >= 0) span.style.color = "red";
                else span.style.color = "green";
                span.style.backgroundColor = "#bee";
                span.appendChild(document.createTextNode(name));
                pre.insertBefore(span, pre.firstChild);
            }
        }
    }

    // For each pre element, reduce the font size until the text fits.
    // Note: even with a monospaced web-font, pixel measurements differ
    // between browsers, because of sub-pixel rendering, so measurement
    // has to be dynamic.
    function resizePrograms() {
        var pres = document.querySelectorAll('pre');
        for (var n=0; n<pres.length; n++) {
            var pre = pres[n];
            var style = getComputedStyle(pre);
            var size = parseInt(style.fontSize);
            while (overflow(pre) && size > 10) {
                size--;
                pre.style.fontSize = size + "px";
            }
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
        parent2.style.position = 'absolute';
        parent2.style.top = '-1000px';
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

    // Get the remembered slide or aside.  Allow #id on the url to override it.
    function getBookmark() {
        var here = location.href;
        var pos = here.indexOf('?');
        if (pos >= 0) here = here.substring(0, pos);
        pos = here.indexOf('#');
        if (pos >= 0) {
            here = here.substring(pos+1);
            if (here in slides) { show(here); return; }
        }
        var id = localStorage.getItem(url+"#slide");
        if (id) show(id);
        else show(slides['title']);
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
            if (back) animation.end(slide.node, slide.canvas);
            else animation.start(slide.node, slide.canvas);
        }
    }

    // Deal with key presses in this window.
    function keyPress(event) {
        if (!event) event = window.event;
        var key = event.keyCode;
        var wKey = 87;
        if (key == wKey) {
            var pre = document.querySelector("#test");
            console.log("w", pre.style.fontSize, overflow(pre));
//            child = window.open("index.html", "child");
            return;
        }
        doKey(key);
        if (child) child.wrap.doKey(key);
    }

    // Deal with keypress from this window or the parent window.
    function doKey(key) {
        var enterKey = 13, spaceBar = 32, backSpace = 8;
        var cKey = 67, dKey = 68, nKey = 78, pKey = 80, rKey = 82, tKey = 84;
        var pageUp = 33, pageDown = 34, homeKey = 36, endKey = 35;
        var leftArrow = 37, upArrow = 38, rightArrow = 39, downArrow = 40;

        if (animation && animation.key) {
            var ok = animation.key(key);
            if (ok) return;
        }
        if (key == pageDown || key == rightArrow || key == downArrow ||
            key == spaceBar || key == enterKey) {
            if (slide.next) show(slide.next);
        }
        else if (key == pageUp || key == leftArrow || key == upArrow ||
                 key == backSpace) {
            if (slide.prev) show(slide.prev, true);
        }
        else if (key == pKey) preview();
    }

    // Offer text as a download
    function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' +
            encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    // Prepare for printing by making all slides visible, and fast-forwarding
    // all animations to the end.
    function preview() {
        if (animation) { animation.stop(); animation = null; }
        var style = "position: relative; display: block; width: 1024px;" +
            "height: 768px; minHeight: 0;";
        for (var i=0; i<slides.length; i++) {
            var slide = slides[i];
            if (slide.type == 'section' || slide.type == 'aside') {
                slide.node.style.cssText = style;
                if (slide.animation) {
                    slide.animation.end(slide.node, slide.canvas);
                }
            }
        }
    }

    // End of wrap function and module.
}
