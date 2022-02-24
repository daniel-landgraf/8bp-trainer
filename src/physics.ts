import { Ball } from "./ball";
import { BALL_RADIUS } from "./constants";
import { Vector } from "./vector";

export const ALMOST_ZERO = 1e-11;

const COEFFICIENT_OF_RESTITUTION = 0.804;
const COEFFICIENT_OF_ROLLING_FRICTION = 0.0111;
const COEFFICIENT_OF_SLIDING_FRICTION = 0.2;
const COEFFICIENT_OF_SPINNING_FRICTION = 0.025;

const CUSHION_SPIN_RATIO = 0.54;

const FIVE_DIV_TWO = 2.5;
const TWO_DIV_SEVEN = 0.2857142857142857;

const GRAVITATIONAL_FORCE = 980.0000000000001;

const HALF_PI = 1.5707963267948966;
const THREE_HALVES_PI = 4.71238898038469;

const SMALL_OFFSET = 0.05;

export class Physics {
  static calculateTheta(x: number, y: number) {
    if (0 == x) {
      return 0 <= y ? HALF_PI : THREE_HALVES_PI;
    }

    const theta = Math.atan(y / x);
    return x < 0 ? theta + Math.PI : theta;
  }

  static getBallWithBallCollisionTime(ball1: Ball, ball2: Ball, time: number) {
    const dia = BALL_RADIUS + BALL_RADIUS;

    const dxPos = ball2.position.x - ball1.position.x;
    const dyPos = ball2.position.y - ball1.position.y;
    const dxVelo = ball2.velocity.x - ball1.velocity.x;
    const dyVelo = ball2.velocity.y - ball1.velocity.y;

    const a = dxVelo * dxVelo + dyVelo * dyVelo;
    const b = 2 * (dxPos * dxVelo + dyPos * dyVelo);
    const c = dxPos * dxPos + dyPos * dyPos - dia * dia;

    let result = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a);

    if (result < 0 && 0 < result + SMALL_OFFSET) {
      result = ALMOST_ZERO;
    }

