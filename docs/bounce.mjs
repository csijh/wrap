// Canvas animation to show a bouncing ball.
export default { init, start, stop, end, key };

// Global variables.
let canvas, brush, ball, loaded, timer, x, y, dx, dy, maxx, maxy;

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
