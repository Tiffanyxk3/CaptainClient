/*
* Game index.js
*
* Simple implementation of a GameLogic object. Does not include methods like
* `resetGame`, `loseGame`, `winGame`. It also does not do any verification
* of user's actions on the Game level
* 
* Currently can receive timesteps and pass control functions in a level
* object to the interface
*/

import Level from "../shared/level.js";
import Network from "./modules/network.js";
import LogicConnection from './modules/logicConnection.js';
import getTransmitFunction from '../config/transmission.js';
import { ComponentConfig, LevelConfig, GameConfig, NetworkTypeConfig } from "../shared/lookup.js";
import { StateMachine, State } from "../shared/state.js";
import { LogicClient, LogicProcessor, LogicEndpoint } from './modules/logicMembers.js';


const REFUND_RATE = GameConfig.get('refundRate'); // when deleted a component, only get % money back

export function GameLogic() {
    StateMachine.reset(); // reset the game state if previously in progress
    this.network = new Network(); // storage module
};

GameLogic.prototype.getLevel = function(levelNumber) {
    let levelSpecs = LevelConfig.get(levelNumber);
    if (!Object.keys(levelSpecs).length) {
        console.log("GAME WON!");
        return;
    }
    
    let initStageSpecs = this.getStage(1, levelNumber);
    if (!initStageSpecs) {
        console.log("No stage 1 data for level", levelNumber);
        return;
    }

    let { stages, ...baseSpecs } = levelSpecs;
    let cumulativeSpecs = Object.assign(baseSpecs, initStageSpecs);
    StateMachine.levelChange(levelNumber, cumulativeSpecs);
    
    // Remove all existing components (& connections)
    this.network.clearComponents();
    
    const controlFuncs = {
        componentSpecs: componentSpecs,
        initStage: this.initStage.bind(this),
        addComponent: this.addComponent.bind(this),
        removeComponent: this.removeComponent.bind(this),
        addConnection: this.addConnection.bind(this),
        removeConnection: this.removeConnection.bind(this),
        processInterval: this.processInterval.bind(this)
    };
    
    return Level(levelNumber, cumulativeSpecs, controlFuncs);
};


GameLogic.prototype.getStage = function(stageNumber, levelNumber) {
    levelNumber = levelNumber || State.levelNumber;
    let stageSpecs = LevelConfig.get(levelNumber, stageNumber);
    
    if (Object.keys(stageSpecs).length) { 
        this.currentGoals = stageSpecs.goals.reduce((acc, x) => { acc[x.mission] = x.quantity; return acc; }, {});
        let goalCount = Object.values(stageSpecs.goals).reduce((acc, x) => acc = acc + x.quantity, 0);

        stageSpecs['goalCount'] = goalCount;
        StateMachine.stageChange(stageNumber, stageSpecs);
        
        return stageSpecs;
    }
    // No more stages for this level
};

// Expect object of componentIDs --> componentNames
GameLogic.prototype.initStage = function(components) {
    let newComponent;
    for (const [id, name] of Object.entries(components)) {
        newComponent = this._addComponent(name, id);

        this.network.networkAddComponent(newComponent);
        StateMachine.placedComponent(newComponent, true);
    }
    
    // Reset all connections and load new network
    let currentConnections = this.network._getConnections();
    let newLatency = NetworkTypeConfig.get(State.networkType).latency;
    for (let connection of currentConnections) {
        connection.softReset();
        connection.setLatency(newLatency);
    }

    // Reset all components
    let currentComponents = this.network._getComponents();
    currentComponents.forEach(x => x.softReset());
    
    // Assign goals and missions to the initial components
    this._assignGoals(currentComponents);

    State.stateChange();
};

// Meant as private method to allow initial values to be placed without safety checks
GameLogic.prototype._addComponent = function(componentName, componentID) {
    let specs = componentSpecs(componentName);
    let transmitFunc = getTransmitFunction([specs.transmission], this.network.adjList).bind(this);
    if (specs.isClient) {
        var newComponent = new LogicClient(componentID, componentName, specs, transmitFunc);
    }
    else if (specs.isEndpoint) {
        var newComponent = new LogicEndpoint(componentID, componentName, specs, transmitFunc);
    }
    else {
        var newComponent = new LogicProcessor(componentID, componentName, specs, transmitFunc);
    }
    this._assignGoals(this.network._getComponents());
    return newComponent;
};

