/*
 * Meant to be a collection of convenience functions for accessing objects/values
 * stored in config or assets. Essentially provides functionality to retrieve
 * a specific value or cumulative ones from `components.js`, `levels.js`, and
 * `assets/`
 * 
 * This may add unnecessary complications...
 */

import componentDefs from "../config/components.js";
import levelDefs from "../config/levels.js";
import { connectionTypes, networkTypes } from '../config/connections.js';
import gameConfig from "../config/config.js";
import assetDirectory from "../assets/assetDirectory.js";


export const AssetConfig = {
    get: (name, rootPath) => (rootPath || '') + lookup(assetDirectory, name),
    entries: (rootPath) => {
        var values = {};
        entries(assetDirectory, 0, values);
        return Object.fromEntries(Object.entries(values).map(a => { 
            return [a[0], (rootPath || '') + a[1]]; }));
    }
};

export const ComponentConfig = {
    get: (name) => Object.assign({}, lookup(componentDefs, name)),
    images: (rootPath) => {
        var values = {};
        entries(componentDefs, 1, values);
        return Object.entries(values).reduce((acc, e) => {
            if (e[1].hasOwnProperty('img')) { 
                acc[e[0]] = (rootPath || '') + e[1].img;
            }
            return acc;
        }, {});
    },
    entries: () => Object.assign({}, componentDefs)
};

export const LevelConfig = {
    get: (level, stage) => { 
        if (!stage) { return Object.assign({}, levelDefs[level]); }
        return Object.assign({}, levelDefs[level].stages[stage]);
    },
    entries: () => Object.assign({}, levelDefs)
};

export const GameConfig = {
    get: (key) => gameConfig[key],
    entries: () => Object.assign({}, gameConfig)
}

export const ConnectionConfig = {
    get: (tag1, tag2) => connectionTypes[tag1] ? connectionTypes[tag1][tag2] : {},
    compatabilities: (tag) => connectionTypes[tag]
};

export const NetworkTypeConfig = {
    get: (name) => networkTypes[name],
    entries: () => Object.assign({}, networkTypes)
};



/************** Base recursive algorithms ***************/

const lookup = (object, target) => {
    if (object.hasOwnProperty(target)) { return object[target]; }
    
    for (const [key, value] of Object.entries(object)) {
        if(typeof value == "object"){
            var o = lookup(value, target);
            if(o != null)
            return o;
        }
    }
};


const entries = (object, level, acc) => {
    if (level < 0) { return; }

    for (const [key, value] of Object.entries(object)) {
        if(level != 0 && typeof value == "object"){
            entries(value, level - 1, acc);
        } else {
            acc[key] = value;
        }
    }
};