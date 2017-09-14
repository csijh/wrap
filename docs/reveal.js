// Reveal the paragraphs on a slide one by one.
"use strict";

// The animation object, with the methods required by Wrap.
// The 'reveal' prefix on functions prevents name clashes with other scripts.
var reveal = {
    init: revealInit, start: revealStart, stop: revealStop, end: revealEnd,
    key: revealKey
};

// Gather an array of the paragraphs to be revealed.
function revealInit(slide) {
    this.items = [];
    for (var i=0; i<slide.children.length; i++) {
        var node = slide.children[i];
        var tag = node.tagName.toLowerCase();
        if (tag == "p") this.items.push(node);
    }
}

// Start the animation by making the paragraphs invisible.
function revealStart() {
    this.index = 0;
    for (var i=0; i<this.items.length; i++) {
        var para = this.items[i];
        para.style.visibility = "hidden";
    }
}

// Stop the animation. (There is nothing to do).
function revealStop() {
}

// Go to the end of the animation by making the paragraphs visible.
function revealEnd() {
    this.index = this.items.length;
    for (var i=0; i<this.items.length; i++) {
        var para = this.items[i];
        para.style.visibility = "visible";
    }
}

// Respond to the same key presses as Wrap uses for navigation.
function revealKey(event) {
    var pageUp = 33, pageDown = 34;
    var leftArrow = 37, upArrow = 38, rightArrow = 39, downArrow = 40;
    var key = event.keyCode;

    if (key == pageDown || key == rightArrow || key == downArrow) {
        if (this.index >= this.items.length) return false;
        this.items[this.index].style.visibility = "visible";
        this.index++;
        return true;
    }
    if (key == pageUp || key == leftArrow || key == upArrow) {
        if (this.index == 0) return false;
        this.index--;
        this.items[this.index].style.visibility = "hidden";
        return true;
    }
    return false;
}