// Private method to assign the stage's goals (and subsequent missions) to all components
GameLogic.prototype._assignGoals = function(currentComponents) {
    // Assign goals and missions...
    let component, currName;
    let goalNames = Object.keys(this.currentGoals);
    currentComponents = currentComponents || this.network._getComponents();

    for (let i = 0; i < goalNames.length; i++) {
        currName = goalNames[i];
        component = currentComponents.find(x => { return !x.goal && x.name === currName; });
        if (component) {
            component.setGoal(this.currentGoals[currName]);
            this.currentGoals[component.id] = { 
                name: currName, 
                quantity: this.currentGoals[currName], 
                completed: false
            };
            delete this.currentGoals[currName];
        }
    }

    let missions = Object.keys(this.currentGoals);
    for (let c of currentComponents) {
        if (c.isClient) { c.setMissions(missions); } // assume only clients can create missions
    }
};


GameLogic.prototype.addComponent = function(componentName, componentID) {
    
    // Maybe do some sort of check to make sure the user's expenses aren't too high?
    let newComponent = this._addComponent(componentName, componentID);
    let networkResponse = this.network.networkAddComponent(newComponent);
    if (networkResponse.valid) {
        StateMachine.placedComponent(newComponent);
    }
    return networkResponse;
};


GameLogic.prototype.upgradeComponent = function(componentID) {
    let component = this.network.getComponent(componentID);
    if (State.coins < component.cost) {
        return {
            valid: false,
            info: 'Insufficient funds'
        };
    }
    
    let prevExpense = component.usageCost;
    component.upgrade();
    StateMachine.incrementExpenses(component.usageCost - prevExpense);
    
    return { 
        valid: true,
        info: 'Successfully upgraded to level ' + component.level
    }
};


GameLogic.prototype.removeComponent = function(componentID) {
    let component = this.network.getComponent(componentID);

    if (!component) {
        return {
            valid: false,
            info: 'Could not find component in network'
        };
    }

    let networkResponse = this.network.networkRemovedComponent(component);

    if (networkResponse.valid) {
        StateMachine.removedComponent(component);

        // Get refund for upgrade cost?
        if (component.level > 1) {
            let refund = Math.ceil(component.cost * REFUND_RATE);
            StateMachine.incrementCoins(refund);
        }
    }
    return networkResponse;
};


GameLogic.prototype.addConnection = function(src_id, dest_id) {
    // verify connection at the game level
    let srcComponent = this.network.getComponent(src_id);
    let destComponent = this.network.getComponent(dest_id);
    
    let latency = NetworkTypeConfig.get(State.networkType).latency;
    let connection = new LogicConnection(srcComponent, destComponent, latency);
    
    let networkResponse = this.network.networkAddConnection(connection);
    
    if (networkResponse.valid) {
        StateMachine.addedConnection(connection);
    }
    return networkResponse;
};


GameLogic.prototype.removeConnection = function(src_id, dest_id) {
    let networkResponse = this.network.disconnect(src_id, dest_id);
    
    if (networkResponse.valid) {
        StateMachine.removedConnection(src_id, dest_id);
    }
    return networkResponse;
};


GameLogic.prototype.processInterval = function(timestamp, speedup) {

    let aliveRequests = [];
    // Loop over all components to process their requests and collect them
    let components = this.network._getComponents();
    let requests, c;
    for (let i = 0; i < components.length; i++) {
        c = components[i];
        requests = c.processTimestep();
        
        if (c.goalMet) {
            this.currentGoals[c.id].completed = true;
            if (Object.values(this.currentGoals).every(e => e.completed)) {
                StateMachine.stageCompleted();
                return []; // break as soon as all goals have been completed
            }
        }
        aliveRequests.push(...requests);
    }
    
    // Loop over all connections to process their requests and collect them
    let connections = this.network._getConnections();
    for (let i = 0; i < connections.length; i++) {
        requests = connections[i].processTimestep();
        aliveRequests.push(...requests);
    }
    
    // Loop over all collected requests to update their states
    let reqStates = []
    let state, req;
    for (let i = 0; i < aliveRequests.length; i++) {
        req = aliveRequests[i];
        state = req.processTimestep();
        reqStates.push(state);
    }
    
    // An object of request IDs --> request states
    // console.log(`Core - set request states:`, reqStates);
    StateMachine.processInterval(reqStates);
    return reqStates;
};



const componentSpecs = (componentName) => {
    let specs = ComponentConfig.get(componentName);
    specs['isClient'] = specs.tags.includes('CLIENT');
    specs['isEndpoint'] = specs.tags.includes('ENDPOINT');
    return Object.assign({}, specs);
};


export default GameLogic;