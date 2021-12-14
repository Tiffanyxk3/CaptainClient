/**
 * A somewhat basic graphic object that simply displays the sections where the
 * game play occurs and is responsible for determining the dimensions of the
 * client and processor "space"
 */

import k from '../kaboom/kaboom.js';
import BoundingRect from '../kaboom/components/boundingRect.js';

export default function PlayField(screenX, screenY, screenWidth, screenHeight) {
    this.init(screenX, screenY, screenWidth, screenHeight);

    // Expose function anonymously to ensure correct context
    this.build = () => { this.buildObject(); };
};

PlayField.prototype.init = function(screenX, screenY, screenWidth, screenHeight) {

    this.params = {
        x: screenX,
        y: screenY,
        width: screenWidth, // width of the total field (expand to fill screen width)
        height: screenHeight, // height of the total field (expand to fill screen height)

        outlineWidth: 2,
        outlineColor: [255, 255, 255],

        items: [
            { name: 'client', type: 'space', placement: 'adjacent', widthRatio: 0.1, color: [135, 173, 199], opacity: 0.5 },
            { name: 'edge', type: 'boundary', placement: 'adjacent', widthRatio: 0.01, color: [255, 255, 255], opacity: 0.5 },
            { name: 'component', type: 'space', placement: 'adjacent', widthRatio: 0.79, color: [100, 160, 200], opacity: 0.5 },
            { name: 'endpoint', type: 'space', placement: 'overlap', widthRatio: 0.1, color: [100, 160, 200], opacity: 0 }
        ]
    };

    let prevX = this.params.x;
    let prevY = this.params.y + (this.params.height / 2);
    for (let item of this.params.items) {
        let itemName = item.name + (item.type.charAt(0).toUpperCase() + item.type.slice(1));
        let itemParams = {
            y: prevY,
            width: this.params.width * item.widthRatio,
            height: this.params.height,
        }   
        prevX += (itemParams.width / 2);
        itemParams['x'] = prevX;
        itemParams['p1'] = [prevX - (itemParams.width / 2), prevY - (itemParams.height / 2)];
        itemParams['p2'] = [prevX + (itemParams.width / 2), prevY + (itemParams.height / 2)];
        itemParams['rect'] = new BoundingRect(itemParams['p1'][0], itemParams['p1'][1], itemParams.width, 
            itemParams.height);
        Object.assign(itemParams, item);
        this[itemName] = itemParams;
        prevX += (itemParams.width / 2);
    }
};


PlayField.prototype.buildObject = function() {

    // Outer rectangle container
    k.add([ 
        k.rect(this.params.width, this.params.height),
        k.pos(this.params.x, this.params.y),
        k.outline(this.params.outlineWidth, this.params.outlineColor),
    ]);

    for (let item of this.params.items) {
        let itemName = item.name + (item.type.charAt(0).toUpperCase() + item.type.slice(1));
        let itemParams = this[itemName];
        if (item.type === 'boundary') {
            k.drawLine({
                p1: k.vec2(...itemParams.p1),
                p2: k.vec2(...itemParams.p2),
                width: itemParams.width,
                color: k.color(...itemParams.color)
            });
        } else if (item.type === 'space') {
            k.add([
                k.rect(itemParams.width, itemParams.height),
                k.pos(itemParams.x, itemParams.y),
                k.color(...itemParams.color),
                k.opacity(itemParams.opacity),
                k.origin('center')
            ]);
        }
    }
};

PlayField.prototype.inClientSpace = function(x, y, w, h) {
    return this.clientSpace.rect.contains(x, y, w, h);
};
PlayField.prototype.inComponentSpace = function(x, y, w, h) {
    return this.componentSpace.rect.contains(x, y, w, h);
};
PlayField.prototype.inEndpointSpace = function(x, y, w, h) {
    return this.endpointSpace.rect.confine(x, y, w, h) ;
};


PlayField.prototype.confineClientSpace = function(x, y, w, h) {
    return this.clientSpace.rect.confine(x, y, w, h);
};
PlayField.prototype.confineComponentSpace = function(x, y, w, h) {
    return this.componentSpace.rect.confine(x, y, w, h) ;
};
PlayField.prototype.confineEndpointSpace = function(x, y, w, h) {
    return this.endpointSpace.rect.confine(x, y, w, h);
};


