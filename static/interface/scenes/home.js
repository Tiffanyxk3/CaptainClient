
/* 
Object used as the home page/main menu of the game.


GRAPHIC SPACING DEFINITIONS

Legend:
- yO & xO = yOffset & xOffset --> provide ability to "offset" object from center
- yOS & xOS = yOuterSpacer & xOuterSpacer --> gives "cusion" between outer objects
- yIS & xIS = yInnerSpacer & yInnerSpacer --> gives "cusion" between inner objects

                        (PARENT OBJECT (aka Window/Screen))
________________________________________________________________________________
|                                        | yO                                  |
|                                       --                                     |
|                                        | yOS                                 |
|          ______________________________________________________________      |
|          |                             | yIS                          |      |
|          |                            --                              |      |
|          |                                                            |      |
|          |                                                            |      |
|          |                                                            |      |
| -- | --  | -- |                                                       |      |
| xO | xOS | xIS                                                        |      |
|          |                                                            |      |
|          |                                                            |      |
|          |                                                            |      |
|          |                                                            |      |
|          |                (CHILD OBJECT (aka MenuBox))                |      |
|          --------------------------------------------------------------      |
|                                                                              |
|                                                                              |
--------------------------------------------------------------------------------
*/

import k from '../kaboom/kaboom.js';
import { SceneControls } from '../interface.js';
import { ScaledBackground } from '../kaboom/graphicUtils.js';
import { getColor } from '../../config/settings.js';



export function Home(levelOneFunc) {
    this.levelOneFunc = levelOneFunc;
    this.init();

    // necessary to preserve `this` reference (check out arrow functions if unfamiliar)
    this.scene = (color) => { this.buildScene(color); };
};

/**
 * Initialize all parameters (sizing, position, spacing...) for the welcome scene
 */
Home.prototype.init = function() {
    
    this.params = {
        screenX: 0, // minimum x value relative to screenWidth
        screenY: 0, // minimum y value relative to screenHeight
        screenWidth: k.width(), // total screen width
        screenHeight: k.height(), // total screen height

        backdropColor: getColor(), // backdrop color (behind transparent image)
        backdropOpacity: 1, // opacity of backdrop

        titleWidthRatio: 0.45, // ratio compared to the screen width
        titleHeightRatio: 0.08, // ratio compared to the screen height
        yTitleOffsetRatio: 0.7, // ratio of y-spacing from screen top based on title height

        menuBox: {
            backgroundColor: [52, 149, 235], // background color of the menu box
            backgroundOpacity: 0.5, // opacity of the menu box
            
            yOffsetRatio: 0.6, // ratio of spacing from top of screen (offets menu lower from center)

            xInnerOffsetRatio: 0.03, // ratio of distance from left/right-most objects to menu left/right boundary
            yInnerOffsetRatio: 0.04, // ratio of distance from top/bottom of objects to menu top/bottom

            xOuterOffsetRatio: 0.4, // ratio of distance from screen left/right to boundary of menu
            yOuterOffsetRatio: 0.25, // ratio of distance from screen top/button to boundary of menu
        },

        buttons: {
            backgroundColor: [0, 0, 0], // universal color of the menu buttons
            backgroundOpacity: 0.9, // universal opacity of the menu buttons

            textColor: [255, 255, 255], // universal color of the menu buttons' text
            textOpacity: 0.9, // universal opacity of the menu buttons' text

            xButtonSpacerRatio: 0.1, // ratio of x-spacing ratio based on button width
            yButtonSpacerRatio: 0.1, // ratio of y-spacing ratio based on button height

            textWidthRatio: 0.65,
            textHeightRatio: 0.5,

            values: [ 'play', 'settings', 'instructions' ]
        }
    };

    let backgroundSize = ScaledBackground(this.params.screenWidth, this.params.screenHeight);

    // Adjusted width/height for the background image
    this.params['backgroundWidth'] = backgroundSize.width;
    this.params['backgroundHeight'] = backgroundSize.height;
    
    // Adjusted width/height for the title text
    this.params['titleWidth'] = this.params.screenWidth * this.params.titleWidthRatio;
    this.params['titleHeight'] = this.params.screenHeight * this.params.titleHeightRatio;

    // Calculated distance between top of title and top of screen
    this.params['yTitleSpacer'] = this.params.titleHeight * this.params.yTitleOffsetRatio;


    let menuBoxParams = this.params.menuBox;

    // Set spacing between the top of the screen and the top of the menu box
    menuBoxParams['yOffsetSpacer'] = this.params.screenHeight * menuBoxParams.yOffsetRatio;

    // Set spacing between the boundary of the menu box and it's neighbors (essentially expand it's bounding box)
    menuBoxParams['xOuterSpacer'] = this.params.screenWidth * menuBoxParams.xOuterOffsetRatio;
    menuBoxParams['yOuterSpacer'] = (this.params.screenHeight - menuBoxParams.yOffsetSpacer) * menuBoxParams.yOuterOffsetRatio;

    // Calculated width/height of the menu box based on the previously defined spacers and screen dimensions
    menuBoxParams['width'] = (this.params.screenWidth - (menuBoxParams.xOuterSpacer * 2));
    menuBoxParams['height'] = ((this.params.screenHeight  - menuBoxParams.yOffsetSpacer) - (menuBoxParams.yOuterSpacer * 2));

    // x & y of center of the menu box
    // half screen width - half panel width
    menuBoxParams['x'] = (this.params.screenX
        + ((this.params.screenWidth - menuBoxParams.width) / 2)); 
    
    // init y + half screen height - half panel height + offsetSpacer
    menuBoxParams['y'] = (this.params.screenY 
        + ((this.params.screenHeight - menuBoxParams.height + menuBoxParams.yOffsetSpacer) / 2)); 

    // Spacer between the boundary of the menu box and it's internal components
    menuBoxParams['xInnerSpacer'] = menuBoxParams.width * menuBoxParams.xInnerOffsetRatio;
    menuBoxParams['yInnerSpacer'] = menuBoxParams.height * menuBoxParams.yInnerOffsetRatio; 

    // Calculated button width/height based on the menu box sizing and spacers
    let buttonParams = this.params.buttons;
    let numButtons = buttonParams.values.length;
    
    // x & y spacers between each button
    buttonParams['xBtnSpacer'] = menuBoxParams.width * buttonParams.xButtonSpacerRatio;
    buttonParams['yBtnSpacer'] = menuBoxParams.height * buttonParams.yButtonSpacerRatio;

    buttonParams['btnWidth'] = (menuBoxParams.width // full box width
        - (2 * menuBoxParams.xInnerSpacer)), // left + right boundary spacer
    buttonParams['btnHeight'] = ((menuBoxParams.height // adjusted height
        - (2 * menuBoxParams.yInnerSpacer) // top + bottom boundary spacer
        - ((numButtons - 1) * buttonParams.yBtnSpacer)) // y-spacer between every button
        / numButtons); // get per-button height
    
    // Adjusted menu button text width/size based on button sizing
    buttonParams['textWidth'] = buttonParams.btnWidth * buttonParams.textWidthRatio;
    buttonParams['textHeight'] = buttonParams.btnHeight * buttonParams.textHeightRatio;

    /* 
     * Objects inside the menu (aka buttons)
     */
    this.objects = {};
    
    // The title text at the top of the screen
    this.objects['titleText'] = {
        text: 'Captain Client',
        width: this.params.titleWidth,
        height: this.params.titleHeight,
        x: this.params.screenWidth / 2,
        y: (this.params.screenY + this.params.yTitleSpacer)
    }

    let prevX = (menuBoxParams.x + menuBoxParams.xInnerSpacer + (buttonParams.btnWidth / 2));
    let currY = (menuBoxParams.y + menuBoxParams.yInnerSpacer + (buttonParams.btnHeight / 2));
    for (let btnName of buttonParams.values) {
        this.objects[`${btnName}Rect`] = {
            x: prevX,
            y: currY,
            width: buttonParams.btnWidth,
            height: buttonParams.btnHeight
        };
        this.objects[`${btnName}Text`] = {
            x: prevX,
            y: currY,
            width: buttonParams.textWidth,
            height: buttonParams.textHeight,
            text: btnName
        };
        currY += (buttonParams.btnHeight + buttonParams.yBtnSpacer);
    }
};


