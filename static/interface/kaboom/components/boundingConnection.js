
import k from '../kaboom.js';
import { ConnectionDisplayParams } from './interfaceConnection.js';
import { BoundingRect, BoundRectTypes, BoundRectOrigins } from './boundingRect.js';


export function BoundingConnection(componentA, componentB) {

    console.log('ComponentA -', componentA.name());
    console.log('ComponentB -', componentB.name());



    this.width = ConnectionDisplayParams.width;
    this.baseHeight = componentA.pos.dist(componentB.pos);
    this.height = componentA.pos.dist(componentB.pos);
    
    this.componentA = componentA;
    this.componentB = componentB;

    this.aPos = this.componentA.pos;
    this.bPos = this.componentB.pos;


    let centerX = Math.min(this.aPos.x, this.bPos.x) + (Math.abs(this.aPos.x - this.bPos.x) / 2);
    let centerY = Math.min(this.aPos.y, this.bPos.y) + (Math.abs(this.aPos.y - this.bPos.y) / 2);

    this.center = k.vec2(centerX, centerY);


    if (this.aPos.y < this.bPos.y) {
        this.topBoundary = this.aPos.y - (this.width / 2);
        this.bottomBoundary = this.bPos.y + (this.width / 2);
    } else {
        this.topBoundary = this.bPos.y - (this.width / 2);
        this.bottomBoundary = this.aPos.y + (this.width / 2);
    }

    if (this.aPos.x < this.bPos.x) {
        this.leftBoundary = this.aPos.x;
        this.rightBoundary = this.bPos.x;
    } else {
        this.leftBoundary = this.bPos.x;
        this.rightBoundary = this.aPos.x;
    }

    

    // console.log('BOUNDARIES:');
    // console.log('\tLEFT:', this.leftBoundary);
    // console.log('\tRIGHT:', this.rightBoundary);
    // console.log('\tTOP:', this.topBoundary);
    // console.log('\tBOTTOM', this.bottomBoundary);
    
    this.matrix = new Matrix(centerX, centerY);
    // TODO: need to transform matrix to reflect the current rotation (want 0°)

    this.angle = this.aPos.angle(this.bPos);


    console.log('---- INIT ----');

    console.log('COMPONENTS:');
    console.log('\tA:', this.aPos);
    console.log('\tB:', this.bPos);

    console.log('Center:', this.center);

    let midX = (this.aPos.x + this.bPos.x) / 2;
    let midY = (this.aPos.y + this.bPos.y) / 2;

    let angA_B = this.aPos.angle(this.bPos);
    let angB_A = this.bPos.angle(this.aPos);

    console.log('Midpoint:', k.vec2(midX, midY));

    console.log('Raw Angle A /_ B:', angA_B);
    console.log('Raw Angle B /_ A:', angB_A);

    console.log('Normalized Angle A /_ B:', -angA_B + 180);
    console.log('Normalized Angle B /_ A:', -angB_A + 180);

    let aLen = Math.sqrt(this.aPos.x ** 2 + this.aPos.y ** 2);
    let bLen = Math.sqrt(this.bPos.x ** 2 + this.bPos.y ** 2);

    let aDotB = (this.aPos.x * this.bPos.x) + (this.aPos.y * this.bPos.y);

    let ang = Math.acos((aDotB) / (aLen * bLen));

    console.log('Len A:', aLen);
    console.log('Len B:', bLen);

    console.log('A • B', aDotB);

    console.log('A /_ B', toDegrees(ang));

    console.log(Math.atan2(this.aPos.y - this.bPos.y, this.aPos.x - this.bPos.x));
    console.log(toDegrees(Math.atan2(this.aPos.y - this.bPos.y, this.aPos.x - this.bPos.x)));

    console.log('--------------');


    // this.update();
    console.log(this.matrix);
};

