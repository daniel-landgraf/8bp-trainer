import { Ball } from './ball';
import {
  BALL_RADIUS,
  GAME_TABLE_LOWER_BOUND,
  GAME_TABLE_UPPER_BOUND,
  HALF_TABLE_WIDTH,
} from './constants';
import { Vector } from './vector';

const BALL_WEBGL_ELEMENT_COUNT = 1536;
const BALL_WEBGL_MATRIX_UNIFORM_NAME = 'CC_MVPMatrix';

const MAX_LOG_COUNT = 1000;

export class Hooker {
  static balls: Ball[] = [];
  static mousePosition = new Vector(0, 0, 0);
  static mouseButtonDown = false;

  private static gameCanvas: HTMLCanvasElement;
  private static ctx: WebGLRenderingContext;
  private static shaderProgram: WebGLProgram;
  private static logCount = 0;

  static init(window: Window, gameCanvas: HTMLCanvasElement) {
    gameCanvas.addEventListener('mousemove', (ev) => {
      Hooker.mousePosition = new Vector(ev.offsetX, ev.offsetY, 0);
    });

    gameCanvas.addEventListener('mousedown', (ev) => {
      Hooker.mouseButtonDown = true;
    });

    gameCanvas.addEventListener('mouseup', (ev) => {
      Hooker.mouseButtonDown = false;
    });

    Hooker.gameCanvas = gameCanvas;
    Hooker.ctx = gameCanvas.getContext('webgl');

    const webglPrototype = window['WebGLRenderingContext']
      .prototype as WebGLRenderingContext;

    const useProgramFn = webglPrototype.useProgram;
    const clearFn = webglPrototype.clear;
    const drawElementsFn = webglPrototype.drawElements;

    webglPrototype.useProgram = function (program) {
      Hooker.shaderProgram = program;
      return useProgramFn.call(this, program);
    };

    webglPrototype.clear = function (mask) {
      Hooker.balls = [];
      return clearFn.call(this, mask);
    };

    webglPrototype.drawElements = function (mode, count, type, offset) {
      if (count === BALL_WEBGL_ELEMENT_COUNT) {
        const location = Hooker.ctx.getUniformLocation(
          Hooker.shaderProgram,
          BALL_WEBGL_MATRIX_UNIFORM_NAME
        );
        const uniform = Hooker.ctx.getUniform(Hooker.shaderProgram, location);
        const position = Hooker.convertBallPosition(uniform[12], uniform[13]);
        if (position.x < HALF_TABLE_WIDTH) {
          Hooker.balls.push(new Ball(position));
        }
      }

      return drawElementsFn.call(this, mode, count, type, offset);
    };
  }

  static convertBallPosition(xNorm: number, yNorm: number) {
    const normHeight = GAME_TABLE_UPPER_BOUND - GAME_TABLE_LOWER_BOUND;
    const ratio = Hooker.gameCanvas.width / Hooker.gameCanvas.height;
    const yOffset = (GAME_TABLE_UPPER_BOUND + GAME_TABLE_LOWER_BOUND) / 2;
    const innerTableWidth = HALF_TABLE_WIDTH - BALL_RADIUS * 2;
    return new Vector(
      (xNorm / normHeight) * innerTableWidth * ratio,
      ((yNorm - yOffset) / normHeight) * innerTableWidth,
      0
    );
  }

  private static safeLog(...data: any[]) {
    Hooker.logCount++;
    if (Hooker.logCount > MAX_LOG_COUNT) {
      console.clear();
      Hooker.logCount = 0;
    }
    console.log(...data);
  }
}
