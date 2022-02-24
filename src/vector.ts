export class Vector {
  get length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  constructor(public x: number, public y: number, public z: number) {}

  transpose(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
  }

  scale(factor: number) {
    this.x *= factor;
    this.y *= factor;
    this.z *= factor;
  }

  copy() {
    return new Vector(this.x, this.y, this.z);
  }
}
