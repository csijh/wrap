// Animation to count down from 10 to 0.
export default countdown;

// Create a countdown animation, displayed in the section's element which has
// class counter.
function countdown(section) {
    let counter = section.querySelector(".counter");
    let timer = null;
    let time = 10;
    return {start, stop, end, key, counter, timer, time, tick};
}

// Start the animation.
function start() {
    this.time = 10;
    this.counter.innerHTML = "" + this.time;
    this.timer = setTimeout(this.tick.bind(this), 1000);
}

// Stop the animation.
function stop() {
    clearTimeout(this.timer);
    this.timer = null;
}

// Go to the end of the animation.
function end() {
    this.time = 0;
    this.counter.innerHTML = "" + this.time;
}

// Respond to the same key presses as Wrap uses for navigation. PageDown
// starts a paused animation, or skips to the end or goes to the next page.
// PageUp pauses the animation, or sets the counter back to 10, or goes to
// the previous page.
function key(key, shift, ctrl) {
    if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
        if (this.time == 0) return false;
        if (! this.timer) this.timer = setTimeout(this.tick.bind(this), 1000);
        else { this.stop(); this.end(); }
        return true;
    }
    if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
        if (this.timer != null) this.stop();
        else if (this.time == 10) return false;
        else {
            this.time = 10;
            this.counter.innerHTML = "" + this.time;
        }
        return true;
    }
    return false;
}

// Called every second.
function tick() {
    this.time--;
    this.counter.innerHTML = "" + this.time;
    if (this.time > 0) this.timer = setTimeout(this.tick.bind(this), 1000);
}
