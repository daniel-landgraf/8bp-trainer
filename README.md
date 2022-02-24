# 8bp-trainer

A little trainer program that helps you to maneuver your next shot in Miniclip's 8 Ball Pool. This trainer isn't entirely accurate, it will help you to perform better shots in general though.

## How to use it

- First of all you need to find a way to mirror your phone screen to your PC (for example if you are using an iPhone and your PC runs Windows, you can use LonleyScreen).
- Install Parcel globally: `npm i -g parcel`
- Clone this repository.
- Run `parcel index.html` which will compile this trainer and spin up a dev server.
- Visit the URL specified by Parcel in the console.
- The website at the given URL will immediately prompt you to select a source for sharing your screen.
- Chrome: Open the 'Window' tab and select the window of the program that mirrors your phone to the screen (e. g. select the window of LonleyScreen, don't share your whole screen, just that particular window!). Proceed similar in other browsers.
- The 8 Ball Pool table from your phone should now be visible in your browser.
- Happy hacking!

## Important

The entire play field of the pool table must be visible while its cushions must precisely be cut off. The values defined at the top of `app.ts` define a rectangle which is applied to the shared window and then drawn into the canvas. Play around with those values to see what I mean :)