// // copy the prototype from the base to setup inheritance
// BoundingConnection.prototype = Object.create(BoundingRect.prototype);
// Object.defineProperty(BoundingConnection.prototype, 'constructor', {
//     value: BoundingConnection,
//     enumerable: false, // so that it does not appear in 'for in' loop
//     writable: true
// });
const toRadians = (angle) => (angle * (Math.PI / 180));
const toDegrees = (angle) => (angle * (180 / Math.PI));

const bitwiseSubtract = (() => {
	return (a, b) => {
        let borrow;
        while (b !== 0) {
            borrow = (~a) & b;
            a = a ^ b;
            b = borrow << 1;
        }
        return a;
    };
})();

const bitwiseAdd = (() => {
	return (a, b) => {
        let carry;
        while (b !== 0) {
            carry = a & b;
            a = a ^ b;
            b = carry << 1;
        }
        return a;
    };
})();

BoundingConnection.prototype.update = function() {
    
    let centerX = Math.min(this.aPos.x, this.bPos.x) + (Math.abs(this.aPos.x - this.bPos.x) / 2);
    let centerY = Math.min(this.aPos.y, this.bPos.y) + (Math.abs(this.aPos.y - this.bPos.y) / 2);
    
    this.center = k.vec2(centerX, centerY);
    let newHeight = this.aPos.dist(this.bPos);

    this.matrix.scale(1, (newHeight / this.height));
    // console.log('SCALE ADJ:', newHeight / this.baseHeight);

    this.height = newHeight;


    // let angA_B = this.aPos.angle(this.bPos);
    // let normalized_angA_B = -angA_B + 180;
    // console.log('A < B:', `${angA_B}°`, `${-angA_B + 180}°`);

    // let angB_A = this.bPos.angle(this.aPos);
    // let normalized_angB_A = -angB_A + 180;
    // console.log('B < A', `${angB_A}°`, `${-angB_A + 180}°`);
    // this.angle = this.aPos.angle(this.bPos);

    console.log(this.matrix);
}



BoundingConnection.prototype.move = function(component) {
    let topA, bottomB;
    let anchorPos, movedPos;

    if (component.uuid() === this.componentA.uuid()) { // A was moved
        
        this.aPos = component.pos; // update A's position
        movedPos = this.aPos; 
        anchorPos = this.bPos;

    } else { // B was moved
        
        this.bPos = component.pos; // update B's position
        movedPos = this.bPos;
        anchorPos = this.aPos;
    }

    // this.matrix.setTranslate(-movedPos.x, -movedPos.y);
    // let diff = this.aPos.sub(this.bPos);
    // console.log(diff);

    let centerX = Math.min(this.aPos.x, this.bPos.x) + (Math.abs(this.aPos.x - this.bPos.x) / 2);
    let centerY = Math.min(this.aPos.y, this.bPos.y) + (Math.abs(this.aPos.y - this.bPos.y) / 2);

    let centerDiff = k.vec2(this.center.x - centerX, this.center.y - centerY);

    
    

    // console.log('TRANSLATE DIFF:', diff);

    this.matrix.translate(-centerDiff.x, -centerDiff.y);

    this.update();

    let newAngle = this.aPos.angle(this.bPos);
    let angleDiff = this.angle - newAngle;

    this.matrix.rotate(toRadians(angleDiff));
    // this.matrix.setRotate(toRadians(-(-this.angle + 180)));

    this.matrix.translate(2 * centerDiff.x, 2 * centerDiff.y);

    this.angle = newAngle;
}

BoundingConnection.prototype.contains = function(pos) {
    // let pos = this.matrix.applyToPoint(p.x, p.y);
    // console.log(p, pos);

    if ((pos.x) < this.leftBoundary) {
        console.log('Less than left boundary');
        return false;
    }
    if ((pos.x) > this.rightBoundary) {
        console.log('Greater than right boundary');
        return false;
    }
    if ((pos.y) < this.topBoundary) {
        console.log('Less than top boundary');
        return false;
    } 
    if ((pos.y) > this.bottomBoundary) {
        console.log('Greater than bottom boundary');
        return false;
    }

    // this.update();
    return true;
};

