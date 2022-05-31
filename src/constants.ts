import { Vector } from './vector';

export const GAME_TABLE_UPPER_BOUND = 0.33250200748443604;
export const GAME_TABLE_LOWER_BOUND = -0.7065067887306213;

export const ALMOST_ZERO = 1e-11;

export const HALF_TABLE_WIDTH = 127;
export const HALF_TABLE_HEIGHT = 63.5;

export const BALL_RADIUS = 3.800475;

export const POCKET_DISTANCE = 8;
export const POCKET_POINTS = [
  new Vector(-130.8, -67.3, 0),
  new Vector(0, -71, 0),
  new Vector(130.8, -67.3, 0),
  new Vector(130.8, 67.3, 0),
  new Vector(0, 71, 0),
  new Vector(-130.8, 67.3, 0),
];

export const CUSHION_POINTS = [
  new Vector(-127, -52.9, 0),
  new Vector(-136.9, -64.1, 0),
  new Vector(-138.2, -69.2, 0),
  new Vector(-136.7, -73.2, 0),
  new Vector(-132.7, -74.7, 0),
  new Vector(-127.6, -73.4, 0),
  new Vector(-116.4, -63.5, 0),
  new Vector(-7.9, -63.5, 0),
  new Vector(-6.2, -68.6, 0),
  new Vector(-5.8, -72.7, 0),
  new Vector(-3.8, -75.4, 0),
  new Vector(0, -76.7, 0),
  new Vector(3.8, -75.4, 0),
  new Vector(5.8, -72.7, 0),
  new Vector(6.2, -68.6, 0),
  new Vector(7.9, -63.5, 0),
  new Vector(116.4, -63.5, 0),
  new Vector(127.6, -73.4, 0),
  new Vector(132.7, -74.7, 0),
  new Vector(136.7, -73.2, 0),
  new Vector(138.2, -69.2, 0),
  new Vector(136.9, -64.1, 0),
  new Vector(127, -52.9, 0),
  new Vector(127, 52.9, 0),
  new Vector(136.9, 64.1, 0),
  new Vector(138.2, 69.2, 0),
  new Vector(136.7, 73.2, 0),
  new Vector(132.7, 74.7, 0),
  new Vector(127.6, 73.4, 0),
  new Vector(116.4, 63.5, 0),
  new Vector(7.9, 63.5, 0),
  new Vector(6.2, 68.6, 0),
  new Vector(5.8, 72.7, 0),
  new Vector(3.8, 75.4, 0),
  new Vector(0, 76.7, 0),
  new Vector(-3.8, 75.4, 0),
  new Vector(-5.8, 72.7, 0),
  new Vector(-6.2, 68.6, 0),
  new Vector(-7.9, 63.5, 0),
  new Vector(-116.4, 63.5, 0),
  new Vector(-127.6, 73.4, 0),
  new Vector(-132.7, 74.7, 0),
  new Vector(-136.7, 73.2, 0),
  new Vector(-138.2, 69.2, 0),
  new Vector(-136.9, 64.1, 0),
  new Vector(-127, 52.9, 0),
];
