// Canvas animation to draw a specific diagram, in stages.
export default drawing;

// Create animation object to draw in a section's canvas.
function drawing(section) {
    let canvas = section.querySelector("canvas");
    let brush = canvas.getContext("2d");
    brush.font = "32px monospaced";
    brush.lineWidth = 2;
    let time = 0;
    return {start, stop, end, key, canvas, brush, time, draw};
}

function start() {
    this.time = 0;
    this.draw();
}

function stop() {
}

function end() {
    this.time = 3;
    this.draw();
}

function key(key, shift, ctrl) {
    if (key == 'PageDown' || key == 'ArrowRight' || key == 'ArrowDown') {
        if (this.time >= 3) return false;
        this.time++;
        this.draw();
        return true;
    }
    if (key == 'PageUp' || key == 'ArrowLeft' || key == 'ArrowUp') {
        if (this.time == 0) return false;
        this.time--;
        this.draw();
        return true;
    }
    return false;
}

// Clear the canvas and draw the picture as it should be at the given time.
function draw() {
    this.brush.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.time >= 1) drawBox(this.brush);
    if (this.time >= 2) drawOval(this.brush);
    if (this.time >= 3) drawArrow(this.brush);
}

// Draw a box labelled 'A' on the canvas.
function drawBox(brush) {
    brush.strokeRect(300, 200, 100, 50);
    brush.fillText("A", 340, 235);
}

// Draw an ellipse labelled 'B' on the canvas.
function drawOval(brush) {
    brush.beginPath();
    brush.ellipse(700, 225, 60, 30, 0, 0, 2 * Math.PI);
    brush.stroke();
    brush.fillText("B", 690, 235);
}

// Draw an arrow from box A to ellipse B.
function drawArrow(brush) {
    brush.beginPath();
    brush.moveTo(400, 225);
    brush.lineTo(640, 225);
    brush.moveTo(630, 215);
    brush.lineTo(640, 225);
    brush.moveTo(630, 235);
    brush.lineTo(640, 225);
    brush.stroke();
}

