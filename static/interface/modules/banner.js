/*
 * The banner displayed over the play field during game play. Currently being
 * composed using Kaboom which becomes complicated for positioning and sizing
 * multiple images. However, it does grant the most freedom for manipulation 
 * which could be helpful on different screen sizes. With a single image, the
 * aspect ratio can not be changed easily (if at all)
 */

import k from "../kaboom/kaboom.js";
import { SceneControls } from '../interface.js';
import { ScaledIcon } from '../kaboom/graphicUtils.js';

/*
    * ------------------------------ BANNER -----------------------------------
    * USFLogo USFCSLogo               TITLE  CapLogo  HOME VOLUME/MUTE SETTINGS
    * ---------------------------- STATUS BAR ---------------------------------
    * LEVEL X SCORE X COINS X              COMPLETE/GOAL TIME PLAY|PAUSE|RESTART
*/

export function Banner(screenX, screenY, screenWidth, screenHeight) {
    this.init(screenX, screenY, screenWidth, screenHeight);

    // Expose function anonymously to ensure correct context
    this.build = (color) => {
      this.buildObject(color) 
    };


}

/**
 * Initialize all parameters (sizing, position, spacing...) for the banner
 * 
 * BANNER --> displayed as top horizontal bar throughout game
 */
Banner.prototype.init = function(screenX, screenY, screenWidth, screenHeight) {

    this.params = { 
        x: screenX, // starting x-pos for the banner
        y: screenY, // starting y-pos for the banner
        width: screenWidth, // width of the banner (expand to fill screen width)
        height: screenHeight, // height of the banner (expand to fill screen height)

        backgroundColor: [255,255,255], // solid color to fill banner
        backgroundOpacity: 1, // opacity of the background color

        xInnerOffsetRatio: 0.02, // distance from left/right-most objects to banner left/right boundary
        yInnerOffsetRatio: 0, // distance from top/bottom of objects to banner top/bottom

        iconXSpacerRatio: 0.25, // spacing ratio based on scaled icon width
        btnXSpacerRatio: 0.25, // spacing ratio based on scaled icon height

        titleWidthRatio: 5, // ratio of the title's width to screen width
        titleHeightRatio: 1.5, // ratio of the title's height to screen height
        titleOpacity: 0.6, // universal opacity of text

        iconOpacity: 0.7, // opacity of display-only icons
        btnOpacity: 0.9, // opacity of control-enabled icons


        leftItems: [
            { name: 'usf', type: 'icon', widthRatio: 1.8, heightRatio: 1.8 }, 
            { name: 'usfCS', type: 'icon', widthRatio: 1.8, heightRatio: 1.8 }
        ], 
        middleItems: [
            { name: 'title', type: 'text', widthRatio: 7, heightRatio: 0.75 }, 
            { name: 'transparent_captain', type: 'icon', widthRatio: 1, heightRatio: 1 }
        ],
        rightItems: [
            { name: 'home', type: 'btn', widthRatio: 0.65, heightRatio: 0.65 }, 
            // { name: 'mute', type: 'btn', widthRatio: 0.65, heightRatio: 0.65 }, 
            { name: 'settings', type: 'btn', widthRatio: 0.65, heightRatio: 0.65 }]
    };

    // Calculated spacing for the banner's inner boundaries
    this.params['xInnerSpacer'] = this.params.xInnerOffsetRatio * this.params.width;
    this.params['yInnerSpacer'] = this.params.yInnerOffsetRatio * this.params.height;

    let iconSize = ScaledIcon(this.params.width - (2 * this.params.xInnerSpacer), (this.params.height - (2 * this.params.yInnerSpacer)));
    this.params['baseItemWidth'] = iconSize.width;
    this.params['baseItemHeight'] = iconSize.height;

    this.params['xIconSpacer'] = this.params.baseItemWidth * this.params.iconXSpacerRatio;
    this.params['yIconSpacer'] = (this.params.height / 2) - (this.params.baseItemHeight / 2);

    this.params['xBtnSpacer'] = this.params.baseItemWidth * this.params.btnXSpacerRatio;
    this.params['yBtnSpacer'] = (this.params.height / 2) - (this.params.baseItemHeight / 2);

    // Sets the size of the title text box
    this.params['titleWidth'] = this.params.width * this.params.titleWidthRatio;
    this.params['titleHeight'] = this.params.height * this.params.titleHeightRatio;

    // Apply text ratios to all items
    for (let item of this.params.leftItems.concat(this.params.middleItems, this.params.rightItems)) {
        item['width'] = item.widthRatio * this.params.baseItemWidth;
        item['height'] = item.heightRatio * this.params.baseItemHeight;
    }

    /* 
     * Objects inside the banner (aka icons)
     */
    this.objects = {};

    // Function to calculate the width of a group of items
    const findWidth = (() => {
        return (acc, x) => {
            acc += x.width;
            if (acc !== 0) {
                if (x.type === 'text' || x.type === 'icon') {
                    acc += this.params.xIconSpacer;
                }
            }
            return acc;
        };
    })();

    // Find the total width occupied by the middle and right items
    let middleWidth = this.params.middleItems.reduce(findWidth, 0);
    let rightWidth = this.params.rightItems.reduce(findWidth, 0);
    
    // Function to assign positions and predefined params to graphic object 
    const buildItem = (() => {
        return (item, prevX, prevY) => {
            let iconName = `${item.name}Icon`;
            let textName = `${item.name}Text`;
            if (item.type === 'btn') {
                prevX += this.params.xBtnSpacer;
                this.objects[iconName] = {
                    x: prevX,
                    y: prevY
                };
                Object.assign(this.objects[iconName], item);
                return prevX + item.width;
            } else if (item.type === 'text') {
                prevX += this.params.xIconSpacer;
                this.objects[textName] = {
                    x: prevX,
                    y: (prevY
                        + ((this.params.baseItemHeight / 2)
                        - (item.height / 2)))
                }
                Object.assign(this.objects[textName], item);
                return (prevX + item.width);
            } else if (item.type === 'icon') {
                prevX += this.params.xIconSpacer;
                this.objects[iconName] = {
                    x: prevX,
                    y: prevY
                }
                Object.assign(this.objects[iconName], item);
                return (prevX + item.width);
            }
        };
    })();

    // Loop over leftItems
    let prevY = this.params.y + this.params.yInnerSpacer + (this.params.baseItemHeight / 2);
    let prevX = this.params.x + this.params.xInnerSpacer;
    for (let item of this.params.leftItems) {
        prevX = buildItem(item, prevX, prevY);
    }
    
    // Loop over middleItems
    prevX = (this.params.x + (this.params.width / 2)); // mid point of bar
    let titleItem = this.params.middleItems.find(x => x.name === 'title');
    if (titleItem) {
        // prevX -= (titleItem.width / 2); // half of title width
        prevX = buildItem(titleItem, prevX, prevY) - (titleItem.width / 2) + (2 * this.params.xIconSpacer);
    } else {
        prevX -= (middleWidth / 2);
    }
    for (let item of this.params.middleItems) {
        if (item.name !== 'title') {
            prevX = buildItem(item, prevX, prevY);
        }
    }

    // Loop over rightItems
    prevX = (this.params.x + this.params.width) // far right edge
        - (this.params.xInnerSpacer + rightWidth); // left-most point of group
    for (let item of this.params.rightItems) {
        prevX = buildItem(item, prevX, prevY);
    }

    // Function to share dimensions of this banner
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
 * Adds all of the graphic objects to the screen using the initialized parameters
 */
Banner.prototype.buildObject = function(color) {
    // Banner bar
    k.add([
        k.rect(this.params.width, this.params.height),
        k.pos(this.params.x, this.params.y),
        k.color(color),
        this.params.opacity,
    ]);

    // Loop over all defined graphic objects and add them to the scene
    let itemName, spriteParams, text;
    for (const [name, params] of Object.entries(this.objects)) {
        // Add icon
        itemName = name.slice(0, -4); // remove tag of 'Icon' or 'Text'
        if (name.includes('Icon')) {
            spriteParams = [
                k.sprite(itemName, { width: params.width, 
                                    height: params.height }),
                k.pos(params.x, params.y),
                k.origin('center')];

            if (params.type == 'btn') {
                spriteParams.push(k.area()); // necessary for clicks
                this[`${itemName}Btn`] = k.add(spriteParams);
            } else {
                k.add(spriteParams);
            }
        } 

        // Add text
        else if (name.includes('Text')) {
            // Special cases
            if (itemName == 'title') {
                text = 'Captain Client';
            } else {
                text = name;
            }
            this[name] = k.add([
                k.text(text, { size: params.height, width: params.width }),
                k.pos(params.x, params.y),
                k.origin('center')
            ]);
        }
    }

    this.homeBtn.hovers(() => { this.homeBtn.scale = 1.1; }, () => { this.homeBtn.scale = 1; });
    this.settingsBtn.hovers(() => { this.settingsBtn.scale = 1.1; }, () => { this.settingsBtn.scale = 1; });

    // Connect buttons to control functions
    this.homeBtn.clicks(SceneControls.goHome);
    // this.muteBtn.clicks(() => console.log("MUTE CLICKED"));
    this.settingsBtn.clicks(SceneControls.goSettings);
};

export default Banner;