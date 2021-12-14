

import k from '../kaboom/kaboom.js';
import { SceneControls } from '../interface.js';
import { getColor } from '../../config/settings.js';
import assetDirectory from '../../assets/assetDirectory.js';

// ALL ICONS HAVE SAME SIZE (512p x 512p)
const iconWidth = 512;
const iconHeight = 512;

export function Leaderboard() {
    this.rankings = new RankingsList(); // unsure if this is correct

    this.init();

    // necessary to preserve `this` reference (check out arrow functions if unfamiliar)
    this.scene = (color) => { this.buildScene(color); };

};

Leaderboard.prototype.init = function() {

    this.components = {
      'Client': {
        'IPHONE': 'I\'m an Iphone   Cost: (L1)$0 (L2)$50\n\Tips: The starting point of the customers\' request.',
        'LAPTOP': 'I\m a laptop     Cost: (L1)$0 (L2)$70\n\Tips: The starting point of the customer\' request.',
        'ALEXA': 'I\'m Alexa        Cost: (L1)$0 (L2)$30\n\Tips: The starting point of the customers\' request.',
        'DESKTOP': 'I\'m a desktop  Cost: (L1)$0 (L2)$100\n\Tips: The starting point of the customer\'s request.',
        'CLOUD_COMPUTE': 'I\'m a cloud-computing software  Cost: (L1)$0 (L2)$120\n\Tips: The starting point of the customer\'s request.',
      },
      'Processors': {
        'GATEWAY': 'A Gateway is a hardware device that acts as a \'gate\' \n\ between two networks.',
        'HUB': 'A hub is a device that allows multiple computers to communicate\n\ with each other over a network.',
        'SWITCH': 'A switch is used to network multiple computers together. \n\ Unlike hubs, switches can limit the traffic to and from each port.',
        'MODEM': 'Modem is a hardware component that allows a computer or another device, \n\ such as a router or switch, to connect to the Internet.',
        'ROUTER': 'Router is a hardware device that routes data from a local \n\ area network (LAN) to another network connection.',
        'LOAD_BALANCER': 'A load balancer is a piece of hardware that acts\n\ like a reverse proxy to distribute network.',
        'CACHE': 'A cache is a hardware or software component that stores data\n\ so that future requests for that data can be served faster.',
        'SERVER': 'This device may connect over a network to a server on a different device.\n\ A server is a piece of computer hardware or software.',
        'DATABASE': 'Organized collection of structured data. \n\ Online databases are hosted on websites. '
      }
    }

    this.componentsImg = {
      'IPHONE': assetDirectory["iphone"],
      'LAPTOP': assetDirectory["laptop"],
      'ALEXA':assetDirectory["alexa"],
      'GATEWAY': assetDirectory["gateway"],
      'DESKTOP': assetDirectory["desktop"],
      'CLOUD_COMPUTE': assetDirectory["cloud_compute"],
      'HUB': assetDirectory['hub'],
      'SWITCH': assetDirectory['switch'],
      'MODEM': assetDirectory['modem'],
      'ROUTER': assetDirectory['router'],
      'LOAD_BALANCER': assetDirectory['load_balancer'],
      'CACHE': assetDirectory['cache'],
      'SERVER': assetDirectory['server'],
      'DATABASE': assetDirectory['database']

    }

    this.gapHeight = 100 // the distance from title to the 1st subtitle 
    this.subTitleCount = 0 
    this.subTitleBottomMargin = 40

    this.componentCount = 0
    this.componentBottomMargin = 60

    // TEST TEST TEST --> Meant as a template, not actual values

    this.params = {
        screenX: 0, // minimum x value relative to screenWidth
        screenY: 0, // minimum y value relative to screenHeight
        width: k.width(), // total screen width
        height: k.height(), // total screen height

        backdropColor: getColor(), // backdrop color (same as home scene)
        backdropOpacity: k.opacity(1), // opacity of backdrop

        xInnerOffsetRatio: 0.01, // distance from left/right-most objects to banner left/right boundary
        yInnerOffsetRatio: 0.02, // distance from top/bottom of objects to banner top/bottom

        // Based on Home Scene dimensions
        titleWidthRatio: 0.35, // ratio compared to the screen width
        titleHeightRatio: 0.05, // ratio compared to the screen height
        yTitleOffsetRatio: 0.5, // ratio of x-spacing from screen top based on title height
        yTitleOffsetRatio: 0.5, // ratio of y-spacing from screen top based on title height

        subTitleWidthRatio: 0.25, // ratio compared to the screen width
        subTitleHeightRatio: 0.035, // ratio compared to the screen height

        instrWidthRatio: 0.3, // ratio compared to the screen width
        instrHeightRatio: 0.025, // ratio compared to the screen height
        
        controlIconScale: 0.45, // used to resize the control icons (home, volume, settings...)
        constrolIconXSpacerRatio: 0.35, // spacing ratio based on scaled icon height
        controlIconOpacity: k.opacity(0.9), // opacity of control-enabled icons

        spriteIconScale: 0.1,
        spriteIconMarginScale: 0.15,

        board: {
            // (Same as Home Scene Menu Box)
            backgroundColor: k.color(52, 149, 235), // background color of the menu box
            backgroundOpacity: k.opacity(0.5), // opacity of the menu box
        }
    };

    // Scaling factor for each icon (except the usfCSIcon)
    this.params['iconRatio'] = Math.min((this.params.width / iconWidth), 
                                        (this.params.height / iconHeight));
                
    // Calculated spacing for the banner's inner boundaries
    this.params['xInnerSpacer'] = this.params.xInnerOffsetRatio * this.params.width;
    this.params['yInnerSpacer'] = this.params.yInnerOffsetRatio * this.params.height;
    
    // Scaled icon sizes and spacing for the control-enabled icons
    this.params['controlIcons'] = { // icons with actions (home, volume, settings)
        width: iconWidth * this.params.iconRatio * this.params.controlIconScale, // scaled width based on above ratio
        height: iconHeight * this.params.iconRatio * this.params.controlIconScale // scaled height based on above ratio
    };

    this.params['controlIcons'].xSpacer = this.params.controlIcons.width * this.params.constrolIconXSpacerRatio;
    this.params['controlIcons'].ySpacer = (this.params.height / 2) - (this.params.controlIcons.height / 2);

    // Adjusted width/height for the title text
    this.params['titleWidth'] = this.params.width * this.params.titleWidthRatio;
    this.params['titleHeight'] = this.params.height * this.params.titleHeightRatio;

    // Calculated distance between top of title and top of screen
    this.params['xSpacer'] = this.params.titleHeight * this.params.yTitleOffsetRatio;
    this.params['yTitleSpacer'] = this.params.titleHeight * this.params.yTitleOffsetRatio;

    this.objects = {};
    this.objects['title'] = {
        width: this.params.width * this.params.titleWidthRatio,
        height: this.params.height * this.params.titleHeightRatio,
        x: this.params.screenX + this.params.xSpacer,
        y: this.params.screenY + this.params.yTitleSpacer
    }

    this.objects['subtitle'] = {
        width: this.params.width * this.params.titleWidthRatio,
        height: this.params.height * this.params.subTitleHeightRatio,
        x: this.params.screenX + this.params.xSpacer,
        y: this.params.screenY + this.params.yTitleSpacer
    }

    this.objects['instruction'] = {
        width: this.params.width * this.params.instrWidthRatio,
        height: this.params.height * this.params.instrHeightRatio,
        x: this.params.screenX + this.params.xSpacer,
        y: this.params.screenY + this.params.yTitleSpacer
    }

    this.objects['back'] = { 
        x: ((this.params.width + this.params.screenX) // right-most edge
                    - this.params.xInnerSpacer // offset
                    - (this.params.controlIcons.width + this.params.controlIcons.xSpacer)), // this icon + spacer
        y: (this.params.screenY + this.params.controlIcons.ySpacer + this.params.yInnerSpacer)
    }
};


