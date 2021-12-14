/**
 * Custom Kaboom component to enable dragging of a graphical object
 */

import k from '../kaboom.js';

var isDragging = false;
var currDraggingComponent = null;
var dragStartPos = null;

export const dragControls = {
    release: () => { currDraggingComponent = null; isDragging = false; k.cursor('default'); },
    isDragging: () =>  isDragging,
    current: () => currDraggingComponent,
    acquire: (context, pos) => { dragStartPos = pos.sub(context.pos); currDraggingComponent = context; }
}

export function drag() {
    return {
        require: [ "pos", "area" ],
        updatePos(pos) {
            isDragging = true;
            this.pos = pos.sub(dragStartPos);
            // this.pos = pos;
            // this.boundingBox().move(pos.x, pos.y);
            // this.pos = this.boundaryBox().confine(this.boundingBox())
        },
    };
};