    return result < 0 || result - ALMOST_ZERO > time || 0 <= b
      ? Number.POSITIVE_INFINITY
      : result;
  }

  static getBallWithCushionCollisionTime(
    ball: Ball,
    p1: Vector,
    p2: Vector,
    time: number
  ) {
    if (!ball.isMoving()) {
      return Number.POSITIVE_INFINITY;
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / length;
    const ny = -dy / length;

    const xVal = ball.position.x - p1.x - ny * BALL_RADIUS;
    const yVal = ball.position.y - p1.y - nx * BALL_RADIUS;
    const divisor = dx * -ball.velocity.y - dy * -ball.velocity.x;

    if (0 == divisor) {
      return Number.POSITIVE_INFINITY;
    }

    let result = (-ball.velocity.y * xVal - -ball.velocity.x * yVal) / divisor;
    if (result <= 0 || 1 <= result) {
      return Number.POSITIVE_INFINITY;
    }

    result = (dx * yVal - dy * xVal) / divisor;
    return result <= 0 || result - ALMOST_ZERO > time
      ? Number.POSITIVE_INFINITY
      : 0 < ny * ball.velocity.x + nx * ball.velocity.y
      ? Number.POSITIVE_INFINITY
      : result;
  }

  static getBallWithCornerCollisionTime(
    ball1: Ball,
    cornerPos: Vector,
    time: number
  ) {
    const dx = cornerPos.x - ball1.position.x;
    const dy = cornerPos.y - ball1.position.y;
    const dx2dy2 = dx * dx + dy * dy;
    const r2 = BALL_RADIUS * BALL_RADIUS;

    const a =
      ball1.velocity.x * ball1.velocity.x + ball1.velocity.y * ball1.velocity.y;
    const b = -2 * ball1.velocity.x * dx - 2 * ball1.velocity.y * dy;
    const c = dx2dy2 - r2;

    const a4 = 4 * a;
    const b2 = b * b;

    if (r2 <= -b2 / a4 + dx2dy2) {
      return Number.POSITIVE_INFINITY;
    }

    const result = (-b - Math.sqrt(b2 - a4 * c)) / (2 * a);
    return result < 0 || result - ALMOST_ZERO > time || 0 < b
      ? Number.POSITIVE_INFINITY
      : result;
  }

  static handleBallWithBallCollision(ball1: Ball, ball2: Ball) {
    const dx = ball1.position.x - ball2.position.x;
    const dy = ball1.position.y - ball2.position.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / length;
    const ny = dy / length;
    const dot1 = ball1.velocity.x * -nx + ball1.velocity.y * -ny;
    const dot2 = ball2.velocity.x * nx + ball2.velocity.y * ny;

    ball1.velocity.x = dot2 * nx - (dot1 * -nx - ball1.velocity.x);
    ball1.velocity.y = dot2 * ny - (dot1 * -ny - ball1.velocity.y);
    ball2.velocity.x = dot1 * -nx - (dot2 * nx - ball2.velocity.x);
    ball2.velocity.y = dot1 * -ny - (dot2 * ny - ball2.velocity.y);
  }

  static handleBallWithCushionCollision(ball: Ball, theta: number) {
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);

    let r = cos * ball.velocity.x - sin * ball.velocity.y;
    let s = sin * ball.velocity.x + cos * ball.velocity.y;
    let a = cos * ball.spin.x - sin * ball.spin.y;
    const o = sin * ball.spin.x + cos * ball.spin.y;

    a -= (s * CUSHION_SPIN_RATIO) / BALL_RADIUS;

    const u = r - ball.spin.z * BALL_RADIUS;
    const h = 0 < u ? 1 : -1;
    const c = Math.abs(u) / FIVE_DIV_TWO;
    const l = 2 * COEFFICIENT_OF_SLIDING_FRICTION * Math.abs(s);
    const d = -h * Math.min(c, l);

    r += d / FIVE_DIV_TWO;

    ball.spin.z -= (FIVE_DIV_TWO * d) / BALL_RADIUS;

    s = -s * COEFFICIENT_OF_RESTITUTION;

    ball.velocity.x = cos * r + sin * s;
    ball.velocity.y = -sin * r + cos * s;

    ball.spin.x = cos * a + sin * o;
    ball.spin.y = -sin * a + cos * o;
  }

  static finish(t: Ball, e: number) {
    if (t.isMovingOrSpinning()) {
      var i: number,
        n = -t.velocity.x - t.spin.y * BALL_RADIUS,
        r = -t.velocity.y + t.spin.x * BALL_RADIUS,
        s = Math.sqrt(n * n + r * r),
        a =
          (TWO_DIV_SEVEN * s) /
          (COEFFICIENT_OF_SLIDING_FRICTION * GRAVITATIONAL_FORCE);
      if (a > ALMOST_ZERO) {
        var o = Math.min(a, e);
        (n *=
          (i = COEFFICIENT_OF_SLIDING_FRICTION * GRAVITATIONAL_FORCE * o) / s),
          (r *= i / s),
          (t.velocity.x += n),
          (t.velocity.y += r),
          (t.spin.x -= (FIVE_DIV_TWO * r) / BALL_RADIUS),
          (t.spin.y += (FIVE_DIV_TWO * n) / BALL_RADIUS);
      }
      if (a < e) {
        var u = e - a;
        (i = COEFFICIENT_OF_ROLLING_FRICTION * GRAVITATIONAL_FORCE * u),
          t.velocity.scale(Math.max(0, 1 - i / t.velocity.length)),
          (t.spin.x = t.velocity.y / BALL_RADIUS),
          (t.spin.y = -t.velocity.x / BALL_RADIUS);
      }
      var h =
        (COEFFICIENT_OF_SPINNING_FRICTION / FIVE_DIV_TWO) *
        GRAVITATIONAL_FORCE *
        e;
      0 < t.spin.z
        ? (t.spin.z = Math.max(0, t.spin.z - h))
        : (t.spin.z = Math.min(0, t.spin.z + h));
    }
  }
}
