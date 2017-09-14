// Draw a diagram on a canvas in stages.
"use strict";

// The animation object, with the methods required by Wrap.
var draw = newDraw();

function newDraw() {
    var canvas, brush, time;
    return { init: init, start: start, stop: stop, end: end, key: key };

    function init(slide) {
        canvas = slide.querySelector("canvas");
        brush = canvas.getContext("2d");
        time = 0;
        brush.strokeRect(200, 200, 100, 50);
    }

    function start() {
    }

    function stop() {
    }

    function end() {
    }

    function key(event) {
    }
}
