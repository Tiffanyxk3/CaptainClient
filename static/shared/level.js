
/**
 * Shared between both Game Logic and Interface
 * Game Logic builds the object --> Interface reads the data
 */
export const Level = (levelNumber, levelSpecs, contextFuncs) => {
    var level = {
        number: levelNumber,
        levelSpecs: levelSpecs, // only set when object is created. Defined in `config/levels.js`
        // stageSpecs: stageSpecs,
        /**
         * Remain constant. Set by line 19, Object.assign(). Provided by `core/index.js` --> GameLogic
         * THESE FUNCTIONS EXIST. This comment is purely for reference because they
         * are not defined in this file
         * 
         * componentSpecs(componentName): core.componentSpecs
         * 
         * initStage(componets): core.initStage
         * 
         * addComponent(componentName, componentID): core.addComponent
         * 
         * removeComponent(componentID): core.removeComponent
         * 
         * connect(srcID, destID): core.addConnection
         * 
         * disconnect(srcID, destID): core.removeConnection
         * 
         * processInterval(timestamp, speedup): core.processInterval 
         * 
         * stageCleared(): 
         */
    };
    Object.assign(level, contextFuncs);
    return Object.freeze(level); // prevent unauthorized changes
};

export default Level;
