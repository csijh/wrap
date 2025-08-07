// Media animation to play a video or audio clip.
export default play;

// Create animation to play the video or audio in a section.
function play(section) {
    let media = section.querySelector("video");
    if (media == null) media = section.querySelector("audio");
    return { start, stop, end, key, media };
}

// Don't autoplay; start the clip with a key press.
function start() {
    this.media.currentTime = 0;
}

function stop() {
    this.media.pause();
}

// Note that setting currentTime depends on the server providing
// Content-Length and Accept-Ranges headers as well as Content-Type.
function end() {
    this.media.currentTime = this.media.duration;
}

// Control the clip with the usual keys.
function key(key, shift, ctrl) {
    if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
        if (this.media.ended) return false;
        if (this.media.currentTime == 0 || this.media.paused) {
            this.media.play();
        }
        else {
            this.media.pause();
        }
        return true;
    }
    if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
        if (this.media.currentTime == 0) return false;
        if (this.media.paused || this.media.ended) {
            this.media.currentTime = 0;
        }
        else this.media.pause();
        return true;
    }
    return false;
}
