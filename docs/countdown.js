// Count down from 10 to 0.
"use strict";

// The animation object, with the methods required by Wrap.
var countdown = newCountdown();

function newCountdown() {
    var counter, time, timer;
    return { init: init, start: start, stop: stop, end: end, key: key };

    function init(slide) {
        counter = slide.querySelector(".counter");
        timer = null;
    }

    // Start the animation.
    function start() {
        setTime(10);
        startTimer();
    }

    // Stop the animation.
    function stop() {
        stopTimer();
    }

    // Go to the end of the animation.
    function end() {
        setTime(0);
        stopTimer();
    }

    // Respond to the same key presses as Wrap uses for navigation.   PageDown
    // starts a paused animation, or skips to the end or goes to the next page.
    // PageUp pauses the animation, or sets the counter back to 10, or goes to
    // the previous page.
    function key(key, shift, ctrl) {
        if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
            if (! timer && time == 0) return false;
            if (! timer) startTimer();
            else end();
            return true;
        }
        if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
            if (! timer && time == 10) return false;
            if (timer) stopTimer();
            else setTime(10);
            return true;
        }
        return false;
    }

    function setTime(t) {
        time = t;
        counter.innerHTML = "" + time;
    }

    function startTimer() {
        if (timer != null) clearInterval(timer);
        timer = setInterval(tick, 1000);
    }

    function stopTimer() {
        if (timer != null) clearInterval(timer);
        timer = null;
    }

    // Called every second.
    function tick() {
        setTime(time - 1);
        if (time == 0) stopTimer();
    }
}
