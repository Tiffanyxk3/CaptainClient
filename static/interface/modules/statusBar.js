/*
 * Graphic "bar" similar to the 'banner' object which is displayed over
 * the game field during play. This displays game state information such
 * as current score, # of coins, time remaining, etc. It also holds the time
 * control buttons. Again, due to different screen sizing and the way Kaboom
 * implements object placement, the code gets a bit complicated. Totally okay
 * to wipe this out and restart with the intent of simplifying. 
 */


import k from "../kaboom/kaboom.js";

import TimerControls from '../../utilities/timer.js';
import State from '../../shared/state.js';
import { ScaledIcon } from '../kaboom/graphicUtils.js';

/*
* ------------------------------------------------------ BANNER -----------------------------------------------------
* USFLogo USFCSLogo                                                 TITLE CapLogo           HOME VOLUME/MUTE SETTINGS
* --------------------------------------------------- STATUS BAR ----------------------------------------------------
* LEVEL X SCORE X COINS X EXPENSES X THROUGHPUT X LATENCY X         COMPLETE/GOAL             TIME PLAY|PAUSE|RESTART
*/



export function StatusBar(screenX, screenY, screenWidth, screenHeight) {

    this.init(screenX, screenY, screenWidth, screenHeight);

    // Expose function anonymously to ensure correct context
    this.build = () => { this.buildObject(); };
};


/**
 * Initialize all parameters (sizing, position, spacing...) for the status bar
 * 
 * Status Bar --> displayed under banner and updates with game play
 */
