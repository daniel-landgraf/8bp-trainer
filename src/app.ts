import { Detector } from "./detector";
import { Renderer } from "./renderer";
import { Table } from "./table";

const SRC_LEFT = 202;
const SRC_TOP = 270;
const SRC_WIDTH = 1275;
const SRC_HEIGHT = 638;

const video = document.querySelector("video");

const renderer = new Renderer(SRC_WIDTH, SRC_HEIGHT);
const detector = new Detector(renderer);

navigator.mediaDevices
  .getDisplayMedia({
    video: true,
  })
  .then((stream) => {
    video.srcObject = stream;
    onAnimationFrame();
  });

function onAnimationFrame() {
  // const startTime = performance.now();
  // console.log(Math.round(performance.now() - startTime) + " ms");

  renderer.drawVideoFrame(video, SRC_LEFT, SRC_TOP, SRC_WIDTH, SRC_HEIGHT);

  const balls = detector.detectBalls();
  const cueBall = detector.detectCueBall(balls);
  if (cueBall) {
    const { aimBall, aimLineCoords } = detector.detectAimBall(cueBall, balls);
    if (aimBall) {
      const angle = detector.detectAngle(cueBall, aimBall, aimLineCoords);
      if (angle) {
        const table = new Table(
          renderer,
          balls.filter((b) => b !== aimBall),
          cueBall,
          1,
          angle,
          0,
          0
        );
        while (table.hasMotion) {
          table.processFrame();
        }
      }
    }
  }

  requestAnimationFrame(onAnimationFrame);
}
