/*
 * A generic and multi-purpose popup object that is added to the current scene.
 * Provides buttons to continue
 */

import k from '../kaboom/kaboom.js';
import { ScaledIcon } from '../kaboom/graphicUtils.js';

const DFLT_WIDTH = 350;
const DFLT_HEIGHT = 250;

export function Popup(x, y, width, height, mainText, buttons, titleText) {
    this.init(x, y, width, height, mainText, buttons, titleText);
    this.build = () => this.buildObject();
};

export const PopupButtons = {
    OK: { name: 'ok', type: 'option', color: [38, 136, 191], widthRatio: 0.75, heightRatio: 0.25, opacity: 0.8 },
    CONTINUE: { name: 'continue', type: 'option', color: [38, 136, 191], widthRatio: 0.75, heightRatio: 0.25, opacity: 0.8 },
    CANCEL: { name: 'cancel', type: 'option', color: [207, 60, 60], widthRatio: 0.75, heightRatio: 0.25, opacity: 0.8 }
};


Popup.prototype.init = function(x, y, width, height, mainText, buttons, titleText) {
    this.params = {
        width: width || DFLT_WIDTH,
        height: height || DFLT_HEIGHT,

        bodyText: mainText,
        titleText: titleText,

        color: [255, 255, 150], 
        opacity: 0.95,
        outlineWidth: 4,
        outlineColor: [0, 0, 0],

        xInnerOffsetRatio: 0.03, // ratio of distance from left/right-most objects to menu left/right boundary
        yInnerOffsetRatio: 0.04, // ratio of distance from top/bottom of objects to menu top/bottom

        yTitleOffsetRatio: 0.1,

        titleWidthRatio: 0.95,
        titleHeightRatio: 0.15,

        textWidthRatio: 1, // ratio of text width based on button width
        textHeightRatio: 0.1, // ratio of text height based on button height

        xBtnSpacerRatio: 0.1,

        buttons: {
            values: [ 
                { name: 'close', type: 'window', widthRatio: 0.25, heightRatio: 0.25, opacity: 0.8 } // use the `close` icon
            ],
            dfltColor: [78, 160, 207],
            dfltScale: 0.5,
            dfltOpacity: 0.8,
            textColor: [0, 0, 0], // universal color of the button's text
            textOpacity: 0.8, // universal opacity of the button's text
            textWidthRatio: 0.75, // ratio of text width based on button width
            textHeightRatio: 0.5 // ratio of text height based on button height
        },
    };

    const numLines = 3;

    this.params['x'] = x ? x + (width / 2) : k.width() / 2;
    this.params['y'] = y ? y + (height / 2) : k.height() / 2;
    
    this.params['xInnerSpacer'] = this.params.width * this.params.xInnerOffsetRatio;
    this.params['yInnerSpacer'] = this.params.height * this.params.yInnerOffsetRatio;

    this.params['yTitleOffset'] = this.params.height * this.params.yTitleOffsetRatio;
    this.params['titleWidth'] = this.params.width * this.params.titleWidthRatio;
    this.params['titleHeight'] = this.params.height * this.params.titleHeightRatio;

    this.params['bodyWidth'] = (this.params.width - (2 * this.params.xInnerSpacer));
    this.params['bodyHeight'] = (this.params.height - (2 * this.params.yInnerSpacer) - this.params.titleHeight) * this.params.textHeightRatio;

    this.params['xBtnSpacer'] = this.params.width * this.params.xBtnSpacerRatio;


    
    let btnParams = this.params.buttons;
    let windowBtns = btnParams.values.filter(x => x.type === 'window');
    let numWindowBtns = Object.keys(windowBtns).length;
    let numOptionBtns = buttons.length + this.params.buttons.values.length - numWindowBtns;
    
    btnParams['btnWidth'] = (this.params.width - (((2 * this.params.xInnerSpacer) + ((numOptionBtns - 1) * this.params.xBtnSpacer)))) / (numOptionBtns);
    btnParams['btnHeight'] = ((this.params.height - this.params.bodyHeight - this.params.titleHeight - this.params.yTitleOffset) / 2);

    // Adjusted menu button text width/size based on button sizing
    btnParams['textWidth'] = btnParams.btnWidth * btnParams.textWidthRatio;
    btnParams['textHeight'] = btnParams.btnHeight * btnParams.textHeightRatio;

    // Make sure all required values are set for the provided buttons
    let optionBtns = [];
    for (let params of buttons) {
        if (!params.hasOwnProperty('name')) {
            continue;
        }
        if (!params.hasOwnProperty('color')) {
            params['color'] = btnParams.dfltColor;
        }
        if (!params.hasOwnProperty('scale')) {
            params['scale'] = btnParams.dfltScale;
        }
        if (!params.hasOwnProperty('opacity')) {
            params['opacity'] = btnParams.dfltOpacity;
        }
        params['width'] = btnParams.btnWidth * params.widthRatio;
        params['height'] = btnParams.btnHeight * params.heightRatio;
        params['textWidth'] = btnParams.btnWidth * btnParams.textWidthRatio;
        params['textHeight'] = btnParams.btnHeight * btnParams.textHeightRatio;

        optionBtns.push(params);
    }

    // Apply icon ratios to all objects
    for (let item of windowBtns) {
        let size = ScaledIcon(item.widthRatio * btnParams.btnWidth, item.heightRatio * btnParams.btnHeight);
        item['width'] = size.width;
        item['height'] = size.height;
    }

    // Function to calculate the width of a group of items
    const findWidth = (() => {
        return (acc, x) => {
            acc += x.width;
            if (acc !== 0) {
                acc += this.params.xBtnSpacer;
            }
            return acc;
        };
    })();

    let optionsWidth = optionBtns.reduce(findWidth, 0);
    let windowWidth = windowBtns.reduce(findWidth, 0);

    // Function to assign positions and predefined params to graphic object 
    const buildItem = (() => {
        return (item, prevX, prevY) => {
            let iconName = `${item.name}Icon`;
            let rectName = `${item.name}Rect`;
            let textName = `${item.name}Text`;

            if (item.type === 'window') {
                prevX -= (item.width / 2);
                this.objects[iconName] = {
                    x: prevX,
                    y: prevY
                };
                Object.assign(this.objects[iconName], item);
                return prevX + item.width + this.params.xBtnSpacer;
            } else if (item.type === 'option') {
                prevY -= (item.height / 2);
                this.objects[rectName] = {
                    x: prevX,
                    y: prevY
                };
                this.objects[textName] = {
                    x: prevX,
                    y: prevY
                }
                Object.assign(this.objects[rectName], item);
                Object.assign(this.objects[textName], item);
                return (prevX + item.width + this.params.xBtnSpacer);
            }
        };
    })();

    this.objects = {};
    // The title to show on the popup
    this.objects['titleText'] = {
        text: this.params.titleText,
        width: this.params.titleWidth,
        height: this.params.titleHeight,
        x: this.params.x,
        y: this.params.y - (this.params.height / 2) + this.params.yInnerSpacer + this.params.yTitleOffset
    }

    // The text to display in the popup
    this.objects['mainText'] = {
        text: this.params.bodyText,
        width: this.params.bodyWidth,
        height: this.params.bodyHeight,
        x: this.objects.titleText.x,
        y: this.params.y - ((this.params.height - this.params.bodyHeight - 125) / 4) + (this.params.yInnerSpacer + this.params.yTitleOffset)
    }

    let prevOptionX = this.params.x;// - (optionsWidth / 2);
    let currOptionY = this.params.y + (this.params.height / 2) - this.params.yInnerSpacer;
    for (let item of optionBtns) {
        prevOptionX = buildItem(item, prevOptionX, currOptionY);
    }

    let prevWindowX = this.params.x + (this.params.width / 2);// - (windowWidth / 2);
    let currWindowY = this.params.y - (this.params.height / 2) + this.params.yInnerSpacer + this.params.outlineWidth;
    for (let item of windowBtns) {
        prevWindowX = buildItem(item, prevWindowX, currWindowY);
    }

    // Function to share dimensions of this status bar
    this.dimensions = (() => {
        const dim = {
            x: this.params.x,
            y: this.params.y,
            width: this.params.width,
            height: this.params.height
        };
        return dim;
    })();
};


