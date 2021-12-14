/*
* The game state object. This object can be accessed by any file and will
* reflect the current game state without needing to be passed from object to
* object. A file only needs to `import State`
* 
* GameLogic will have access to the `StateMachine` object which is responsible
* for controlling the state and is the only way to adjust its values.
*/

import Broadcast from '../utilities/broadcast.js';

export var State = {
    register: (func, context) => { State._listeners.register(func, context); },
    stateChange: () => { State._listeners.dispatch(); }
    
    // THESE VALUES ACTUALLY EXIST but they aren't defined on initiliazation (see `reset()`)
    // coins: 0, // coins in “wallet”
    // expenses: 0, // accumulated usage cost
    // bandwidth: 0, // theoretical maximum throughput of current network
    // throughput: 0, // total throughput of the network
    // latency: 0, // total latency of the network
    // score: 0, // current accumulated score
    // prevScore: 0, // score acquired since beggining the current level
    // levelNumber: 1, // current level
    // stageNumber: 1, // current stage
    // networkType: "WIFI" // current type of network
    // goal: 0, // number of requests to complete in order to complete level
    // levelPassed: false, // tracks if the current level has been passed
    // stagePassed: false, // tracks if the current stage has been passed
    // gameWon: false, // tracks if the game has been won
    // gameLost: false, // tracks if the game has been lost
    // stageDescription: '' // descritpion of current stage
    // numCompletedReqs: 0, // number of requests that have fufilled mission
    // requestStates: [], // list requestState containing requestID (ex. blocked, inTransit, processing...)
    // placedClientIDs:  [], // list of client ids that are currently in network
    // placedProcessorIDs : [], // list of data processor ids that are currently in network
    // placedEndpointIDs: [], // list of endpoint ids that are currently in network
    // connections: [] // list of lists of length 2 in format of [sourceID, targetID]
};

// can adjust to only include pertinent information for interface and have
// additional object appended to `State` for GameLogic tracking

/** RESERVED FOR GAME LOGIC **/
export const StateMachine = {
    // functions to modify state from within `GameLogic`
    incrementCoins: (amount) => { State.coins += (amount || 1); State.stateChange(); },
    incrementExpenses: (amount) => { State.expenses += (amount || 1); State.stateChange(); },
    incrementBandwidth: (specs, amount) => { State.bandwidth += (amount || 1); State.stateChange(); },
    incrementScore: (amount) => { State.score += (amount || 1); State.stateChange(); },
    incrementCompletedReqs: (amount) => { State.numCompletedReqs += (amount || 1); State.stateChange(); },
    setRequestStates: (newStates) => { State.requestStates = newStates; State.stateChange(); },
    stageCompleted: () => { State.stagePassed = true; State.stateChange(); },
    levelCompleted: () => { State.levelPassed = true; State.stateChange(); },
    gameWon: () => { State.gameWon = true; State.stateChange(); },
    gameLost: () => { State.gameLost = true; State.stateChange(); },

    processInterval: (reqStates) => {
        State.score += 1;
        State.coins -= State.expenses;
        StateMachine.setRequestStates(reqStates);
        // State.stateChange();
    },

    levelChange: function(levelNumber, newSpecs) {
        State.coins = newSpecs.budget;
        State.levelNumber = levelNumber;
        State.prevScore = State.score;
        State.stageNumber = 1;
        State.expenses = 0;
        State.bandwidth = 0;
        State.latency = 0;
        State.throughput = 0;
        State.stageDescription = newSpecs.description;
        // Reset the placed components
        State.placedClientIDs = [];
        State.placedProcessorIDs = [];
        State.placedEndpointIDs = [];
        State.requestStates = [];
        State.numCompletedReqs = 0;
        State.stateChange();
    },
    
    stageChange: function(stageNumber, newSpecs) {
        State.stagePassed = false;
        State.levelPassed = false;
        State.coins += newSpecs.coinReward;
        State.goalCount = newSpecs.goalCount;
        State.stageNumber = stageNumber;
        State.networkType = newSpecs.networkType;
        State.stageDescription = newSpecs.description;
        State.requestStates = [];
        State.numCompletedReqs = 0;
        State.stateChange();
    },

    placedComponent: function(component, initial=false) {
        if (component.isClient) {
            State.placedClientIDs.push(component.id);
            State.throughput += (component.transmitRate);
        } else if (component.isEndpoint) {
            State.placedEndpointIDs.push(component.id);
        } else {
            State.placedProcessorIDs.push(component.id);
            State.throughput += component.throughput;
            State.latency += component.latency;
        }
        State.expenses += (component.usageCost || 0);
        State.bandwidth = Math.round(State.throughput / State.latency);
        if (!initial) {
            State.stateChange();
        }
    },
    
    removedComponent: function(component) {
        let index, arr;
        if (component.isClient) {
            index = State.placedClientIDs.indexOf(component.id);
            arr = State.placedClientIDs;
            State.throughput -= (component.transmitRate);
        } else if (component.isEndpoint) {
            index = State.placedEndpointIDs.indexOf(component.id);
            arr = State.placedEndpointIDs;
        } else {
            index = State.placedProcessorIDs.indexOf(component.id);
            arr = State.placedProcessorIDs;
            State.throughput -= component.throughput;
            State.latency -= component.latency;
        }
        if (index > -1) {
            arr.splice(index, 1);
        }
        State.expenses -= component.usageCost;
        State.bandwidth = Math.round(State.throughput / State.latency);
        State.stateChange();
    },

    addedConnection: function(connection) {
        State.connections.push([connection.src.id, connection.des.id]);
        State.latency += connection.latency;
        State.bandwidth = Math.round(State.throughput / State.latency);
        State.stateChange();
    },

    removedConnection: function(connection) {
        let c;
        for (let i = 0; i < State.connections.length; i++) {
            c = State.connections[i];
            if (c[0] === connection.src.id && c[1] === connection.des.id) {
                State.connections.splice(i, 1);
                State.latency -= connection.latency;
                State.bandwidth = Math.round(State.throughput / State.latency);
                State.stateChange();
                return;
            }
        }
        State.stateChange();
    },
    
    reset: function() {
        Object.defineProperties(State, {
            coins: {
                value: 0,
                writable: true
            },
            expenses: {
                value: 0,
                writable: true
            },
            bandwidth: {
                value: 0,
                writable: true
            },
            throughput: {
                value: 0,
                writable: true
            },
            latency: {
                value: 0,
                writable: true
            },
            score: {
                value: 0,
                writable: true
            },
            prevScore: {
                value: 0,
                writable: true
            },
            levelNumber: {
                value: 1,
                writable: true
            },
            stageNumber: {
                value: 1,
                writable: true
            },
            goal: {
                value: 0,
                writable: true
            },
            levelPassed: {
                value: false,
                writable: true
            },
            stagePassed: {
                value: false,
                writable: true
            },
            gameWon: {
                value: false,
                writable: true
            },
            gameLost: {
                value: false,
                writable: true
            },
            stageDescription: {
                valud: '',
                writable: true
            },
            numCompletedReqs: {
                value: 0,
                writable: true
            },
            requestStates: {
                value: new Map(),
                writable: true
            },
            placedClientIDs: {
                value: [],
                writable: true
            },
            placedProcessorIDs: {
                value: [],
                writable: true
            },
            placedEndpointIDs: {
                value: [],
                writable: true
            },
            connections: {
                value: [],
                writable: true
            },
            _listeners: {
                value: new Broadcast(),
                writable: false
            }
        });
        State.stateChange();
    }
};

export default State;
