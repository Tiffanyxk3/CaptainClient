/*
 * Basic scene to signal game over. Needs improvement...
 */


import k from '../kaboom/kaboom.js';

export function GameOver(win=false) {
    this.init(win);
    
    this.scene = (color) => { this.buildScene(color); };
};

GameOver.prototype.init = function(win) {
    let text, backgroundColor, textColor;
    if (win == true) {
        text = 'Congratulations! You Win!';
        backgroundColor = k.color(252, 211, 3);
        textColor = k.color(0, 0, 0);
    } else {
        text = 'Game Over...';
        backgroundColor = k.color(0, 0, 0);
        textColor = k.color(235, 25, 21);
    }

    this.params = {
        backdropColor: k.color(180, 200, 250),
        backdropOpacity: k.opacity(1),

        backgroundColor: backgroundColor,
        backgroundOpacity: k.opacity(0.8),

        textColor: textColor,
        textOpacity: k.opacity(0.8),

        widthRatio: 0.25, // based on total screen width
        heightRatio: 0.25, // based on total screen height
        
        textWidthRatio: 0.85, // based on panel size
        textHeightRatio: 0.20, // based on panel size
    };

    this.params['width'] = k.width() * this.params.widthRatio;
    this.params['height'] = k.height() * this.params.heightRatio;
    
    this.params['x'] = (k.width() / 2) - (this.params.width / 2);
    this.params['y'] = (k.height() / 2) - (this.params.height / 2);

    this.params['textObjs'] = {
        title: {
            value: text,
            width: this.params.width * this.params.textWidthRatio,
            height: this.params.height * this.params.textHeightRatio
        }
    };
    this.params.textObjs.title['x'] = this.params.x + (this.params.width / 2) - (this.params.textObjs.title.width / 2);
    this.params.textObjs.title['y'] = this.params.y + (this.params.height / 2) - (this.params.textObjs.title.height / 2);
};

GameOver.prototype.buildScene = function(color) {
    // Background
    k.add([
        k.rect(k.width(), k.height()),
        k.color(color),
        this.params.backdropOpacity,
    ]);


    // Display rect
    k.add([
        k.rect(this.params.width, this.params.height),
        k.pos(this.params.x, this.params.y),
        this.params.backgroundColor,
        this.params.backgroundOpacity,
    ]);

    // Display text
    let title = this.params.textObjs.title;
    k.add([
        k.text(title.value, { size: title.height, width: title.width }),
        k.pos(title.x, title.y),
        this.params.textColor,
    ]);

    // Shake the screen (for fun :) )
    k.shake(10);
};

export default GameOver;