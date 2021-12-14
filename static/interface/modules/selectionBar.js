/*
 * Selection "bar" similar to the 'statusBar' object which is displayed at 
 * bottom of the screen. It displays the components available to the user for
 * a specific level. It is responsible for displaying the components and updating
 * their availability as the user drags them onto the screen (currently can't 
 * drag off of the bar. Have to click to add to screen)
 */

import k from '../kaboom/kaboom.js';

import { ScaledComponentImage } from '../kaboom/graphicUtils.js';
import FieldController from './fieldControls.js';
import { ComponentConfig } from '../../shared/lookup.js'

const UNAVAILABLE_OPACITY = 0.5;
const COMPONENT_SPAWN_POS = [k.width() / 2, k.height() / 2];


export default function SelectionBar(screenX, screenY, screenWidth, screenHeight) {
    this.init(screenX, screenY, screenWidth, screenHeight);

    // Expose function anonymously to ensure correct context
    this.build = () => { this.buildObject(); };
};


/**
 * Initialize all parameters (sizing, position, spacing...) for the selection bar
 * 
 * Selection Bar --> displayed under play field and updates with each level
 */
SelectionBar.prototype.init = function(screenX, screenY, screenWidth, screenHeight) {

    this.params = {
        x: screenX, // starting x-pos for the selection bar
        y: screenY, // starting y-pos for the selection bar
        width: screenWidth, // width of the selection bar (expand to fill screen width)
        height: screenHeight, // height of the selection bar (expand to fill screen height)
        
        backgroundColor: [135, 145, 160], // solid color to fill selection bar
        backgroundOpacity: 1, // opacity of the background color

        // ratio of spacing from the left-most boundary of the componentIconBox to the left-most edge 
        // of the SelectionBar relative to SelectionBar's width
        xOffsetRatio: 0.03, 
        // ratio of spacing from the top of the componentIconBox to the top of the SelectionBar 
        // relative to SelectionBar's height
        yOffsetRatio: 0.1, 
        
        // ratio of spacing from the left/right-most boundary of the componentIconBox to the 
        // left/right-most edge of the SelectionBar relative to SelectionBar's width
        xInnerOffsetRatio: 0.05,
        // ratio of spacing from the top/bottom of the componentIconBox to the top/bottom 
        // of the SelectionBar relative to SelectionBar's height
        yInnerOffsetRatio: 0.2,

        componentIconBox: {
            iconOpacity: 0.9, // universal opacity of the menu icons

            xInnerOffsetRatio: 0, // ratio of distance from left/right-most objects to menu left/right boundary
            yInnerOffsetRatio: 0, // ratio of distance from top/bottom of objects to menu top/bottom

            xIconSpacerRatio: 0.11, // ratio of x-spacing ratio based on button width
            yIconSpacerRatio: 0.1, // ratio of y-spacing ratio based on button height

            iconOutlineWidth: 0,
            iconOutlineColor: [255, 255, 255],

            textColor: [0, 0, 0], // universal color of the components' text
            textOpacity: 0.9, // universal opacity of the components' text

            textWidthRatio: 3, // ratio of text width based on button width
            textHeightRatio: 0.3 // ratio of text height based on button height
        }
    };

    this.params['xOffsetSpacer'] = this.params.width * this.params.xOffsetRatio;
    this.params['yOffsetSpacer'] = screenHeight * this.params.yOffsetRatio;

    this.params['xInnerSpacer'] = this.params.width * this.params.xInnerOffsetRatio;
    this.params['yInnerSpacer'] = screenHeight * this.params.yInnerOffsetRatio;
    
    let iconBoxParams = this.params.componentIconBox;

    iconBoxParams['width'] = this.params.width - (2 * this.params.xInnerSpacer);
    iconBoxParams['height'] = this.params.height - (2 * this.params.yInnerSpacer);

    iconBoxParams['x'] = this.params.x + ((this.params.width - iconBoxParams.width) / 2 + this.params.xOffsetSpacer);
    iconBoxParams['y'] = this.params.y + ((screenHeight - (iconBoxParams.height + this.params.yOffsetSpacer)) / 2);

    // Spacer between the boundary of the menu box and it's internal components
    iconBoxParams['xInnerSpacer'] = iconBoxParams.width * iconBoxParams.xInnerOffsetRatio;
    iconBoxParams['yInnerSpacer'] = iconBoxParams.height * iconBoxParams.yInnerOffsetRatio; 

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

    this.objects = {};
};


SelectionBar.prototype.clear = function() {
    k.destroyAll('_selectionComponent');
    k.destroyAll('_selectionText');
    for (var member in this.objects) {
        delete this.objects[member];
    }
    this.objects = {};
}

