"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ITERATIONS = 250;
const pixelPlaneSize = 600;
let pixelSize;
let neededDigits;
let digitsPerIteration;
let startNodes = [];
let piApproxValueNode;
let piDigitProgressNode;
let dim = 600;
let inside = 0;
let step = -1;
const colors = [
    [255, 0, 0],
    [255, 128, 0],
    [255, 255, 0],
    [128, 255, 0],
    [0, 255, 0],
    [0, 255, 128],
    [0, 255, 255],
    [0, 128, 255],
    [0, 0, 255],
    [255, 255, 255],
];
let digitX = 0;
let digitY = 0;
function* calculatePi() {
    let q = 1n;
    let r = 180n;
    let t = 60n;
    let i = 2n;
    while (true) {
        const digit = ((i * 27n - 12n) * q + r * 5n) / (t * 5n);
        yield parseInt(digit.toString());
        let u = i * 3n;
        u = (u + 1n) * 3n * (u + 2n);
        r = u * 10n * (q * (i * 5n - 2n) + r - t * digit);
        q *= 10n * i * (i++ * 2n - 1n);
        t *= u;
    }
}
const piCalculator = calculatePi();
let digits = "";
function setup() {
    dim = min(windowWidth, windowHeight);
    createCanvas(dim, dim);
    background(0);
    push();
    stroke(255);
    noFill();
    circle(width / 2, height / 2, dim);
    pop();
    piApproxValueNode = createP()
        .style("position", "absolute")
        .style("top", "25px")
        .style("left", "50%")
        .style("transform", "translateX(-50%)");
    piDigitProgressNode = createP()
        .style("position", "absolute")
        .style("bottom", "25px")
        .style("left", "50%")
        .style("transform", "translateX(-50%)")
        .style("word-break", "break-all");
    const sizes = [4, 8, 15];
    const digitOptions = [25, 5, 2];
    for (let i = 0; i < sizes.length; i++) {
        startNodes.push(createButton(["Small Pixels", "Medium Pixels", "Large Pixels"][i])
            .mouseClicked(() => {
            step++;
            pixelSize = sizes[i];
            digitsPerIteration = digitOptions[i];
            neededDigits = (pixelPlaneSize / pixelSize) ** 2;
            startNodes.forEach(node => node.remove());
            loop();
        })
            .style("margin-top", ["-50px", "0", "50px"][i]));
    }
    noLoop();
}
function draw() {
    switch (step) {
        case 0:
            step0();
            break;
        case 1:
            step1();
            break;
    }
}
function step0() {
    translate(width / 2, height / 2);
    for (let i = 0; i < ITERATIONS; i++) {
        const x = random(width) - width / 2;
        const y = random(height) - height / 2;
        push();
        if (sqrt(x ** 2 + y ** 2) < dim / 2) {
            stroke(0, 255, 0, 128);
            inside++;
        }
        else {
            stroke(255, 0, 0, 128);
        }
        point(x, y);
        pop();
    }
    const pi = 4 * inside / (frameCount * ITERATIONS);
    piApproxValueNode.html("Approximated Value: <br>" + pi.toFixed(8));
    for (let i = 0; i < digitsPerIteration; i++)
        digits += piCalculator.next().value;
    if (!digits.includes("."))
        digits = digits.slice(0, 1) + "." + digits.slice(1);
    piDigitProgressNode.html(`Calculated ${digits.length - 1}/${neededDigits} digits of pi.`);
    if (digits.length > neededDigits) {
        noLoop();
        const btn = createButton("Next >");
        btn.mousePressed(() => {
            piApproxValueNode.remove();
            piDigitProgressNode.remove();
            btn.remove();
            step++;
            resizeCanvas(pixelPlaneSize, pixelPlaneSize);
            background(220);
            frameCount = 0;
            loop();
        });
    }
}
function step1() {
    if (frameCount <= 10) {
        digitX = 0;
        digitY = 0;
        return;
    }
    if (digitY >= height) {
        noLoop();
        return;
    }
    for (let i = 0; i < width / pixelSize; i++) {
        digitX = i * pixelSize;
        const index = i + (digitY / pixelSize) * (width / pixelSize);
        const digit = digits[index];
        const color = colors[parseInt(digit)] || [255, 255, 255];
        push();
        noStroke();
        fill(color);
        rect(digitX, digitY, pixelSize, pixelSize);
        fill(0);
        textAlign(CENTER, CENTER);
        textSize(pixelSize / 2);
        text(digit, digitX + pixelSize / 2, digitY + pixelSize / 2);
        pop();
    }
    digitY += pixelSize;
}
