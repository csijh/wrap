// Canvas animation to draw a specific diagram, in stages.
export default { init, start, stop, end, key };

// Global variables.
let canvas, brush, time;

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
