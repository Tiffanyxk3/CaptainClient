/*
 * Graphic object for testing various features. Can be injected into the 'PlayField'
 * scene and used as a way to generate signals/events in a more simplified way
 * than what finished development will look like (ie. click a button rather than
 * drag and drop an object)
 */


import k from '../kaboom/kaboom.js';

import InterfaceComponent from '../kaboom/components/interfaceComponent.js';
import State from '../../shared/state.js';

export function TestLevelChange(x, y, width, height, stageFuncs, lvlFuncs) {
    this.init(x, y, width, height, stageFuncs, lvlFuncs);
    this.build = () => { this.buildObject(); };
}


TestLevelChange.prototype.init = function(x, y, width, height, stageFuncs, lvlFuncs) {
    this.params = {
        screenX: x,
        screenY: y,
        screenWidth: width,
        screenHeight: height,

        stageFuncs: stageFuncs,
        lvlFuncs: lvlFuncs,

        yOffsetRatio: 0.1, // ratio of spacing from top of screen (offets menu lower from center)

        xInnerOffsetRatio: 0.03, // ratio of distance from left/right-most objects to menu left/right boundary
        yInnerOffsetRatio: 0.04, // ratio of distance from top/bottom of objects to menu top/bottom

        xOuterOffsetRatio: 0.05, // ratio of distance from screen left/right to boundary of menu
        yOuterOffsetRatio: 0.05, // ratio of distance from screen top/button to boundary of menu

        xButtonSpacerRatio: 0.05, // ratio of x-spacing ratio based on button width
        yButtonSpacerRatio: 0.15, // ratio of y-spacing ratio based on button height

        textWidthRatio: 0.75, // ratio of text width based on button width
        textHeightRatio: 0.6 // ratio of text height based on button height
    }

    this.params['yOffsetSpacer'] = height * this.params.yOffsetRatio;

    this.params['xOuterSpacer'] = width * this.params.xOuterOffsetRatio;
    this.params['yOuterSpacer'] = (height - this.params.yOffsetSpacer) * this.params.yOuterOffsetRatio;
    
    this.params['width'] = width - (this.params.xOuterSpacer * 2);
    this.params['height'] = (height - this.params.yOffsetSpacer) - (this.params.yOuterSpacer * 2);

    this.params['x'] = x + ((width - this.params.width) / 2);
    this.params['y'] = y + ((height - this.params.height + this.params.yOffsetSpacer) / 2);

    this.params['xInnerSpacer'] = this.params.width * this.params.xInnerOffsetRatio;
    this.params['yInnerSpacer'] = this.params.height * this.params.yInnerOffsetRatio;

    this.params['xBtnSpacer'] = this.params.width * this.params.xButtonSpacerRatio;
    this.params['yBtnSpacer'] = this.params.height * this.params.yButtonSpacerRatio;

    this.params['btnWidth'] = ((this.params.width - (2 * this.params.xInnerSpacer) 
                                    - this.params.xBtnSpacer) / 2);
    this.params['btnHeight'] = ((this.params.height - (2 * this.params.yInnerSpacer) 
                                    - this.params.yBtnSpacer) / 2);

    this.params['textWidth'] = this.params.btnWidth * this.params.textWidthRatio;
    this.params['textHeight'] = this.params.btnHeight * this.params.textHeightRatio;


    this.objects = {};
    this.objects['stageDownBtn'] = {
        x: this.params.x + this.params.xInnerSpacer,
        y: this.params.y + this.params.yInnerSpacer
    };
    this.objects['stageUpBtn'] = {
        x: this.objects.stageDownBtn.x + this.params.btnWidth + this.params.xBtnSpacer,
        y: this.objects.stageDownBtn.y
    };
    this.objects['lvlDownBtn'] = {
        x: this.objects.stageDownBtn.x,
        y: this.objects.stageDownBtn.y + this.params.btnHeight + this.params.yBtnSpacer
    };
    this.objects['lvlUpBtn'] = {
        x: this.objects.stageUpBtn.x,
        y: this.objects.lvlDownBtn.y
    };

    // Centers all of the button text
    this.objects['textObjs'] = {};
    Object.entries(this.objects).forEach(([key, val]) => {
        this.objects.textObjs[key] = {
            x: val.x + (Math.abs(this.params.btnWidth / 2) 
                        - (this.params.textWidth / 2)),
            y: val.y + (Math.abs(this.params.btnHeight / 2) 
                        - (this.params.textHeight / 2))
        }
    });
}


TestLevelChange.prototype.buildObject = function() {

    // Stage Down
    let stageDownBtn = k.add([
        k.rect(this.params.btnWidth, this.params.btnHeight),
        k.pos(this.objects.stageDownBtn.x, this.objects.stageDownBtn.y),
        k.area(),
        k.color(86, 199, 95),
        k.opacity(0.8),
        k.outline(2, k.color(0, 0, 0)),
    ]);
    stageDownBtn.clicks(this.params.stageFuncs.down);

    k.add([
        k.text("Stage Down", { size: this.params.textHeight, 
                                width: this.params.textWidth }),
        k.pos(this.objects.textObjs.stageDownBtn.x, this.objects.textObjs.stageDownBtn.y),
        k.color(0, 0, 0),
        k.opacity(0.8)
    ]);

    // Stage Up
    let stageUpBtn = k.add([
        k.rect(this.params.btnWidth, this.params.btnHeight),
        k.pos(this.objects.stageUpBtn.x, this.objects.stageUpBtn.y),
        k.area(),
        k.color(86, 199, 95),
        k.opacity(0.8),
        k.outline(2, k.color(0, 0, 0)),
    ]);
    stageUpBtn.clicks(this.params.stageFuncs.up);

    k.add([
        k.text("Stage Up", { size: this.params.textHeight, 
                                width: this.params.textWidth }),
        k.pos(this.objects.textObjs.stageUpBtn.x, this.objects.textObjs.stageUpBtn.y),
        k.color(0, 0, 0),
        k.opacity(0.8)
    ]);



    // Level Down
    let lvlDownBtn = k.add([
        k.rect(this.params.btnWidth, this.params.btnHeight),
        k.pos(this.objects.lvlDownBtn.x, this.objects.lvlDownBtn.y),
        k.area(),
        k.color(86, 199, 95),
        k.opacity(0.8),
        k.outline(2, k.color(0, 0, 0)),
    ]);
    lvlDownBtn.clicks(this.params.lvlFuncs.down);

    k.add([
        k.text("Level Down", { size: this.params.textHeight, 
                                width: this.params.textWidth }),
        k.pos(this.objects.textObjs.lvlDownBtn.x, this.objects.textObjs.lvlDownBtn.y),
        k.color(0, 0, 0),
        k.opacity(0.8)
    ]);

    // Level Up
    let lvlUpBtn = k.add([
        k.rect(this.params.btnWidth, this.params.btnHeight),
        k.pos(this.objects.lvlUpBtn.x, this.objects.lvlUpBtn.y),
        k.area(),
        k.color(86, 199, 95),
        k.opacity(0.8),
        k.outline(2, k.color(0, 0, 0)),
    ]);
    lvlUpBtn.clicks(this.params.lvlFuncs.up);

    k.add([
        k.text("Level Up", { size: this.params.textHeight, 
                                width: this.params.textWidth }),
        k.pos(this.objects.textObjs.lvlUpBtn.x, this.objects.textObjs.lvlUpBtn.y),
        k.color(0, 0, 0),
        k.opacity(0.8)
    ]);
}

export default TestLevelChange;