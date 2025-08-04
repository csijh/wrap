// Media animation to play a video or audio clip.
export default { init, start, stop, end, key };

// The video or audio player.
let media;

function init(slide) {
    media = slide.querySelector("video");
    if (media == null) media = slide.querySelector("audio");
}

// Don't autoplay; start the clip with a key press.
function start() {
    media.currentTime = 0;
}

function stop() {
    media.pause();
}

// Note that setting currentTime depends on the server providing
// Content-Length and Accept-Ranges headers as well as Content-Type.
function end() {
    media.currentTime = media.duration;
}

// Control the clip with the usual keys.
function key(key, shift, ctrl) {
    if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
        if (media.ended) return false;
        if (media.currentTime == 0 || media.paused) {
            media.play();
        }
        else {
            media.pause();
        }
        return true;
    }
    if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
        if (media.currentTime == 0) return false;
        if (media.paused || media.ended) {
            media.currentTime = 0;
        }
        else media.pause();
        return true;
    }
    return false;
}
