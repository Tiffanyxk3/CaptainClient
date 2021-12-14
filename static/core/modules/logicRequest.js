
/*
 * TODO: Need to remember path from src --> dest.
 * - After reaching destination, the request will follow the EXACT SAME path it
 *      took to get to that destination.
 * - Returning requests don't have to go through processing time
 * - Returning requests have own queue in each processor that takes priority
 * - Want to have individual connection types/latencies
 * 
 * - Every request has a TOTAL LIFESPAN
 * - Keep track of requests
 * 
 * - Send Eli notes for levelView.update() and logicRequest.RequestStateMachine
 * - Add SPAWN state & isResponse attribute
 * - Seperate spawn and transmit into two steps from client
 */

import generateUUID from '../../utilities/uuid.js';

const TIMEOUT = 20;

export var LogicRequest = (source, destID) => {

    var req = {
        id: generateUUID(),
        age: 0,
        traveledPath: [],
        isResponse: false,

        currComponent: source,
        nextComponent: undefined,
        prevConnection: undefined,
        currConnection: undefined,

        destID: destID,

        _stateChange: function() { 
            this.processing = false;
            this.blocked = false;
            this.inTransit = false;
            this.currProcessTime = 0;
        },

        setCompleted: function() {
            this._stateChange();
            this.completed = true;
        },

        setResponse: function() {
            this.isResponse = true;
        },

        // Called by a component when it's accepted THIS request into its queue
        pendingProcessing: function(component) {
            this.currComponent = component;
            this.nextComponent = null;
            this.prevConnection = this.currConnection;
            this.currConnection = null;

            this.traveledPath.push(component);

            this._stateChange();
            this.blocked = true;
        },

        // Called by a component when it's started to process THIS request
        beginProcessing: function() {
            this._stateChange();
            this.processing = true;
        },

        // Called by a component when it's done processing THIS request (gives it a new connection and component)
        transmit: function(connection) { 
            this.prevConnection = this.currConnection;
            this.currConnection = connection;
            // this.currComponent = null;

            this.nextComponent = connection.des;

            this._stateChange();
            this.inTransit = true;
        },

        // Called every timestep
        processTimestep: function() {
            this.age++;
            this.currProcessTime++;
            if (this.blocked) {
                if (this.currProcessTime > TIMEOUT) {
                    console.log("I timed out!");
                    this.timedout = true;
                    return RequestStateFactory('TIMEDOUT', this);
                } else {
                    return RequestStateFactory('BLOCKED', this);
                }
            }

            else if (this.processing) {
                return RequestStateFactory('PROCESSING', this);
            }

            else if (this.inTransit) {
                if (this.currProcessTime >= TIMEOUT) {
                    console.log("I timed out!");
                    this.timedout = true;
                    return RequestStateFactory('TIMEDOUT', this);
                } else {
                    return RequestStateFactory('INTRANSIT', this);
                }
            }

            else if (this.completed) {
                return RequestStateFactory('COMPLETED', this);
            }

            // Request died (most likely because there wasn't a connection to it's destination)
            else {
                this.killed = true;
                return RequestStateFactory('KILLED', this);
            }
        }
    }
    return req;
};

export default LogicRequest;


const RequestStateFactory = (stateName, req) => {
    var state;
    switch(stateName) {
        case 'SPAWNED':
            state = {
                name: 'SPAWNED',
                currID: req.currComponent.id
            };
            break;
        case 'BLOCKED':
            state = {
                name: 'BLOCKED',
                percent: req.currProcessTime / TIMEOUT,
                currID: req.currComponent.id,
                isResponse: req.isResponse
            };
            break;
        case 'PROCESSING':
            state = {
                name: 'PROCESSING',
                percent: req.currProcessTime / req.currComponent.throughput,
                currID: req.currComponent.id,
                isResponse: req.isResponse
            };
            break;
        case 'INTRANSIT':
            state = {
                name: 'INTRANSIT',
                percent: req.currProcessTime / req.currConnection.latency,
                currID: req.currComponent.id,
                nextID: req.nextComponent.id,
                isResponse: req.isResponse
            };
            break;
        case 'TIMEDOUT':
            state = {
                name: 'TIMEDOUT'
            };
            break;
        case 'KILLED':
            state = {
                name: 'KILLED'
            }
            break;
        case 'COMPLETED':
            state = {
                name: 'COMPLETED'
            };
            break;
    }
    state['age'] = req.age;
    state['id'] = req.id;
    return state;
};