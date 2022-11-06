// Media animation to play a video/audio clip.
"use strict";

// The animation object.
var play = newPlay();

function newPlay() {
    var media, ended;
    return { init: init, start: start, stop: stop, end: end, key: key };

    function init(slide) {
        media = slide.querySelector("video");
        if (media == null) media = slide.querySelector("audio");
        media.onended = onended;
        ended = false;
    }

    function onended() {
        ended = true;
    }

    // Don't autoplay; start the clip with a key press.
    function start() {
        media.currentTime = 0;
    }

    function stop() {
        media.pause();
    }

    function end() {
        ended = true;
    }

    // Control the clip with the usual keys.
    function key(key, shift, ctrl) {
        if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
            if (ended) {
                return false;
            }
            if (media.currentTime == 0 || media.paused) {
                media.play();
            }
            else {
                media.pause();
                ended = true;
            }
            return true;
        }
        if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
            if (media.currentTime == 0) return false;
            if (media.paused || ended) {
                media.currentTime = 0;
                ended = false;
            }
            else media.pause();
            return true;
        }
        return false;
    }
}
