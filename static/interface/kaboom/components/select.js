/**
 * Custom Kaboom component to enable a graphical object to be selected
 * 
 * Holds control for basic selection as well as selections for connections
 */


import k from '../kaboom.js';

import { GameConfig } from '../../../shared/lookup.js';


var currSelectedComponent = null;

var srcSelectedComponent = null;
var destSelectedComponent = null;

// Controls for when a component is selected 
export const selectControls = {
    release: () => { 
        if (currSelectedComponent) {
            currSelectedComponent.unselected();
        } 
        currSelectedComponent = null; },
    current: () => currSelectedComponent,
    acquire: (context) => {
        selectControls.release();
        context.selected(GameConfig.get('selectShader'));
        currSelectedComponent = context; }
};

// Controls for when a component is selected with the INTENT of connecting
export const connectControls = {
    release: () => { 
        if (srcSelectedComponent) { srcSelectedComponent.unselected(); } 
        if (destSelectedComponent) { destSelectedComponent.unselected(); } 
        destSelectedComponent = null; 
        srcSelectedComponent = null; 
    },
    isValid: () => { return destSelectedComponent && srcSelectedComponent; },
    current: () => { return { src: srcSelectedComponent, dest: destSelectedComponent }; },
    acquire: (context) => {
        if (srcSelectedComponent) { srcSelectedComponent.unselected(); } 
        context.selected(GameConfig.get('connectingShader'));
        srcSelectedComponent = destSelectedComponent; 
        destSelectedComponent = context; }
};

export function select() { 
    return {
        require: [ 'pos', 'area' ],
        selected(shaderName)  { this.use(k.shader(shaderName)); },
        unselected() { this.unuse('shader'); },
    };
}


