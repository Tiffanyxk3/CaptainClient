/*
 * Simple object used to store a rectangle's coordinates
 * 
 * Used solely to give a "body" to each part of the play field in order to test
 * if a point is in one of the two spaces (client or processor)
 */

export function BoundingRect (x, y, w, h) {
    this.width = w;
    this.height = h;
    this.leftBoundary = Math.floor(x);
    this.topBoundary = Math.floor(y);
    this.rightBoundary = Math.floor(x + w);
    this.bottomBoundary = Math.floor(y + h);
    this.center = [x + w/2, y + h/2]

    this.move = (newX, newY) => {
        this.leftBoundary = Math.floor(newX);
        this.topBoundary = Math.floor(newY);
        this.rightBoundary = Math.floor(newX + this.w);
        this.bottomBoundary = Math.floor(newY + this.h);
    };

    this.resize = (adjustW, adjustH) => {
        this.width += Math.floor(adjustW);
        this.height += Math.floor(adjustH);
        this.rightBoundary += Math.floor(adjustW);
        this.bottomBoundary += Math.floor(adjustH);
    }

    this.contains = (x, y, w, h) => {
        return (x - w/2) >= this.leftBoundary && (x + w/2) <= this.rightBoundary && 
                (y - h/2) >= this.topBoundary && (y + h/2) <= this.bottomBoundary;
    };

    this.confine = (x, y, w, h) => {
        if ((x - w/2) < this.leftBoundary) {
            x = this.leftBoundary + w/2;
        } else if ((x + w/2) > this.rightBoundary) {
            x = this.rightBoundary - w/2;
        }

        if ((y - h/2) < this.topBoundary) {
            y = this.topBoundary + h/2;
        } else if ((y + h/2) > this.bottomBoundary) {
            y = this.bottomBoundary - h/2;
        }
        return [x, y];
    };
};

export default BoundingRect