/**
 * Adds all of the scene's objects to the screen using the initialized parameters
 */
Home.prototype.buildScene = function(color) {
    // Backdrop color
    k.add([
        k.rect(this.params.screenWidth, this.params.screenHeight),
        k.pos(this.params.screenX, this.params.screenY),
        k.color(color),
        k.opacity(this.params.backdropOpacity)
    ]);
    
    // Background image
    k.add([
        k.sprite('home_background', { width: this.params.backgroundWidth, 
                                height: this.params.backgroundHeight}),
        k.pos(this.params.screenWidth / 2, this.params.screenHeight / 2),
        k.origin('center'),
    ]);
    
    // Menu Box
    k.add([
        k.rect(this.params.menuBox.width, this.params.menuBox.height),
        k.pos(this.params.menuBox.x, this.params.menuBox.y),
        k.color(...this.params.menuBox.backgroundColor),
        k.opacity(this.params.menuBox.backgroundOpacity),
    ]);

    // Loop over all defined graphic objects and add them to the scene
    let itemName;
    for (const [name, params] of Object.entries(this.objects)) {
        // Add button
        itemName = name.slice(0, -4); // remove tag of 'Rect' or 'Text'
        if (name.includes('Rect')) {
            this[`${itemName}Btn`] = k.add([
                k.rect(params.width, params.height ),
                k.pos(params.x, params.y),
                k.color(...this.params.buttons.backgroundColor),
                k.opacity(this.params.buttons.backgroundOpacity),
                k.origin('center'),
                k.area()
            ]);
        } 

        // Add text
        else if (name.includes('Text')) {
            this[`${itemName}`] = k.add([
                k.text(params.text.charAt(0).toUpperCase() + params.text.slice(1), 
                        { size: params.height, width: params.width }),
                k.pos(params.x, params.y),
                k.color(...this.params.buttons.textColor),
                k.opacity(this.params.buttons.textOpacity),
                k.origin('center')
            ]);
        }
    }

    this.playBtn.hovers(() => {this.playBtn.scale = 1.02; }, () => { this.playBtn.scale = 1; });
    this.instructionsBtn.hovers(() => {this.instructionsBtn.scale = 1.02; }, () => { this.instructionsBtn.scale = 1; });
    this.settingsBtn.hovers(() => {this.settingsBtn.scale = 1.02; }, () => { this.settingsBtn.scale = 1; });

    // Connect buttons to control functions
    this.playBtn.clicks(this.levelOneFunc);
    this.instructionsBtn.clicks(SceneControls.goLeaderboard);
    this.settingsBtn.clicks(SceneControls.goSettings);
};


export default Home;
