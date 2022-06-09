# 8bp-trainer

A little trainer program that helps you to maneuver your next shot in Miniclip's 8 Ball Pool. This trainer isn't entirely accurate, it will help you to perform better shots in general though.

## How to use it

- Download Node.js from https://nodejs.org/en/
- Clone this repository: `git clone https://github.com/daniel-landgraf/8bp-trainer.git`
- Inside the root directory of the cloned repository:
  - Run `npm install`
  - Run `npm start`
  - Copy the contents of `dist/trainer.js` to your clipboard
- In your browser, open up https://www.miniclip.com/games/8-ball-pool-multiplayer/en/focus/
- Wait until the game has loaded
- Toggle your browser's dev tools by pressing the `F12` key
- Now paste the previously copied trainer code from your clipboard into the browser's dev console and press `Enter`
- Start a new pool match. The pink lines you see represent the balls paths when a shot is taken with maximum force.
- Happy hacking!

If necessary, play around with the first two constants in `src/constants.ts` (they represent the highest and lowest possible WebGL coordinates of a ball on the vertical axis).
