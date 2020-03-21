const EPSILON = 0.001;
const PI = Math.PI;
const TAU = 2 * PI;
const HPI = PI / 2;
const QPI = PI / 4;
const PI2DEG = TAU / 360;
const DEG2PI = 360 / TAU;

// Math Stuff
const mix = (a, b, k) => a * (1 - k) + k * b;
const lerp = (a, b, c, d) => (a - b) / (c - d) * d + c;
const step = (a, b, c) => c < 0.5 ? a : b;
const clamp = (v, a, b) => Math.max(Math.min(v, 1.), 0.);

// Angles
const positive_radians = (a) => ((a % TAU) + TAU) % TAU; 
const positive_degrees = (a) => ((a % 360) + 360) % 360; 
const radians = (a) => positive_radians(a * PI2DEG);
const degrees = (a) => positive_degrees(a * DEG2PI);

// Random
const random_float = (a, b) => Math.random() * (b - a) + a;
const random_int = (a, b) => Math.floor(Math.random() * (b - a) + a);