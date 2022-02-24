import { Ball } from "./ball";
import { BALL_RADIUS, HALF_TABLE_WIDTH } from "./constants";
import { Renderer } from "./renderer";
import { Vector } from "./vector";

const MIN_RADIUS_TOLERANCE = 0.95;
const MAX_RADIUS_TOLERANCE = 1.1;

const WHITE_MATCH_PERCENTAGE = 0.8;
const MAX_CALL_COUNT = 5000;

export class Detector {
  private get radius() {
    const ratio = HALF_TABLE_WIDTH / BALL_RADIUS;
    const avg = this.renderer.height / ratio;
    const min = avg * MIN_RADIUS_TOLERANCE;
    const max = avg * MAX_RADIUS_TOLERANCE;
    return { min, max };
  }

  constructor(private renderer: Renderer) {}

  detectBalls() {
    // for now we use OpenCV for circle detection, but later on we'll write our own detection algorithm
    const cv = window["cv"];

    const openCvImage = cv.imread(this.renderer["canvas"]);
    cv.cvtColor(openCvImage, openCvImage, cv.COLOR_BGR2GRAY, 0);

    const circles = new cv.Mat();
    cv.HoughCircles(
      openCvImage,
      circles,
      cv.HOUGH_GRADIENT,
      1,
      this.radius.min * 2,
      100,
      10,
      this.radius.min,
      this.radius.max
    );

    const balls: Ball[] = [];

    for (let i = 0; i < circles.cols; i++) {
      const x = circles.data32F[i * 3];
      const y = circles.data32F[i * 3 + 1];
      const radius = circles.data32F[i * 3 + 2];

      const worldCoord = new Vector(x, y, 0);
      const ballCoord = this.renderer.getPhysicsCoord(worldCoord);
      balls.push(new Ball(ballCoord));

      this.renderer.drawCircle(worldCoord, radius);
    }

    circles.delete();
    openCvImage.delete();

    return balls;
  }

  detectCueBall(balls: Ball[]) {
    let largestAmount = 0;
    let cueBall: Ball;
    for (const ball of balls) {
      const worldCoord = this.renderer.getWorldCoord(ball.position);

      const h = worldCoord.x;
      const k = worldCoord.y;
      const r = this.radius.min;
      const f1 = (x: number) => k + Math.sqrt(r * r - (x - h) * (x - h));
      const f2 = (x: number) => k - Math.sqrt(r * r - (x - h) * (x - h));

      let amount = 0;

      for (let x = h - r; x <= h + r; x++) {
        const y1 = f1(x);
        const y2 = f2(x);

        for (let y = y2; y <= y1; y++) {
          const color = this.renderer.getPixelColor(x, y);
          if (color > WHITE_MATCH_PERCENTAGE * 255) {
            amount++;
          }
        }
      }

      if (amount > largestAmount) {
        largestAmount = amount;
        cueBall = ball;
      }
    }

    if (cueBall) {
      const cueBallWorldPos = this.renderer.getWorldCoord(cueBall.position);
      this.renderer.drawCircle(cueBallWorldPos, this.radius.max / 2, true);
    }

    return cueBall;
  }

  detectAimBall(cueBall: Ball, balls: Ball[]) {
    const aimLineCoords: Vector[] = [];
    const worldCoord = this.renderer.getWorldCoord(cueBall.position);

    const aimBall = this.processAimLineCoord(
      worldCoord,
      aimLineCoords,
      balls.filter((b) => b !== cueBall)
    );

    if (aimBall) {
      const aimBallWorldPos = this.renderer.getWorldCoord(aimBall.position);
      this.renderer.drawCircle(aimBallWorldPos, this.radius.min / 2, true);
    }

    return { aimBall, aimLineCoords };
  }

  detectAngle(cueBall: Ball, aimBall: Ball, aimLineCoords: Vector[]) {
    let totalX = 0;
    let totalY = 0;

    for (const coord of aimLineCoords) {
      const physicsCoord = this.renderer.getPhysicsCoord(coord);
      totalX += physicsCoord.x;
      totalY += physicsCoord.y;
    }

    const avgX = totalX / aimLineCoords.length;
    const avgY = totalY / aimLineCoords.length;

    let sumP = 0;
    let sumQ = 0;

    for (const coord of aimLineCoords) {
      const physicsCoord = this.renderer.getPhysicsCoord(coord);
      const x = physicsCoord.x;
      const y = physicsCoord.y;
      sumP += (x - avgX) * (y - avgY);
      sumQ += (x - avgX) * (x - avgX);
    }

    const m = sumP / sumQ;
    const b = avgY - m * avgX;
    const f = (x: number) => m * x + b;

    const x1 = cueBall.position.x;
    const y1 = f(x1);
    const x2 = aimBall.position.x;
    const y2 = f(x2);

    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.atan2(dy, dx);
  }

  private processAimLineCoord(
    coord: Vector,
    aimLineCoords: Vector[],
    balls: Ball[]
  ) {
    if (aimLineCoords.every((c) => c.x !== coord.x || c.y !== coord.y)) {
      const color = this.renderer.getPixelColor(coord.x, coord.y);
      if (
        (color > WHITE_MATCH_PERCENTAGE * 255 &&
          aimLineCoords.length < MAX_CALL_COUNT) ||
        aimLineCoords.length === 0
      ) {
        aimLineCoords.push(coord);
        this.renderer.drawPixel(coord);

        let insideBall: Ball;

        for (const ball of balls) {
          const ballCoord = this.renderer.getWorldCoord(ball.position);
          const dx = ballCoord.x - coord.x;
          const dy = ballCoord.y - coord.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < this.radius.max) {
            insideBall = ball;
            break;
          }
        }

        insideBall =
          insideBall ||
          this.processAimLineCoord(
            new Vector(coord.x + 1, coord.y, 0),
            aimLineCoords,
            balls
          );

        insideBall =
          insideBall ||
          this.processAimLineCoord(
            new Vector(coord.x - 1, coord.y, 0),
            aimLineCoords,
            balls
          );

        insideBall =
          insideBall ||
          this.processAimLineCoord(
            new Vector(coord.x, coord.y + 1, 0),
            aimLineCoords,
            balls
          );

        insideBall =
          insideBall ||
          this.processAimLineCoord(
            new Vector(coord.x, coord.y - 1, 0),
            aimLineCoords,
            balls
          );

        return insideBall;
      }
    }
  }
}
