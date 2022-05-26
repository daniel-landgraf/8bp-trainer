import {
  BALL_RADIUS,
  GAME_TABLE_LOWER_BOUND,
  GAME_TABLE_UPPER_BOUND,
  HALF_TABLE_WIDTH,
} from './constants';
import { Vector } from './vector';

const MIN_LINE_WIDTH = 0.4;

export class Renderer {
  private static trainerCanvas: HTMLCanvasElement;
  private static ctx: CanvasRenderingContext2D;

  static get width() {
    return Renderer.trainerCanvas.width;
  }
  static get height() {
    return Renderer.trainerCanvas.height;
  }

  static init(parent: HTMLElement, width: number, height: number) {
    Renderer.trainerCanvas = parent.ownerDocument.createElement('canvas');

    Renderer.trainerCanvas.width = width;
    Renderer.trainerCanvas.height = height;

    Renderer.trainerCanvas.style.position = 'absolute';
    Renderer.trainerCanvas.style.top = '0';
    Renderer.trainerCanvas.style.left = '0';

    Renderer.trainerCanvas.style.pointerEvents = 'none';

    parent.appendChild(Renderer.trainerCanvas);

    Renderer.ctx = Renderer.trainerCanvas.getContext('2d');
  }

  static clear() {
    Renderer.ctx.clearRect(0, 0, Renderer.width, Renderer.height);
  }

  static drawCircle(center: Vector, radius: number) {
    Renderer.ctx.beginPath();

    const worldPos = Renderer.getBallPosition(center);
    const worldRadius = Renderer.scaleNumber(radius);
    Renderer.ctx.arc(worldPos.x, worldPos.y, worldRadius, 0, Math.PI * 2);

    Renderer.stroke();
  }

  static drawLine(from: Vector, to: Vector, width = 1) {
    Renderer.ctx.beginPath();

    const fromWorldPos = Renderer.getBallPosition(from);
    const toWorldPos = Renderer.getBallPosition(to);
    Renderer.ctx.moveTo(fromWorldPos.x, fromWorldPos.y);
    Renderer.ctx.lineTo(toWorldPos.x, toWorldPos.y);

    Renderer.stroke(width);
  }

  private static getBallPosition(physicsPosition: Vector) {
    const normHeight = GAME_TABLE_UPPER_BOUND - GAME_TABLE_LOWER_BOUND;
    const ratio = Renderer.width / Renderer.height;
    const yOffset = (GAME_TABLE_UPPER_BOUND + GAME_TABLE_LOWER_BOUND) / 2;
    const innerTableWidth = HALF_TABLE_WIDTH - BALL_RADIUS * 2;

    const xNorm = (physicsPosition.x * normHeight) / (innerTableWidth * ratio);
    const yNorm = (-physicsPosition.y * normHeight) / innerTableWidth - yOffset;
    return new Vector(
      (xNorm * Renderer.width) / 2 + Renderer.width / 2,
      (yNorm * Renderer.height) / 2 + Renderer.height / 2,
      0
    );
  }

  private static scaleNumber(num: number) {
    const normHeight = GAME_TABLE_UPPER_BOUND - GAME_TABLE_LOWER_BOUND;
    const innerTableWidth = HALF_TABLE_WIDTH - BALL_RADIUS * 2;
    const norm = (num * normHeight) / innerTableWidth;
    return (norm * Renderer.height) / 2;
  }

  private static stroke(width = 1) {
    if (width < MIN_LINE_WIDTH) {
      width = MIN_LINE_WIDTH;
    }

    Renderer.ctx.strokeStyle = 'deeppink';
    Renderer.ctx.lineWidth = width;

    Renderer.ctx.stroke();
  }
}