StatusBar.prototype.init = function(screenX, screenY, screenWidth, screenHeight) {

    this.params = { 
        x: screenX, // starting x-pos for the status bar
        y: screenY, // starting y-pos for the status bar
        width: screenWidth, // width of the status bar (expand to fill screen width)
        height: screenHeight, // height of the status bar (expand to fill screen)

        backgroundColor: [135, 145, 160], // solid color to fill status bar
        backgroundOpacity: 1, // opacity of the background color

        xInnerOffsetRatio: 0.005, // distance from left/right-most objects to status bar left/right boundary
        yInnerOffsetRatio: 0.2, // distance from top/bottom of objects to status bar top/bottom        

        iconXSpacerRatio: 0.25, // spacing ratio based on scaled icon width
        iconYSpacerRatio: 0.0, // spacing ratio based on scaled icon height

        btnXSpacerRatio: 0.4, // spacing ratio based on scaled icon width

        // Details about status bar items. They will be displayed from left 
        // to right in the top-to-bottom order defined here. 
        // All text ratios are relative to iconWidth and iconHeight
        leftItems: [
            { name: 'level', type: 'text', widthRatio: 2.5, heightRatio: 0.95 }, 
            { name: 'score', type: 'text', widthRatio: 3, heightRatio: 0.95}, 
            { name: 'coins', type: 'text', widthRatio: 3, heightRatio: 0.95 }, 
            { name: 'expenses', type: 'text', widthRatio: 2, heightRatio: 0.95 },
            { name: 'throughput', type: 'text', widthRatio: 2, heightRatio: 0.95 }, 
            { name: 'latency', type: 'text', widthRatio: 2, heightRatio: 0.95 },
            { name: 'rating', type: 'text', widthRatio: 2, heightRatio: 0.95 }
        ],
        
        middleItems: [
            { name: 'requests', type: 'text', widthRatio: 4, heightRatio: 0.95 }
        ],
        
        rightItems: [
            { name: 'timer', type: 'text', widthRatio: 3, heightRatio: 0.95 }, 
            { name: 'play', type: 'btn' }, 
            { name: 'pause', type: 'btn' }, 
            { name: 'fastForward', type: 'btn' },
            { name: 'restart', type: 'btn' } 
        ]
    };
    
    // Calculated spacing for the status bar's inner boundaries
    this.params['xInnerSpacer'] = this.params.xInnerOffsetRatio * this.params.width;
    this.params['yInnerSpacer'] = this.params.yInnerOffsetRatio * this.params.height;

    // Universal sizing of the status bar's icons
    let iconSize = ScaledIcon(this.params.width - (2 * this.params.xInnerSpacer), (this.params.height - (2 * this.params.yInnerSpacer)));
    this.params['iconWidth'] = iconSize.width;
    this.params['iconHeight'] = iconSize.height;

    // Spacers between objects in the status bar
    this.params['xObjSpacer'] = this.params.iconWidth * this.params.iconXSpacerRatio;
    this.params['yObjSpacer'] = this.params.iconHeight * this.params.iconYSpacerRatio;

    this.params['btnXSpacer'] = this.params.iconWidth * this.params.btnXSpacerRatio;
    this.params['btnYSpacer'] = ((this.params.height- (2 * this.params.yInnerSpacer)) / 2) - (this.params.iconHeight / 2);

    // Apply icon ratios to all objects
    for (let item of this.params.leftItems.concat(this.params.middleItems, this.params.rightItems)) {
        item['width'] = item.widthRatio * this.params.iconWidth;
        item['height'] = item.heightRatio * this.params.iconHeight;
    }
    
    /* 
     * Objects inside the status bar (aka buttons and icons)
     */
    this.objects = {};

    // Function to calculate the width of a group of items
    const findWidth = (() => {
        return (acc, x) => {
            acc += this.params.iconWidth;
            if (x.type === 'text') {
                acc += (this.params.xObjSpacer) + x.width;
            } 
            if (acc !== 0) {
                if (x.type === 'text') {
                    acc += (this.params.xObjSpacer);
                } else if (x.type === 'btn') {
                    acc += this.params.btnXSpacer;
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
                prevX += this.params.btnXSpacer;
                this.objects[iconName] = {
                    x: prevX,
                    y: prevY
                };
                Object.assign(this.objects[iconName], item);
                return prevX + this.params.iconWidth;
            } else if (item.type === 'text') {
                prevX += this.params.xObjSpacer;
                let textX = (prevX + this.params.iconWidth + this.params.xObjSpacer);
                this.objects[iconName] = {
                    x: prevX,
                    y: prevY
                };
                this.objects[textName] = {
                    x: textX,
                    y: (prevY
                        + ((this.params.iconHeight / 2)
                        - (item.height / 2)))
                }
                Object.assign(this.objects[iconName], item);
                Object.assign(this.objects[textName], item);
                return (textX + item.width);
            }
        };
    })();

    // Loop over leftItems
    let prevY = this.params.y + this.params.btnYSpacer + this.params.yInnerSpacer;
    let prevX = this.params.x + this.params.xInnerSpacer;
    for (let item of this.params.leftItems) {
        prevX = buildItem(item, prevX, prevY);
    }

    // Loop over middleItems
    prevX = ((this.params.x + (this.params.width / 2)) // mid point of bar
            - (middleWidth / 4)); // half of group width & another half for centering
    for (let item of this.params.middleItems) {
        prevX = buildItem(item, prevX, prevY);
    }

    // Loop over rightItems
    prevX = (this.params.x + this.params.width) - // far right edge
        (this.params.xInnerSpacer + this.params.xObjSpacer + rightWidth); // left-most point of group
    for (let item of this.params.rightItems) {
        prevX = buildItem(item, prevX, prevY);
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
 * Adds all of the graphic objects to the screen using the initialized parameters
 */
StatusBar.prototype.buildObject = function() {

    // Status bar container
    k.add([
        k.rect(this.params.width, this.params.height),
        k.pos(this.params.x, this.params.y),
        k.color(...this.params.backgroundColor),
        k.opacity(this.params.backgroundOpacity)
    ]);

    // Loop over all defined graphic objects and add them to the scene
    let itemName, spriteParams, recParams, commentParams, text;
    k.layers([
        "rec",
        "comment",
    ], "game")

    for (const [name, params] of Object.entries(this.objects)) {
        // Add icon
        itemName = name.slice(0, -4); // remove tag of 'Icon' or 'Text'
        if (name.includes('Icon')) {
            spriteParams = [
                k.sprite(itemName, { width: this.params.iconWidth,
                                    height: this.params.iconHeight }),
                k.pos(params.x, params.y),
                k.area(),
            ];

            let unit = this.params.iconWidth * 0.5;

            recParams = [
                k.rect(unit * itemName.length, this.params.iconHeight),
                k.layer("rec"),
                k.pos(params.x + 10, params.y + 10),
                k.color(206, 212, 223),
                k.scale(0),
                k.outline(this.params.iconWidth * 0.07),
            ];
            commentParams = [
                k.text("", { size: this.params.iconWidth * 0.74 }),
                k.layer("comment"),
                k.pos(params.x + 12.5, params.y + 12.5),
            ];

            if (params.type == 'btn') {
                spriteParams.push(k.area()); // necessary for clicks
                this[`${itemName}Btn`] = k.add(spriteParams);
            } else {
                let spr = k.add(spriteParams);
                let rec = k.add(recParams);
                let comment = k.add(commentParams);
                spr.hovers(() => {
                    rec.scale = 1
                    comment.text = name.slice(0, -4)
                }, () => {
                    rec.scale = 0
                    comment.text = ""
                })
            }
        }

        // Add text
        else if (name.includes('Text')) {
            // Special cases
            if (itemName == 'timer') {
                text = prettifyTime(TimerControls.remaining());
            } else if (itemName == 'level') {
                text = State.levelNumber + '.' + State.stageNumber;
            } else {
                text = State[itemName]
            }
            this[name] = k.add([
                k.text(text, { size: params.height, width: params.width }),
                k.pos(params.x, params.y)
            ]);
        }
    }

    this.playBtn.hovers(() => { this.playBtn.scale = 1.1; }, () => { this.playBtn.scale = 1; });
    this.pauseBtn.hovers(() => { this.pauseBtn.scale = 1.1; }, () => { this.pauseBtn.scale = 1; });
    this.restartBtn.hovers(() => { this.restartBtn.scale = 1.1; }, () => { this.restartBtn.scale = 1; });
    this.fastForwardBtn.hovers(() => { this.fastForwardBtn.scale = 1.1; }, () => { this.fastForwardBtn.scale = 1; });

    // Connect buttons to control functions
    this.playBtn.clicks(TimerControls.play);
    this.pauseBtn.clicks(TimerControls.pause);
    this.restartBtn.clicks(TimerControls.restart);
    this.fastForwardBtn.clicks(TimerControls.fastforward);
};

// Updates status bar text. Called on when State is changed
StatusBar.prototype.updateState = function() {
    this.levelText.text = State.levelNumber + '.' + State.stageNumber;
    this.coinsText.text = State.coins;
    this.scoreText.text = State.score;
    this.expensesText.text = State.expenses;
    this.throughputText.text = State.throughput;
    this.latencyText.text = State.latency;
    this.requestsText.text = State.numCompletedReqs + '/' + State.goalCount;
    this.ratingText.text = Number((State.throughput / State.latency).toFixed(1));
};

// Updates time text. Called on every timestep from Timer
StatusBar.prototype.updateTime = function(timestamp, speedup) {
    this.timerText.text = prettifyTime(timestamp);
};


// Helper function for displaying remaining time
const prettifyTime = (secs) => {
    let remainingSecs = secs % 60;
    return Math.floor(secs / 60) 
        + ":" + (remainingSecs < 10 ? ('0' + remainingSecs) : remainingSecs);
};


export default StatusBar;