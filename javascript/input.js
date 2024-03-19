
// Lås musen
document.addEventListener("click", (ev) => {
    document.body.requestPointerLock();
})


const keyPressed = {
    w: false,
    s: false,
    d: false,
    a: false,
    e: false,
    q: false,
}

const mouseMovedCallbacks = [];
const mousePressedCallbacks = [];

document.addEventListener("keypress", (ev) => {
    if (ev.key in keyPressed) {
        keyPressed[ev.key] = true;
    }
});

document.addEventListener("keyup", (ev) => {
    if (ev.key in keyPressed) {
        keyPressed[ev.key] = false;
    }
});

document.addEventListener('mousemove', (ev) => {
    const mouseDeltaX = ev.movementX || ev.mozMovementX || ev.webkitMovementX || 0;
    const mouseDeltaY = ev.movementY || ev.mozMovementY || ev.webkitMovementY || 0;

    mouseMovedCallbacks.forEach((callback) => {
        callback(mouseDeltaX, mouseDeltaY);
    });
});

document.addEventListener("mousedown", (ev) => {
    mousePressedCallbacks.forEach((callback) => {
        callback();
    });
});