/*
 * Expected to receive object directly from levels config file.
 * Both parameters will be objects of the form:
 * [
 *   {
 *     name: ...
 *     quanitity: ...
 *   },
 *   {
 *      name: ...
 *      quantity: ...
 *    }
 * ]
 */
SelectionBar.prototype.addComponents = function(availableComponents) {

    let i = availableComponents.length;
    while (i--) {
        let addedComponent = availableComponents[i];
        if (this.objects.hasOwnProperty(addedComponent.name)) {
            this.objects[addedComponent.name].quantity += addedComponent.quantity;
            availableComponents.splice(i, 1);
        }
    }

    let numComponents = availableComponents.length + Object.keys(this.objects).length;
    let iconBoxParams = this.params.componentIconBox;

    iconBoxParams['xIconSpacer'] = iconBoxParams.width * iconBoxParams.xIconSpacerRatio;
    iconBoxParams['yIconSpacer'] = iconBoxParams.height * iconBoxParams.yIconSpacerRatio;

    iconBoxParams['iconWidth'] = ((iconBoxParams.width
        - (2 * iconBoxParams.xInnerSpacer)
        - ((numComponents - 1) * iconBoxParams.xIconSpacer))
        / numComponents);
    
    iconBoxParams['iconHeight'] = iconBoxParams.height - (2 * iconBoxParams.yInnerSpacer);

    let scaledIconDims = ScaledComponentImage(iconBoxParams.iconWidth, iconBoxParams.iconHeight);
        
    iconBoxParams['scaledIconWidth'] = scaledIconDims.width;
    iconBoxParams['scaledIconHeight'] = scaledIconDims.height;

    iconBoxParams['textWidth'] = iconBoxParams.scaledIconWidth * iconBoxParams.textWidthRatio;
    iconBoxParams['textHeight'] = iconBoxParams.scaledIconHeight * iconBoxParams.textHeightRatio;

    let currX = iconBoxParams.x + (iconBoxParams.xIconSpacer / 2);
    let currY = iconBoxParams.y;
    let textCenter;

    // First loop over any existing components to adjust their icons
    let currComponents = Object.values(this.objects);
    currComponents.sort((a,b) => (a.index > b.index) ? 1 : ((b.index > a.index) ? -1 : 0))
    for (let component of currComponents) {
        textCenter = {
            x: currX + (iconBoxParams.scaledIconWidth / 2),
            y: currY + (iconBoxParams.scaledIconHeight) + (iconBoxParams.textHeight / 2)
        }
        component.x = currX;
        component.y = currY;
        component.width = iconBoxParams.scaledIconWidth;
        component.height = iconBoxParams.scaledIconHeight;
        component.text.x = textCenter.x;
        component.text.y = textCenter.y;
        component.text.width = iconBoxParams.textWidth;
        component.text.height = iconBoxParams.textHeight;

        currX += iconBoxParams.xIconSpacer;
    }

    // Now loop over all newly added components
    let component;
    let index = currComponents.length;
    for (let i = 0; i < availableComponents.length; i++) {
        component = availableComponents[i];
        
        textCenter = {
            x: currX + (iconBoxParams.scaledIconWidth / 2),
            y: currY + (iconBoxParams.scaledIconHeight) + (iconBoxParams.textHeight / 2)
        }

        this.objects[component.name] = {
            quantity: component.quantity,
            x: currX,
            y: currY,
            width: iconBoxParams.scaledIconWidth,
            height: iconBoxParams.scaledIconHeight,
            opacity: iconBoxParams.iconOpacity,
            outlineWidth: iconBoxParams.iconOutlineWidth,
            outlineColor: iconBoxParams.iconOutlineColor,
            index: index,
            text: {
                x: textCenter.x,
                y: textCenter.y,
                width: iconBoxParams.textWidth,
                height: iconBoxParams.textHeight,
                origin: 'center',
                color: iconBoxParams.textColor,
                opacity: iconBoxParams.textOpacity
            }
        };
        index++;
        currX += iconBoxParams.xIconSpacer;
    }
    this.buildObject();
};


