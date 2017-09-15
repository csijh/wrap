// Canvas animations to draw a diagram, or bounce a ball.
"use strict";

// The animation objects.
var draw = newDraw();
var bounce = newbounce();

// Draw a specific diagram, in stages.
function newDraw() {
    var canvas, brush, time;
    return { init: init, start: start, stop: stop, end: end, key: key };

    function init(slide) {
        time = 0;
        canvas = slide.querySelector("canvas");
        brush = canvas.getContext("2d");
        brush.font = "32px monospaced";
        brush.lineWidth = 2;
    }

    // Draw a box labelled 'A' on the canvas.
    function drawBox() {
        brush.strokeRect(300, 200, 100, 50);
        brush.fillText("A", 340, 235);
    }

    // Draw an ellipse labelled 'B' on the canvas.
    // Works with Chrome, perhaps not yet with other browsers.
    function drawOval() {
        brush.beginPath();
        brush.ellipse(700, 225, 60, 30, 0, 0, 2 * Math.PI);
        brush.stroke();
        brush.fillText("B", 690, 235);
    }

    // Draw an arrow from box A to ellipse B.
    function drawArrow() {
        brush.beginPath();
        brush.moveTo(400, 225);
        brush.lineTo(640, 225);
        brush.moveTo(630, 215);
        brush.lineTo(640, 225);
        brush.moveTo(630, 235);
        brush.lineTo(640, 225);
        brush.stroke();
    }

    // Clear the canvas and draw the picture as it should be at the given time.
    function draw() {
        brush.clearRect(0, 0, canvas.width, canvas.height);
        if (time >= 1) drawBox();
        if (time >= 2) drawOval();
        if (time >= 3) drawArrow();
    }

    function start() {
        time = 0;
        draw();
    }

    function stop() {
    }

    function end() {
        time = 3;
        draw();
    }

    function key(key, shift, ctrl) {
        if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
            if (time >= 3) return false;
            time++;
            draw();
            return true;
        }
        if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
            if (time == 0) return false;
            time--;
            draw();
            return true;
        }
        return false;
    }
}

// Animate a bouncing ball.
function newbounce() {
    var canvas, brush, ball, loaded, timer, x, y, dx, dy, maxx, maxy;
    return { init: init, start: start, stop: stop, end: end, key: key };

    // Set up the variables and start loading the ball image.
    function init(slide) {
        loaded = false;
        timer = null;
        x = y = 0;
        dx = 4;
        dy = 7;
        canvas = slide.querySelector("canvas");
        brush = canvas.getContext("2d");
        ball = new Image();
        ball.src = "ball.png";
        ball.onload = measure;
    }

    // Once the image has loaded, measure the limits of movement.
    function measure() {
        loaded = true;
        maxx = canvas.width - ball.naturalWidth;
        maxy = canvas.height - ball.naturalHeight;
    }

    // Move the ball, deal with the bounce, and redraw (if loaded).
    // Ignore the time argument and treat each call as a unit of time.
    function tick(time) {
        x = x + dx;
        y = y + dy;
        if (x < 0) { x = -x; dx = -dx; }
        if (y < 0) { y = -y; dy = -dy; }
        if (x > maxx) { x = maxx - (x - maxx); dx = -dx; }
        if (y > maxy) { y = maxy - (y - maxy); dy = -dy; }
        brush.clearRect(0, 0, canvas.width, canvas.height);
        if (loaded) brush.drawImage(ball, x, y);
        timer = requestAnimationFrame(tick);
    }

    function start() {
        timer = requestAnimationFrame(tick);
    }

    function stop() {
        cancelAnimationFrame(timer);
        timer = null;
    }

    function end() {
        stop();
    }

    // Any key just stops the animation.
    function key(key, shift, ctrl) {
        if (! timer) return false;
        stop();
        return true;
    }
}
