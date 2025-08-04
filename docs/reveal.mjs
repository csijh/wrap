// Export an animation object to reveal the paragraphs on a slide one by one.
// It has the methods required by Wrap.
export default { init, start, stop, end, key };

// Gather an array of the paragraphs to be revealed.
function init(slide) {
    this.items = [];
    for (var i=0; i<slide.children.length; i++) {
        var node = slide.children[i];
        var tag = node.tagName.toLowerCase();
        if (tag == "p") this.items.push(node);
    }
}

// Start the animation by making the paragraphs invisible.
function start() {
    this.index = 0;
    for (var i=0; i<this.items.length; i++) {
        var para = this.items[i];
        para.style.visibility = "hidden";
    }
}

// Stop the animation. (There is nothing to do).
function stop() {
}

// Go to the end of the animation by making the paragraphs visible.
function end() {
    this.index = this.items.length;
    for (var i=0; i<this.items.length; i++) {
        var para = this.items[i];
        para.style.visibility = "visible";
    }
}

// Respond to the same key presses as Wrap uses for navigation.
function key(key, shift, ctrl) {
    if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
        if (this.index >= this.items.length) return false;
        this.items[this.index].style.visibility = "visible";
        this.index++;
        return true;
    }
    if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
        if (this.index == 0) return false;
        this.index--;
        this.items[this.index].style.visibility = "hidden";
        return true;
    }
    return false;
}
