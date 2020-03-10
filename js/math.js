const EPSILON = 0.01;
const PI = Math.PI;
const TAU = 2 * PI;
const HPI = PI / 2;
const PI2DEG = TAU / 360;
const DEG2PI = 360 / TAU;

const mix = (a, b, k) => a * k + (1 - k) * b;
const lerp = (a, b, c, d) => (a - b) / (c - d) * d + c;
const step = (a, b, c) => c < 0.5 ? a : b;
const positive_radians = (a) => ((a % TAU) + TAU) % TAU; 
const positive_degrees = (a) => ((a % 360) + 360) % 360; 
const radians = (a) => positive_radians(a * PI2DEG);
const degrees = (a) => positive_degrees(a * DEG2PI);