// Export an animation object to reveal the paragraphs on a slide one by one.
// It has the methods required by Wrap.
export default reveal;

// Create an animation for the paragraphs in a given section. It holds the
// array of paragraphs and the current index within it.
function reveal(section) {
    let paragraphs = [];
    for (let i = 0; i < section.children.length; i++) {
        let node = section.children[i];
        let tag = node.tagName.toLowerCase();
        if (tag == "p") paragraphs.push(node);
    }
    let index = 0;
    return { start, stop, end, key, paragraphs, index };
}

// Start the animation by making the paragraphs invisible.
function start() {
    this.index = 0;
    for (let i = 0; i < this.paragraphs.length; i++) {
        let para = this.paragraphs[i];
        para.style.visibility = "hidden";
    }
}

// Stop the animation. (There is nothing to do).
function stop() {
}

// Go to the end of the animation by making the paragraphs visible.
function end() {
    this.index = this.paragraphs.length;
    for (let i = 0; i < this.paragraphs.length; i++) {
        let para = this.paragraphs[i];
        para.style.visibility = "visible";
    }
}

// Respond to the same key presses as Wrap uses for navigation.
function key(key, shift, ctrl) {
    if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
        if (this.index >= this.paragraphs.length) return false;
        this.paragraphs[this.index].style.visibility = "visible";
        this.index++;
        return true;
    }
    if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
        if (this.index == 0) return false;
        this.index--;
        this.paragraphs[this.index].style.visibility = "hidden";
        return true;
    }
    return false;
}