/**
 * Adds all of the objects to the screen using the initialized parameters
 */
 Popup.prototype.buildObject = function() {
     
    // Background color
    k.add([
        k.rect(this.params.width, this.params.height),
        k.pos(this.params.x, this.params.y),
        k.color(...this.params.color),
        k.opacity(this.params.opacity),
        k.outline(this.params.outlineWidth, this.params.outlineColor),
        k.origin('center'),
        '_popup'
    ]);
    

    // Loop over all defined graphic objects and add them to the scene
    let itemName, text, spriteParams;
    for (const [name, params] of Object.entries(this.objects)) {
        // Add icon
        itemName = name.slice(0, -4); // remove tag of 'Rect' or 'Text'
        if (name.includes('Rect')) {
            this[`${itemName}Btn`] = k.add([
                k.rect(params.width, params.height),
                k.pos(params.x, params.y),
                k.color(...params.color),
                k.opacity(params.opacity),
                k.origin('center'),
                k.area(),
                '_popup'
            ]);
        } 

        else if (name.includes('Icon')) {
            spriteParams = [
                k.sprite(itemName, { width: params.width, 
                                    height: params.height }),
                k.pos(params.x, params.y),
                k.origin('center'),
                '_popup'];

            if (params.type === 'window') {
                spriteParams.push(k.area()); // necessary for clicks
                this[`${itemName}Btn`] = k.add(spriteParams);
            } else {
                k.add(spriteParams);
            }
        }

        // Add text
        else if (name.includes('Text')) {
            if (params.type === 'option') {
                text = params.name;
            } else {
                text = params.text;
            }
            k.add([
                k.text(text.charAt(0).toUpperCase() + text.slice(1), 
                        { size: params.height, width: params.width }),
                k.pos(params.x, params.y),
                k.color(...this.params.buttons.textColor),
                k.opacity(this.params.buttons.textOpacity),
                k.origin('center'),
                '_popup'
            ]);
        }
    }
    this.okBtn.clicks(() => k.destroyAll('_popup'));
    this.closeBtn.clicks(() => k.destroyAll('_popup'));
};