BoundingConnection.prototype.clicked = function(point) {
    let pos = point;
	let translated = this.matrix.tranformPoint(pos.x, pos.y);
	
    console.log('Click pos:', point, ' Translated click:', translated);

    // console.log('COMPONENTS:');
    // console.log('\tA:', this.aPos);
    // console.log('\tB:', this.bPos);

    // console.log('BOUNDARIES:');
    // console.log('\tLEFT:', this.leftBoundary);
    // console.log('\tRIGHT:', this.rightBoundary);
    // console.log('\tTOP:', this.topBoundary);
    // console.log('\tBOTTOM', this.bottomBoundary);
	
    if (this.contains(translated)) {
			console.log("CLICEKD!");
		}
};




function Matrix(initX, initY) {
    this.xScale = 1;
    this.yScale = 1;

    this.xSkew = 0;
    this.ySkew = 0;

    this.xTranslate = 0;
    this.yTranslate = 0;

    this.baseX = initX;
    this.baseY = initY;
}


Matrix.prototype.rotate = function(angle) {

    var cos = Math.cos(angle),
        sin = Math.sin(angle);

    var newXScale = cos,
        newYScale = cos,
        newXSkew = -sin,
        newYSkew = sin,
        newXTranslate = 0,
        newYTranslate = 0;

    // this.transform(newXScale, newYScale, newXSkew, newYSkew, newXTranslate, newYTranslate);

    var prevXScale = this.xScale,
        prevYScale = this.yScale,
        prevXSkew = this.xSkew,
        prevYSkew = this.ySkew;
    
    this.xScale = (prevXScale * newXScale) + (prevXSkew * newYSkew);
    this.yScale = (prevYScale * newYScale) + (prevYSkew * newXSkew);

    this.xSkew = (prevXSkew * newYScale) + (prevXScale * newXSkew);
    this.ySkew = (prevYSkew * newXScale) + (prevYScale * newYSkew);

    return this;
};


Matrix.prototype.scale = function(sx, sy) {

    var newXScale = sx,
        newYScale = sy,
        newXSkew = 0,
        newYSkew = 0,
        newXTranslate = 0,
        newYTranslate = 0;

    // this.transform(newXScale, newYScale, newXSkew, newYSkew, newXTranslate, newYTranslate);
    
    var prevXScale = this.xScale,
        prevYScale = this.yScale,
        prevXSkew = this.xSkew,
        prevYSkew = this.ySkew;

    
    this.xScale = (prevXScale * newXScale)// + (prevXSkew * newYSkew);
    this.yScale = (prevYScale * newYScale)// + (prevYSkew * newXSkew);

    this.xSkew = (prevXSkew * newYScale)// + (prevXScale * newXSkew);
    this.ySkew = (prevYSkew * newXScale)// + (prevYScale * newYSkew);

    return this;
};

Matrix.prototype.translate = function(tx, ty) {

    var newXScale = 1,
        newYScale = 1,
        newXSkew = 0,
        newYSkew = 0,
        newXTranslate = tx,
        newYTranslate = ty;

    // this.transform(newXScale, newYScale, newXSkew, newYSkew, newXTranslate, newYTranslate);

    var prevXScale = this.xScale,
        prevYScale = this.yScale,
        prevXSkew = this.xSkew,
        prevYSkew = this.ySkew,
        prevXTranslate = this.xTranslate,
        prevYTranslate = this.yTranslate;
    
    this.xTranslate = prevXTranslate + (prevXScale * newXTranslate) + (prevXSkew * newYTranslate);
    this.yTranslate = prevYTranslate + (prevYScale * newYTranslate) + (prevYSkew * newXTranslate);
    // this.xTrans = newXTranslate;
    // this.yTrans = newYTranslate;
};