SelectionBar.prototype.buildObject = function() {

    // Selection Bar container
    k.add([
        k.rect(this.params.width, this.params.height),
        k.pos(this.params.x, this.params.y),
        k.color(...this.params.backgroundColor),
        k.opacity(this.params.backgroundOpacity),
    ]);

    // Place components - unknown amount so must loop
    let spriteDef, textDef, componentBtn, labelText, label
    for (const [name, attributes] of Object.entries(this.objects)) {
        
        // First place icon
        spriteDef = [
            k.sprite(name, { width: attributes.width, height: attributes.height }),
            k.pos(attributes.x, attributes.y),
            k.opacity(attributes.opacity),
            k.area(),
            '_selectionComponent'
        ];
        componentBtn = k.add(spriteDef);
        
        componentBtn.clicks(() => this.update(name));

        attributes['iconGraphic'] = componentBtn;

        // Then place text underneath
        labelText = attributes.text;
        textDef = [
            k.text(formatLabel(name, attributes.quantity), 
                    { size: labelText.height, width: labelText.width }),
            k.pos(labelText.x, labelText.y),
            k.origin(labelText.origin),
            k.color(...labelText.color),
            k.opacity(labelText.opacity),
            '_selectionText'
        ];

        label = k.add(textDef);
        attributes['textGraphic'] = label;

        k.layers([
            "rec",
            "comment",
        ], "game")

        let description = ComponentConfig.get(name).description

        let recHeight = (Math.ceil(description.length / 40)) * (attributes.height / 3);
        let tooltipWidth = attributes.width * 8;
        let recParams, commentParams;
        recParams = [
            k.rect(tooltipWidth, recHeight),
            k.layer("rec"),
            k.pos(attributes.x + 10, attributes.y + 10),
            k.color(206, 212, 223),
            k.scale(0),
            k.outline(attributes.width * 0.07),
        ];
        commentParams = [
            k.text("", { size: attributes.width * 0.32, width: tooltipWidth }),
            k.layer("comment"),
            k.pos(attributes.x + 12.5, attributes.y + 12.5),
        ];

        let rec = k.add(recParams);
        let comment = k.add(commentParams);
        componentBtn.hovers(() => {
            rec.scale = 1
            comment.text = description
        }, () => {
            rec.scale = 0
            comment.text = ""
        })

        componentBtn.clicks(() => {
            rec.scale = 0
            comment.text = ""
        })
    };
};

SelectionBar.prototype.drawComponent = function(componentName, componentParams, newText, makeAvailable=true) {

    if (this.objects.hasOwnProperty(componentName)) {
        let existing = this.objects[componentName];

        k.destroy(existing.iconGraphic);
        delete existing.iconGraphic;

        let updatedBtn = k.add([
            k.sprite(componentName, { width: existing.width, height: existing.height }),
            k.pos(existing.x, existing.y),
            k.opacity(existing.opacity),
            k.area()
        ]);
        
        existing.iconGraphic = updatedBtn;
        existing.textGraphic.text = newText;

        if (makeAvailable) {
            updatedBtn.clicks(() => this.update(componentName));
            existing.textGraphic.opacity = existing.text.opacity;
        } else {
            existing.textGraphic.opacity = UNAVAILABLE_OPACITY;
        }
        return true;
    } else {
        // First place icon
        let componentBtn = k.add([
            k.sprite(componentName, { width: componentParams.width, height: componentParams.height }),
            k.pos(componentParams.x, componentParams.y),
            k.opacity(componentParams.opacity),
            k.area()
        ]);
        
        componentBtn.clicks(() => this.update(componentName));
        componentParams['iconGraphic'] = componentBtn;

        // Then place text underneath
        let labelText = componentParams.text;
        let textLabelDef = [
            k.text(formatLabel(componentName, componentParams.quantity), 
                    { size: labelText.height, width: labelText.width }),
            k.pos(labelText.x, labelText.y),
            k.origin(labelText.origin),
            k.color(...labelText.color),
            k.opacity(labelText.opacity)
        ];

        let componentLabel = k.add(textLabelDef);
        componentParams['textGraphic'] = componentLabel;
    }
}

// Called whenever the state of the selection bar changes (ie. component placed on playField)
SelectionBar.prototype.update = function(componentName, amount = -1) { 

    if (this.objects.hasOwnProperty(componentName)) {

        let targetParams = this.objects[componentName];
        let newQuantity = targetParams.quantity + amount;

        // Already out of this component. Can only accept +amounts
        if (targetParams.quantity < 1) {
            // Have 0 remaining
            if (amount < 0) {
                // Try decreasing amount
                console.debug(`Can't place a ${componentName}. None available`);
                return false;
            } else if (amount > 0) {
                // Try increasing amount
                console.debug(componentName, 'is now available.');
                this.drawComponent(componentName, targetParams, formatLabel(componentName, newQuantity));
            }
        } else {
            // Have at least 1 remaining of this component
            if (amount < 0) {
                if (!FieldController.placeComponent(componentName, k.vec2(...COMPONENT_SPAWN_POS))) {
                    return false;
                }
            }
            if (newQuantity <= 0) { 
                // Trying to decrease to an invalid state (<= 0)
                console.debug(`No more ${componentName}s available`);

                this.drawComponent(componentName, targetParams, formatLabel(componentName, 0), false);
            } else {
                targetParams.textGraphic.text = formatLabel(componentName, newQuantity);
                targetParams.quantity = newQuantity;
            }
        }
        targetParams.quantity = newQuantity;
        return true;
    }
    return false;
};

const formatLabel = (name, quantity) => { return `${name.replaceAll('_', ' ')} x${quantity}`};

