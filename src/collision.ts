import { Ball } from "./ball";
import { Vector } from "./vector";

export abstract class Collision {
  constructor(public time: number, public force: number) {}
}

export class BallWithBallCollision extends Collision {
  constructor(
    public ball1: Ball,
    public ball2: Ball,
    time: number,
    force: number
  ) {
    super(time, force);
  }
}

export class BallWithCushionCollision extends Collision {
  constructor(
    public ball: Ball,
    public theta: number,
    time: number,
    force: number
  ) {
    super(time, force);
  }
}

export class BallWithCornerCollision extends Collision {
  constructor(
    public ball: Ball,
    public point: Vector,
    time: number,
    force: number
  ) {
    super(time, force);
  }
}