Leaderboard.prototype.buildScene = function(color) {
    // TODO: fix this image imports
    // load sprites
    // for (let name in this.componentsImg){
    //   k.loadSprite(name, this.componentsImg[name])
    // }

    // Backdrop color
    k.add([
        k.rect(this.params.width, this.params.height),
        k.pos(this.params.screenX, this.params.screenY),
        k.color(color),
        this.params.backdropOpacity,
    ]);

    // Title
    // k.add([
    //     k.text('Instructions', { size: this.objects.title.height, width: this.objects.title.width }),
    //     k.pos(this.objects.title.x, this.objects.title.y),
    // ]);

    for (let type in this.components){
      // add subtitle(type)
      k.add([
        k.text(type, { size: this.objects.subtitle.height}),
        // k.pos(this.objects.subtitle.x, this.objects.subtitle.y + this.gapHeight + this.subTitleBottomMargin * this.subTitleCount + this.componentCount * this.componentBottomMargin),
        k.pos(this.objects.subtitle.x, 
          this.objects.subtitle.y + this.subTitleBottomMargin * this.subTitleCount + this.componentCount * this.componentBottomMargin),
      ])
      // addsubTitleCount
      this.subTitleCount++
      for (let componentName in this.components[type]){
        // add componentImg
        const spr = k.add([
          k.scale(this.params.spriteIconScale),
          k.sprite(componentName),
          // k.pos(this.objects.title.x, this.objects.title.y  + this.gapHeight + this.subTitleBottomMargin*this.subTitleCount + this.componentCount*this.componentBottomMargin),
          k.pos(this.objects.title.x, 
            this.objects.title.y + this.subTitleBottomMargin * this.subTitleCount + this.componentCount * this.componentBottomMargin),
        ])
        // add componentName and info 
        k.add([
          k.color(0,0,100),
          k.text(`${componentName}:${this.components[type][componentName]}`, { size: this.objects.instruction.height, width: this.params.width }),
          // k.pos(this.objects.title.x + 100, this.objects.title.y + this.gapHeight + this.subTitleBottomMargin*this.subTitleCount + this.componentCount*this.componentBottomMargin),
          k.pos(this.objects.title.x + spr.width * this.params.spriteIconMarginScale, 
            this.objects.title.y + this.subTitleBottomMargin * this.subTitleCount + this.componentCount * this.componentBottomMargin),
        ])
        this.componentCount++
      }

    }

    // Back button
    const backBtn = k.add([
      k.text('Back', { size: this.objects.title.height}),
      k.pos(this.params.width * 0.98, this.objects.title.y),
        // this.objects.title.y + this.gapHeight + this.subTitleBottomMargin * this.subTitleCount + this.componentCount * this.componentBottomMargin),
      k.color(0,0,100),
      k.area(),
      k.origin("right"),
    ]);

    backBtn.hovers(() => { backBtn.scale = 1.1; }, () => { backBtn.scale = 1; });
    backBtn.clicks(SceneControls.goHome);
    this.init();
};


function RankingsList(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
};

/*
 * Unsure what the loaded format will be. Either way, an object that can be transformed 
 * into the the currently anticipated format will work
 */
RankingsList.prototype.load = function(rankings) {
    /* Expecting `rankings` as object of form:
     * { 
     *      rank: X,
     *      name: ...,
     *      score: ...,
     *      time: ...   
     * }
     */
}

export default Leaderboard;