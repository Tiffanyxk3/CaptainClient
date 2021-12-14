/**
 * Aggregation of Kaboom's "graphic object"-specific functions. Used to simplify
 * repeated graphical manipulation and house default values.
 * 
 * While it may have simplified things in my mind some of the functions may actually
 * prove to be more complicated than simply working from scratch everytime. In which case
 * these functions can readily be removed and the original Kaboom code can be
 * used to accomplish the same thing
 */


import k from './kaboom.js';


// Do we want this constant? Would be best to scale them...
const COMPONENT_IMG_WIDTH = 75;
const COMPONENT_IMG_HEIGHT = 75;

// ALL ICONS HAVE SAME SIZE (512p x 512p)
const ICON_WIDTH = 512;
const ICON_HEIGHT = 512;

// Constant image size
const BACKGROUND_IMG_WIDTH = 1200;
const BACKGROUND_IMG_HEIGHT = 650;


// Scale an image according to a bounding box 
export const ScaledComponentImage = (boundingWidth, boundingHeight) => {
    if (!boundingWidth || !boundingHeight) { 
        return { width: COMPONENT_IMG_WIDTH, height: COMPONENT_IMG_HEIGHT }; 
    }
    return Scaled(COMPONENT_IMG_WIDTH, COMPONENT_IMG_HEIGHT, boundingWidth, boundingHeight);
};

export const ScaledIcon = (boundingWidth, boundingHeight) => {
    if (!boundingWidth || !boundingHeight) { 
        return { width: ICON_WIDTH, height: ICON_HEIGHT }; 
    }
    return Scaled(ICON_WIDTH, ICON_HEIGHT, boundingWidth, boundingHeight);
};

export const ScaledBackground = (boundingWidth, boundingHeight) => {
    if (!boundingWidth || !boundingHeight) { 
        return { width: BACKGROUND_IMG_WIDTH, height: BACKGROUND_IMG_HEIGHT }; 
    }

    return Scaled(BACKGROUND_IMG_WIDTH, BACKGROUND_IMG_HEIGHT, boundingWidth, boundingHeight);
};

export const Scaled = (imgWidth, imgHeight, boundingWidth, boundingHeight) => {
    var ratio = Math.min((boundingWidth / imgWidth), (boundingHeight / imgHeight));
    return { width: (imgWidth * ratio), height: (imgHeight * ratio) };
};


// Center object on an anchor. NOTE: DOESN'T ALWAYS WORK...
/**
 * Expected parameters:
 * objSize: { width, height }
 * anchorPos: { x, y }
 * anchorSize: { width, height }
 * align: { 'top', 'middle', 'mid', 'bottom', 'bot' }
 * origin: { 'topleft', 'left', 'botleft', 'top', 'center', 'bot', 'topright', 'right', 'botright' }
 */ 
export var Centered = function(objSize, anchorPos, anchorSize, align='bottom', origin='topleft') {

    let xOffset, yOffset, centerX, centerY;
    
    // Calculate xOffset based on origin
    if (origin === 'topleft' || origin === 'left' || origin === 'botleft') {
        xOffset = Math.abs(objSize.width - anchorSize.width) / 2;
    } else if (origin === 'top' || origin === 'center' || origin === 'bot') {
        xOffset = (Math.abs(objSize.width - anchorSize.width) / 2) - (objSize.width / 2);
    } else if (origin === 'topright' || origin === 'right' || origin === 'botright') {
        xOffset = (Math.abs(objSize.width - anchorSize.width) / 2) - objSize.width;
    }

    // Calculate yOffset based on origin
    if (origin === 'topleft' || origin === 'top' || origin === 'topright') {
        yOffset = (Math.abs(objSize.height - anchorSize.height) / 2) - (3 * objSize.height);
    } else if (origin === 'left' || origin === 'center' || origin === 'right') {
        yOffset = (Math.abs(objSize.height - anchorSize.height) / 2) - (2.5 * objSize.height);
    } else if (origin === 'botleft' || origin === 'bot' || origin === 'botright') {
        yOffset = (Math.abs(objSize.height - anchorSize.height) / 2) - (2 * objSize.height);
    }

    // Account for vertical alignment
    if (align === 'middle' || align === 'mid') {
        yOffset += (anchorSize.height / 2) + (objSize.height / 2);
    } else if (align === 'bottom' || align === 'bot') {
        yOffset += (anchorSize.height + objSize.height);
    }

    // Combine above calculations to produce final centered position
    if (objSize.width > anchorSize.width) {
        centerX = anchorPos.x - xOffset;
    } else {
        centerX = anchorPos.x + xOffset;
    }

    if (objSize.height > anchorSize.height) {
        centerY = anchorPos.y - yOffset;
    } else {
        centerY = anchorPos.y + yOffset;
    }

    return { x: centerX, y: centerY };
};

