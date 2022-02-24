import { Vector } from "./vector";

export enum State {
  IN_PLAY = 1,
  IN_POCKET = 2,
  POCKETED = 3,
}

export class Ball {
  state = State.IN_PLAY;

  velocity = new Vector(0, 0, 0);
  spin = new Vector(0, 0, 0);

  get canInteract() {
    return this.state === State.IN_PLAY || this.state === State.IN_POCKET;
  }

  constructor(public position: Vector) {}

  isMovingOrSpinning() {
    return (
      this.isMoving() ||
      0 !== this.spin.x ||
      0 !== this.spin.y ||
      0 !== this.spin.z
    );
  }

  isMoving() {
    return 0 !== this.velocity.x || 0 !== this.velocity.y;
  }

  move(time: number) {
    this.position.x += this.velocity.x * time;
    this.position.y += this.velocity.y * time;
  }

  stopMoving() {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.spin.x = 0;
    this.spin.y = 0;
    this.spin.z = 0;
  }

  setInPocket() {
    this.state = State.IN_POCKET;
  }

  setPocketed() {
    this.stopMoving();
    this.state = State.POCKETED;
  }
}
