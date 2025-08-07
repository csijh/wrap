// Canvas animation to show a bouncing ball.
export default bounce;

function bounce(section) {
    let canvas = section.querySelector("canvas");
    let brush = canvas.getContext("2d");
    let ball = new Image();
    let loaded = false;
    let timer = null;
    let x = 0;
    let y = 0;
    let dx = 4;
    let dy = 7;
    let maxx = 100;
    let maxy = 100;
    let animation = {
        start, stop, end, key,
        tick, canvas, brush, ball, loaded, timer, x, y, dx, dy
    }
    ball.src = "ball.png";
    ball.onload = measure.bind(animation);
    return animation;
}

// Once the image has loaded, measure the limits of movement.
function measure() {
    this.loaded = true;
    this.maxx = this.canvas.width - this.ball.naturalWidth;
    this.maxy = this.canvas.height - this.ball.naturalHeight;
}

// Move the ball, deal with the bounce, and redraw (if loaded).
// Ignore the time argument and treat each call as a unit of time.
function tick(time) {
    this.x = this.x + this.dx;
    this.y = this.y + this.dy;
    if (this.x < 0) { this.x = -this.x; this.dx = -this.dx; }
    if (this.y < 0) { this.y = -this.y; this.dy = -this.dy; }
    if (this.x > this.maxx) {
        this.x = this.maxx - (this.x - this.maxx);
        this.dx = -this.dx;
    }
    if (this.y > this.maxy) {
        this.y = this.maxy - (this.y - this.maxy);
        this.dy = -this.dy;
    }
    this.brush.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (this.loaded) this.brush.drawImage(this.ball, this.x, this.y);
    this.timer = requestAnimationFrame(this.tick.bind(this));
}

function start() {
    this.timer = requestAnimationFrame(this.tick.bind(this));
}

function stop() {
    if (this.timer != null) cancelAnimationFrame(this.timer);
    this.timer = null;
}

function end() {
    this.stop();
}

// Any key just stops the animation.
function key(key, shift, ctrl) {
    if (! this.timer) return false;
    this.stop();
    return true;
}
