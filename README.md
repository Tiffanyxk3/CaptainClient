# LeetCode: System Defense AKA **Captain Client**

*A game that teaches system design concepts*

## Overview

This is a beta version for the system defense game. It includes a `Node.js` & `Fastify.js` app that utilizes[`Kaboom.js`](https://kaboomjs.com/)to provide a user interface. The current status is a homescreen with a "play" button that takes the user to a new screen with a level view. The level contains a preset collection of components that are placed on the screen with others residing in the lower "selection bar" for the user to drag and drop onto the field. There is also a test panel that can be used as a means to easily move through different levels (scenarios). There is also an operational timer that is controlled by buttons in the status bar. For proof of concept, the timer decrements the displayed clock as well as increments the user score and money with every interval. The speedup button is cyclical with the initial speed being 1x then the interval will be cut in half and the speed becomes 2x with another click and finally the initial interval length is cut into a third and the speed becomes 3x. After the speedup is at 3x, if clicked again, the speedup button will return the game speed to 1x.

**NOTE**: there are many features that are either missing entirely or only print out console information. It is helpful to have the browser's *JavaScript Console* open when playing around with the app to see what information is being exchanged under the hood.

## Installation/Build

*Prerequisite is having Node.js >=12.0.0 installed in the environment. For more information please see the [Node.js download page](https://nodejs.org/en/download/)*

1. `cd <whatever directory to store the code>`
2. `git clone https://github.com/jonrahoi/system_defense.git`
3. `cd system_defense`
4. `npm install`
5. `npm start`
6. Visit the address provided in the output of the above command (will most likely be **127.0.0.1:3000** or **[::1]:3000** which translates to `localhost:3000`)

## Usage

Upon clicking the `Play` button on the home page, there will be a level scene displayed. The clients are the icons that are in the smaller rectangle on the left while the processors are in the larger rectangle on the right. 

### User Controls

- *<u>Left Click</u>* on an icon on the field: will shade the icon green indicating it has been selected. While it is selected, if the user presses `backspace`, the icon will be deleted (although it must be a component the **user explicitely put on the field**).
- <u>*Left Click*</u> in empty space: will clear any selection
- <u>*Delete Key*</u> without a valid selection: will clear any selection
- <u>*Right Click*</u> on an icon on the field: will shade the icon purple indicating it is waiting for the user to **right click** another icon in order to form a connection.
- <u>*Left Click*</u> and drag: can move any icon in the processor space within its rectangle.
