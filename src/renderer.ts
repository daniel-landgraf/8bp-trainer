import { HALF_TABLE_HEIGHT, HALF_TABLE_WIDTH } from "./constants";
import { Vector } from "./vector";

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private currentImageData: ImageData;

  get width() {
    return this.canvas.width;
  }
  get height() {
    return this.canvas.height;
  }

  constructor(width: number, height: number) {
    this.canvas = document.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.canvas.width = width;
    this.canvas.height = height;
  }

  drawVideoFrame(
    video: HTMLVideoElement,
    sx: number,
    sy: number,
    sw: number,
    sh: number
  ) {
    this.ctx.filter = "grayscale(1)";
    this.ctx.drawImage(video, sx, sy, sw, sh, 0, 0, this.width, this.height);
    this.ctx.filter = "none";

    this.currentImageData = this.ctx.getImageData(
      0,
      0,
      this.width,
      this.height
    );
  }

  drawCircle(center: Vector, radius: number, fill = false) {
    this.ctx.beginPath();
    this.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
    this.setStyle();

    if (fill) {
      this.ctx.fill();
    } else {
      this.ctx.stroke();
    }
  }

  drawPixel(position: Vector) {
    this.setStyle;
    this.ctx.fillRect(position.x, position.y, 1, 1);
  }

  drawLine(from: Vector, to: Vector, width = 1) {
    this.ctx.beginPath();

    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);

    this.setStyle(width);
    this.ctx.stroke();
  }

  getPixelColor(x: number, y: number) {
    return this.currentImageData.data[
      Math.round(y) * this.currentImageData.width * 4 + Math.round(x) * 4
    ];
  }

  getWorldCoord(physicsCoord: Vector) {
    const factor = this.height / HALF_TABLE_WIDTH;
    return new Vector(
      (physicsCoord.x + HALF_TABLE_WIDTH) * factor,
      (physicsCoord.y + HALF_TABLE_HEIGHT) * factor,
      0
    );
  }

  getPhysicsCoord(worldCoord: Vector) {
    const factor = HALF_TABLE_WIDTH / this.height;
    return new Vector(
      worldCoord.x * factor - HALF_TABLE_WIDTH,
      worldCoord.y * factor - HALF_TABLE_HEIGHT,
      0
    );
  }

  private setStyle(width = 1) {
    if (width < 0.5) {
      width = 0.5;
    }

    this.ctx.strokeStyle = "deeppink";
    this.ctx.fillStyle = "deeppink";
    this.ctx.lineWidth = width;
  }
}
