import {
  BALL_RADIUS,
  CUSHION_POINTS,
  POCKET_DISTANCE,
  POCKET_POINTS,
} from './constants';
import { Hooker } from './hooker';
import { Renderer } from './renderer';

const iframe = document.querySelector(
  'iframe#iframe-game'
) as HTMLIFrameElement;
const gameCanvas = iframe.contentWindow.document.querySelector('canvas');

Hooker.init(iframe.contentWindow, gameCanvas);
Renderer.init(gameCanvas.parentElement, gameCanvas.width, gameCanvas.height);

onAnimationFrame();

function onAnimationFrame() {
  Renderer.clear();

  for (const point of POCKET_POINTS) {
    Renderer.drawCircle(point, POCKET_DISTANCE / 2);
  }

  for (let i = 0; i < CUSHION_POINTS.length; i++) {
    const p1 = CUSHION_POINTS[i];
    const p2 = CUSHION_POINTS[(i + 1) % CUSHION_POINTS.length];
    Renderer.drawLine(p1, p2);
  }

  for (const ball of Hooker.balls) {
    Renderer.drawCircle(ball.position, BALL_RADIUS);
  }

  if (Hooker.balls.length > 0) {
    // const table = new Table(balls, balls[0], 1, 90, 0, 0);
    // while (table.hasMotion) {
    //   table.processFrame();
    // }
  }

  requestAnimationFrame(onAnimationFrame);
}