Matrix.prototype.transform = function(newXScale, newYScale, newXSkew, newYSkew, newXTranslate, newYTranslate) {

    var prevXScale = this.xScale,
        prevYScale = this.yScale,
        prevXSkew = this.xSkew,
        prevYSkew = this.ySkew,
        prevXTranslate = this.xTranslate,
        prevYTranslate = this.yTranslate;
    

    this.xScale = (prevXScale * newXScale) + (prevXSkew * newYSkew);
    this.yScale = (prevYScale * newYScale) + (prevYSkew * newXSkew);

    this.xSkew = (prevXSkew * newYScale) + (prevXScale * newXSkew);
    this.ySkew = (prevYSkew * newXScale) + (prevYScale * newYSkew);

    this.xTranslate = prevXTranslate + (prevXScale * newXTranslate) + (prevXSkew * newYTranslate);
    this.yTranslate = prevYTranslate + (prevYScale * newYTranslate) + (prevYSkew * newXTranslate);
};


Matrix.prototype.tranformPoint = function(x, y) {

    // var currXScale = this.xScale,
    //     currYScale = this.yScale,
    //     currXSkew = this.xSkew,
    //     currYSkew = this.ySkew,
    //     currXTranslate = this.xTranslate,
    //     currYTranslate = this.yTranslate;
    
    // var dt = (currXScale * currYScale) - (currXSkew * currYSkew);


    // var inverseXScale = currYScale / dt,
    //     inverseYSkew = -currYSkew / dt,
    //     inverseXSkew = -currXSkew / dt,
    //     inverseYScale = currXScale / dt,
    //     inverseXTrans = ((currXSkew * currYTranslate) - (currYScale * currXTranslate)) / dt,
    //     inverseYTrans = -((currXScale * currYTranslate) - (currYSkew * currXTranslate)) / dt;


    
    // let transformedX = (x * currXScale) + (y * currXSkew) + currXTranslate;
    // let transformedY = (y * inverseYScale) + (x * inverseYSkew) + inverseYTrans;

    // return k.vec2(transformedX, transformedY);



    // let xScale = (this.xScaleRot * this.xScaleSca) + (this.xSkewRot);
    // let yScale = (this.yScaleRot * this.yScaleSca) + (this.ySkewRot);

    // let xSkew = this.xSkewRot;
    // let ySkew = this.ySkewRot;
    
    // let xTranslate = this.xTrans + (xScale * this.xTrans) + (xSkew * this.yTrans);
    // let yTranslate = this.yTrans + (yScale * this.yTrans) + (ySkew * this.xTrans);

    // let transformedX = (x * xScale) + (y * xSkew) + xTranslate; // + this.baseX;
    // let transformedY = (y * yScale) + (x * ySkew) + yTranslate; // + this.baseY;

    let transformedX = (x * this.xScale) + (y * this.xSkew) + this.xTranslate; // + this.baseX;
    let transformedY = (y * this.yScale) + (x * this.ySkew) + this.yTranslate; // + this.baseY;

    return k.vec2(transformedX, transformedY);
};


















































/**
* 2D transformation matrix object initialized with identity matrix.
*
* The matrix can synchronize a canvas context by supplying the context
* as an argument, or later apply current absolute transform to an
* existing context.
*
* All values are handled as floating point values.
*
* @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
* @prop {number} a - scale x
* @prop {number} b - skew y
* @prop {number} c - skew x
* @prop {number} d - scale y
* @prop {number} e - translate x
* @prop {number} f - translate y
* @prop {CanvasRenderingContext2D} [context] - set or get current canvas context
* @constructor
*/
function SampleMatrix(initX, initY) {
    
    this.xScale = 1;
    this.ySkew = 0;
    this.xSkew = 0;
    this.yScale = 1;

    this.rotateXScale = 1;
    this.rotateYScale = 1;
    this.rotateXSkew = 0;
    this.rotateYSkew = 0;

    this.scaledXScale = 1;
    this.scaledYScale = 1;
    this.scaledXSkew = 0;
    this.scaledYSkew = 0;

    this.xTranslate = 0;
    this.yTranslate = 0;

    this.baseX = initX;
    this.baseY = initY;
}

