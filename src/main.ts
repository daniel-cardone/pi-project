/// <reference path="../node_modules/@types/p5/global.d.ts" />

import p5 from "p5";

const ITERATIONS = 250;
const pixelPlaneSize = 600;
let dim: number;
let pixelSize: number;
let neededDigits: number;
let digitsPerIteration: number;
let startNodes: p5.Element[] = [];
let piApproxValueNode: p5.Element;
let piDigitProgressNode: p5.Element;
let inside = 0;
let step = -1;

const colors = [
  [255, 0, 0], // 0: #ff0000
  [255, 128, 0], // 1: #ff8000
  [255, 255, 0], // 2: #ffff00
  [128, 255, 0], // 3: #80ff00
  [0, 255, 0], // 4: #00ff00
  [0, 255, 128], // 5: #00ff80
  [0, 255, 255], // 6: #00ffff
  [0, 128, 255], // 7: #0080ff
  [0, 0, 255], // 8: #0000ff
  [255, 255, 255], // 9: #ffffff
];
let digitX = 0;
let digitY = 0;

// Infinite series - each iteration returns one new digit of pi
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
  // Create a square canvas that fits the screen
  dim = min(windowWidth, windowHeight);
  createCanvas(dim, dim);
  
  // Start with a black background and white ring
  background(0);
  push();
  stroke(255);
  noFill();
  circle(width / 2, height / 2, dim);
  pop();
  
  // Create paragraph nodes for the monte-carlo estimate and calculation progress
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

  // Give three options for how to display the ending grid
  const sizes = [4, 8, 15];
  const digitOptions = [25, 5, 2];
  for (let i = 0; i < sizes.length; i++) {
    startNodes.push(
      createButton(["Small Pixels", "Medium Pixels", "Large Pixels"][i])
        .mouseClicked(() => {
          step++;
          pixelSize = sizes[i];
          digitsPerIteration = digitOptions[i];
          neededDigits = (pixelPlaneSize / pixelSize) ** 2;
          startNodes.forEach(node => node.remove());
          loop();
        })
        .style("margin-top", ["-50px", "0", "50px"][i])
    );
  }
  
  // No looping until an option is selected
  noLoop();
}

function draw() {
  // Call either step0() or step1() depending on the current stage
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
    // Select a random point on the screen
    const x = random(width) - width / 2;
    const y = random(height) - height / 2;
    
    push();
    // Determine if the point is inside the circle and draw it
    if (sqrt(x ** 2 + y ** 2) < dim / 2) {
      stroke(0, 255, 0, 128);
      inside++;
    } else {
      stroke(255, 0, 0, 128);
    }
    point(x, y);
    pop();
  }
  
  // Create an approximation based on the amount of points inside the circle
  const pi = 4 * inside / (frameCount * ITERATIONS);
  piApproxValueNode.html("Approximated Value: <br>" + pi.toFixed(8));

  // Get new digits of pi
  for (let i = 0; i < digitsPerIteration; i++) digits += piCalculator.next().value;
  // Insert a decimal point if it is missing (314 -> 3.14)
  if (!digits.includes(".")) digits = digits.slice(0, 1) + "." + digits.slice(1);
  // Display the progress of calculating digits
  piDigitProgressNode.html(`Calculated ${digits.length - 1}/${neededDigits} digits of pi.`);
  
  // If we've calculated all needed digits, stop looping and wait for user input to move on
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
  // Correct for frameRate reset
  if (frameCount <= 10) {
    digitX = 0;
    digitY = 0;
    return;
  }

  // If we've filled the screen, stop
  if (digitY >= height) {
    noLoop();
    return;
  }
  
  // Draw one row of blocks
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
