// Simulate typing.  Acts on a <pre> element with class "data" and color white
// so that the text is invisible on loading.  The text is copied out and
// replaced with spaces, the color of the <pre> is reset, and then the text is
// copied back in one character at a time when any letter key is pressed.
"use strict";

type();
function type() {

    // Set up variables and methods.
    var slide, canvas, brush, data, target, pos, timer;
    type.start = start;
    type.stop = stop;
    type.end = end;
    type.key = key;
    return;

    // Given a slide element and canvas overlay, start the animation.
    function start(element, overlay) {
        init(element, overlay);
        var from = data;
        var to = "";
        for (var i=0; i<from.length; i++) {
            var ch = from.charAt(i);
            if (ch != '\n') ch = ' ';
            to = to + ch;
        }
        target.innerHTML = to;
        timer = null;
    }

    // Go straight to the end of the animation, either to prepare for printing,
    // or else because the user has moved back from the following slide. 
    function end(element, overlay) {
        init(element, overlay);
        target.innerHTML = data;
    }

    // Called from start and end to initialise
    function init(element, overlay) {
        slide = element;
        canvas = overlay;
        brush = canvas.getContext("2d");
        target = slide.querySelector(".type");
        data = target.textContent;
        var spaces = "";
        for (var i=0; i<data.length; i++) {
            if (data.charAt(i) == '\n') spaces += '\n';
            else spaces += ' ';
        }
        target.innerHTML = spaces;
        target.style.color = null;
        pos = 0;
    }

    function stop() {
        target.innerHTML = data;
    }

    // Animate the output of characters up to the next '$'.
    function output() {
        var from = data;
        if (pos >= from.length) return;
        var ch = from.charAt(pos);
        var to = target.textContent;
        to = to.substring(0, pos) + ch + to.substr(pos+1);
        target.innerHTML = to;
        pos++;
        if (ch == '$') clearInterval(timer);
    }

    function key(k) {
        var oKey = 79;
        if (k == oKey) timer = setInterval(output, 20);
        var from = data;
        if (pos >= from.length) return;
        var ch = from.charAt(pos);
        var to = target.textContent;
        to = to.substring(0, pos) + ch + to.substr(pos+1);
        target.innerHTML = to;
        pos++;
    }
}