SampleMatrix.prototype = {
    

    setRotate: function(angle) {
        
        var cos = Math.cos(angle),
        sin = Math.sin(angle);

        let newXScale = cos;
        let newYSkew = sin;
        let newXSkew = -sin;
        let newYScale = cos;


        var prevXScale = this.xScale,
        prevYSkew = this.ySkew,
        prevXSkew = this.xSkew,
        prevYScale = this.yScale;

        this.xScale = (prevXScale || 1) * (newXScale || 1);
        this.yScale = (prevYScale || 1) * (newYScale || 1);
        this.ySkew = newYSkew;
        this.xSkew = newXSkew;

        return this;
    },

    setScale: function(dx, dy) {

        var newXScale = dx,
        newYSkew = 0,
        newXSkew = 0,
        newYScale = dy;

        
        var prevXScale = this.xScale,
        prevYScale = this.yScale;

        
        this.xScale = (prevXScale || 1) * (newXScale || 1);
        this.yScale = (prevYScale || 1) * (newYScale || 1);
        
        
        return this;
	},
    
    /**
    * Translate current matrix accumulative.
    * @param {number} tx - translation for x
    * @param {number} ty - translation for y
    */
    translate: function(tx, ty) {
        // this.transform(1, 0, 0, 1, tx, ty);
        // this.setTranslate(tx, ty);
        var prevXScale = this.xScale,
        prevYSkew = this.ySkew,
        prevXSkew = this.xSkew,
        prevYScale = this.yScale,
        prevXTranslate = this.xTranslate,
        prevYTranslate = this.yTranslate;
        
        this.xTranslate = prevXScale * tx + prevXSkew * ty + prevXTranslate;
        this.yTranslate = prevYSkew * tx + prevYScale * ty + prevYTranslate;
    },


    /*
     *
     *** Transform Template ***
     * 
     * --- function(newXScale, newYSkew, newXSkew, newYScale, newXTranslate, newYTranslate) ---
     * 
     * - xScale = (prevXScale * newXScale) + (prevXSkew * newYSkew)
     * - ySkew = (prevYSkew * newXScale) + (prevYScale * newYSkew)
     * - xSkew = (prevXSkew * newYScale) + (prevXScale * newXSkew)
     * - yScale = (prevYScale * newYScale) + (prevYSkew * newXSkew)
     * - xTranslate = prevXTranslate + (prevXScale * newXTranslate) + (prevXSkew * newYTranslate)
     * - yTranslate = prevYTranslate + (prevYSkew * newXTranslate) + (prevYScale * newYTranslate)
     * 
     * 
     * Rotate:      transform(cos, sin, -sin, cos, 0, 0);
     *      Parameters:
     *          - xScale = cos
     *          - ySkew = sin
     *          - xSkew = -sin
     *          - yScale = cos
     *          - xTranslate = 0
     *          - yTranslate = 0
     * 
     *      Result: 
     *          - xScale = (xScale * cos) + (xSkew * sin)
     *          - ySkew = (ySkew * cos) + (yScale * sin)
     *          - xSkew = (xSkew * cos) + (xScale * -sin)
     *          - yScale = (yScale * cos) + (ySkew * -sin)
     *          - xTranslate = xTranslate + (xScale * 0) + (xSkew * 0)
     *          - yTranslate = yTranslate + (ySkew * 0) + (yScale * 0)
     * 
     * 
     * Scale:       transform(sx, 0, 0, sy, 0, 0);
     *          - xScale = sx
     *          - ySkew = 0
     *          - xSkew = 0
     *          - yScale = sy
     *          - xTranslate = 0
     *          - yTranslate = 0
     * 
     *      Result: 
     *          - xScale = (xScale * sx) + (xSkew * 0)
     *          - ySkew = (ySkew * sx) + (yScale * 0)
     *          - xSkew = (xSkew * sy) + (xScale * 0)
     *          - yScale = (yScale * sy) + (ySkew * 0)
     *          - xTranslate = xTranslate + (xScale * 0) + (xSkew * 0)
     *          - yTranslate = yTranslate + (ySkew * 0) + (yScale * 0)
     * 
     * 
     * Translate:   transform(1, 0, 0, 1, tx, ty);
     *          - xScale = 1
     *          - ySkew = 0
     *          - xSkew = 0
     *          - yScale = 1
     *          - xTranslate = tx
     *          - yTranslate = ty
     * 
     *      Result: 
     *          - xScale = (xScale * 1) + (xSkew * 0)
     *          - ySkew = (ySkew * 1) + (yScale * 0)
     *          - xSkew = (xSkew * 1) + (xScale * 0)
     *          - yScale = (yScale * 1) + (ySkew * 0)
     *          - xTranslate = xTranslate + (xScale * tx) + (xSkew * ty)
     *          - yTranslate = yTranslate + (ySkew * tx) + (yScale * ty)
     */
    
    /**
    * Multiplies current matrix with new matrix values.
    * @param {number} newXScale - scale x
    * @param {number} newYSkew - skew y
    * @param {number} newXSkew - skew x
    * @param {number} newYScale - scale y
    * @param {number} newXTranslate - translate x
    * @param {number} newYTranslate - translate y
    */
    transform: function(newXScale, newYSkew, newXSkew, newYScale, newXTranslate, newYTranslate) {
        var prevXScale = this.xScale,
        prevYSkew = this.ySkew,
        prevXSkew = this.xSkew,
        prevYScale = this.yScale,
        prevXTranslate = this.xTranslate,
        prevYTranslate = this.yTranslate;
        
        
        this.xScale = prevXScale * newXScale + prevXSkew * newYSkew;
        this.ySkew = prevYSkew * newXScale + prevYScale * newYSkew;
        this.xSkew = prevXScale * newXSkew + prevXSkew * newYScale;
        this.yScale = prevYSkew * newXSkew + prevYScale * newYScale;
        this.xTranslate = prevXScale * newXTranslate + prevXSkew * newYTranslate + prevXTranslate;
        this.yTranslate = prevYSkew * newXTranslate + prevYScale * newYTranslate + prevYTranslate;
        
        return this;
    },
    
    
    
    /**
    * Apply current matrix to x and y point.
    * Returns a point object.
    *
    * @param {number} x - value for x
    * @param {number} y - value for y
    * @returns {{x: number, y: number}} A new transformed point object
    */
    applyToPoint: function(x, y) {
        let transformedX = x * this.xScale + y * this.xSkew + this.xTranslate// + this.baseX;
        let transformedY = x * this.ySkew + (y * this.yScale) + this.yTranslate// + this.baseY;
        return k.vec2(transformedX, transformedY);
    },
    
    /**
    * Apply current matrix to array with point objects or point pairs.
    * Returns a new array with points in the same format as the input array.
    *
    * A point object is an object literal:
    *
    * {x: x, y: y}
    *
    * so an array would contain either:
    *
    * [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
    *
    * or
    * [x1, y1, x2, y2, ... xn, yn]
    *
    * @param {Array} points - array with point objects or pairs
    * @returns {Array} A new array with transformed points
    */
    applyToArray: function(points) {
        
        var i = 0, p, l, mxPoints = [];
        
        if (typeof points[0] === 'number') {
            
            l = points.length;
            
            while(i < l) {
                p = this.applyToPoint(points[i++], points[i++]);
                mxPoints.push(p.x, p.y);
            }
        }
        else {
            for(; p = points[i]; i++) {
                mxPoints.push(this.applyToPoint(p.x, p.y));
            }
        }
        
        return mxPoints;
    }
};