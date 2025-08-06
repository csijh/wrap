// Export an animation object to reveal the paragraphs on a slide one by one.
// It has the methods required by Wrap.
export default { init, start, stop, end, key };

// The array of paragraphs to be revealed, and the current index into the array.
let paragraphs, index;

// Gather an array of the paragraphs to be revealed.
function init (slide) {
    paragraphs = [];
    for (let i = 0; i < slide.children.length; i++) {
        let node = slide.children[i];
        let tag = node.tagName.toLowerCase();
        if (tag == "p") paragraphs.push(node);
    }
    index = 0;
}

// Start the animation by making the paragraphs invisible.
function start() {
    index = 0;
    for (let i = 0; i < paragraphs.length; i++) {
        let para = paragraphs[i];
        para.style.visibility = "hidden";
    }
}

// Stop the animation. (There is nothing to do).
function stop() {
}

// Go to the end of the animation by making the paragraphs visible.
function end() {
    index = paragraphs.length;
    for (let i = 0; i < paragraphs.length; i++) {
        let para = paragraphs[i];
        para.style.visibility = "visible";
    }
}

// Respond to the same key presses as Wrap uses for navigation.
function key(key, shift, ctrl) {
    if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
        if (index >= paragraphs.length) return false;
        paragraphs[index].style.visibility = "visible";
        index++;
        return true;
    }
    if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
        if (index == 0) return false;
        index--;
        paragraphs[index].style.visibility = "hidden";
        return true;
    }
    return false;
}
