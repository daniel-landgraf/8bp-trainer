import { Ball, State } from './ball';
import {
  Collision,
  BallWithCornerCollision,
  BallWithBallCollision,
  BallWithCushionCollision,
} from './collision';
import {
  ALMOST_ZERO,
  BALL_RADIUS,
  CUSHION_POINTS,
  HALF_TABLE_HEIGHT,
  HALF_TABLE_WIDTH,
  POCKET_DISTANCE,
  POCKET_POINTS,
} from './constants';
import { Physics } from './physics';
import { Renderer } from './renderer';

const CUE_PROPERTIES_MAX_POWER = 520.6;
const CUE_PROPERTIES_SPIN = 0.37931034482758624;

const FRAME_TIME = 0.005;

const BALL_TOWARDS_POCKET_SPEED = 120;
const BALL_IN_POCKET_SPEED = 1.5;

const MAX_LINE_WIDTH = 5;

export class Table {
  get hasMotion() {
    return this.balls.some((b) => b.isMovingOrSpinning());
  }

  constructor(
    private balls: Ball[],
    cueBall: Ball,
    power: number,
    angle: number,
    spinX: number,
    spinY: number
  ) {
    this.setCueBallMovement(
      cueBall,
      power,
      angle,
      spinX * CUE_PROPERTIES_SPIN,
      -spinY * CUE_PROPERTIES_SPIN
    );
  }

  private setCueBallMovement(
    cueBall: Ball,
    power: number,
    angle: number,
    spinX: number,
    spinY: number
  ) {
    const actualPower = (1 - Math.sqrt(1 - power)) * CUE_PROPERTIES_MAX_POWER;
    const sin = Math.sin(angle);
    const cos = Math.cos(angle);

    cueBall.velocity.x = cos * actualPower;
    cueBall.velocity.y = sin * actualPower;
    cueBall.spin.x = (-sin * spinY * actualPower) / BALL_RADIUS;
    cueBall.spin.y = (cos * spinY * actualPower) / BALL_RADIUS;
    cueBall.spin.z = (spinX * actualPower) / BALL_RADIUS;
  }

  processFrame() {
    const time = FRAME_TIME;

    for (let remainingTime = time; remainingTime > ALMOST_ZERO; ) {
      let processedTime = remainingTime;
      const collision = this.getCollision(processedTime);

      if (collision) {
        processedTime = collision.time;
      }

      for (const ball of this.balls) {
        if (
          (ball.isMovingOrSpinning() && ball.state === State.IN_PLAY) ||
          ball.state === State.IN_POCKET
        ) {
          const prevPosition = ball.position.copy();
          ball.move(processedTime);

          Renderer.drawLine(
            prevPosition,
            ball.position,
            (ball.velocity.length / CUE_PROPERTIES_MAX_POWER) * MAX_LINE_WIDTH
          );
        }
      }

      if (collision) {
        this.handleCollision(collision);
      }

      remainingTime -= processedTime;
    }

    this.finishFrame(time);
  }

  private getCollision(time: number) {
    let result: Collision;

    for (const ball of this.balls) {
      if (ball.canInteract) {
        const collision = this.detectBallCollision(ball, time);
        if (collision) {
          result = collision;
          time = collision.time;
        }
      }
    }

    return result;
  }

  private detectBallCollision(ball: Ball, time: number) {
    let result: Collision;

    if (ball.state === State.IN_PLAY) {
      for (let i = this.balls.indexOf(ball) + 1; i < this.balls.length; i++) {
        const collisionTime = Physics.getBallWithBallCollisionTime(
          ball,
          this.balls[i],
          time
        );

        if (this.balls[i].state === State.IN_PLAY && collisionTime < time) {
          const dx = ball.velocity.x - this.balls[i].velocity.x;
          const dy = ball.velocity.y - this.balls[i].velocity.y;

          result = new BallWithBallCollision(
            ball,
            this.balls[i],
            collisionTime,
            Math.sqrt(dx * dx + dy * dy)
          );

          time = collisionTime;
        }
      }
    }

    let left: number;
    let bottom: number;
    let right: number;
    let top: number;

    if (0 < ball.velocity.x) {
      left = ball.position.x;
      right = left + ball.velocity.x * time;
    } else {
      right = ball.position.x;
      left = right + ball.velocity.x * time;
    }

    if (0 < ball.velocity.y) {
      bottom = ball.position.y;
      top = bottom + ball.velocity.y * time;
    } else {
      top = ball.position.y;
      bottom = top + ball.velocity.y * time;
    }

    if (
      left < -HALF_TABLE_WIDTH + BALL_RADIUS ||
      right > HALF_TABLE_WIDTH - BALL_RADIUS ||
      bottom < -HALF_TABLE_HEIGHT + BALL_RADIUS ||
      top > HALF_TABLE_HEIGHT - BALL_RADIUS
    ) {
      if (ball.state === State.IN_PLAY) {
        for (const pocketPoint of POCKET_POINTS) {
          const dx = pocketPoint.x - ball.position.x;
          const dy = pocketPoint.y - ball.position.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < POCKET_DISTANCE) {
            ball.velocity.transpose(
              dx * BALL_TOWARDS_POCKET_SPEED * time,
              dy * BALL_TOWARDS_POCKET_SPEED * time
            );

            if (distance < BALL_RADIUS) {
              ball.setInPocket();
            }
          }
        }
      } else if (ball.state === State.IN_POCKET) {
        ball.velocity.transpose(
          -ball.position.x * BALL_IN_POCKET_SPEED * time,
          -ball.position.y * BALL_IN_POCKET_SPEED * time
        );
      }

      for (let i = 0; i < CUSHION_POINTS.length; i++) {
        const p1 = CUSHION_POINTS[i];
        const p2 = CUSHION_POINTS[(i + 1) % CUSHION_POINTS.length];

        let collisionTime = Physics.getBallWithCushionCollisionTime(
          ball,
          p1,
          p2,
          time
        );

        if (collisionTime < time) {
          result = new BallWithCushionCollision(
            ball,
            -Physics.calculateTheta(p2.x - p1.x, p2.y - p1.y),
            collisionTime,
            ball.velocity.length
          );

          time = collisionTime;
        }

        collisionTime = Physics.getBallWithCornerCollisionTime(ball, p1, time);

        if (collisionTime < time) {
          result = new BallWithCornerCollision(
            ball,
            p1,
            collisionTime,
            ball.velocity.length
          );

          time = collisionTime;
        }
      }
    } else if (ball.state === State.IN_POCKET) {
      ball.setPocketed();
    }

    return result;
  }

  private handleCollision(collision: Collision) {
    collision.time = Date.now();

    if (collision instanceof BallWithBallCollision) {
      Physics.handleBallWithBallCollision(collision.ball1, collision.ball2);
    } else if (collision instanceof BallWithCushionCollision) {
      Physics.handleBallWithCushionCollision(collision.ball, collision.theta);
    } else if (collision instanceof BallWithCornerCollision) {
      const dx = collision.point.x - collision.ball.position.x;
      const dy = collision.point.y - collision.ball.position.y;
      const theta = -Physics.calculateTheta(dy, -dx);
      Physics.handleBallWithCushionCollision(collision.ball, theta);
    }
  }

  private finishFrame(time: number) {
    for (const ball of this.balls) {
      if (ball.canInteract) {
        Physics.finish(ball, time);
      }
    }
  }
}
