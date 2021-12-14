/*
* Implementation of a component object (either a client or processor)
*
* Each component has an idea generated by the interface and passed down to
* the logic level. They also are created with the specs defined in the
* 'config/components.js' file. An individual component object keeps track
* of all of its queued and processing requests. It also has a "forwarding
* function" which defines how requests should be emitted from the component.
* 
* Has no knowledge of position, image display, etc. Only knows the number
* of input/output connections and relevant number of requests.
*/

// *** BASE ClASS *** //

export default function LogicComponent(id, name, specs, transmission) {
    this.id = id;
    this.name = name;
    this.level = 0; // temp initial upgrade level
    
    this.connectedInputs = 0;
    this.connectedOutputs = 0;
    this.numTransmitted = 0;
    this.numReceived = 0;
    
    this.incomingRequestQueue = []; // all of these requests are blocked
    this.returningRequestQueue = []; // all of the requests that are returning as responses
    
    this.transmitFunc = transmission; // will provide the next component for a request given it's destination
    
    Object.assign(this, specs);
    this.upgrade();
    
    /* HAS PROPERTIES FROM CONFIG FILE AS WELL. ACQUIRED BY `Object.assign(this, specs)`: */
}


LogicComponent.prototype.setGoal = function(goal) {
    this.goal = goal; // goal number of requests to process
    this.goalMet = false;
};

LogicComponent.prototype.setTransmitFunc = function(transmitFunc) {
    this.transmitFunc = transmitFunc;
};

LogicComponent.prototype.upgrade = function() {
    if (this.hasOwnProperty('upgrades')) { // would be acquired by config file
        this.level += 1;
        let upgradeSpecs = this.upgrades[this.level];
        Object.assign(this, upgradeSpecs);
    }
};

/** Game IO control **/
LogicComponent.prototype.addInput = function() {
    if (this.hasAvailableInput()) {
        this.connectedInputs++;
        return true;
    }
    return false;
};
LogicComponent.prototype.addOutput = function() {
    if (this.hasAvailableOutput()) {
        this.connectedOutputs++;
        return true;
    }
    return false;
};

LogicComponent.prototype.removeInput = function() {
    this.connectedInputs = Math.max(this.connectedInputs - 1, 0);
};
LogicComponent.prototype.removeOutput = function() {
    this.connectedOutputs = Math.max(this.connectedOutputs - 1, 0);
};

LogicComponent.prototype.hasAvailableInput = function() {
    return this.connectedInputs < this.maxInputs;
};
LogicComponent.prototype.hasAvailableOutput = function() {
    return this.connectedOutputs < this.maxOutputs;
};

/** Request management **/
LogicComponent.prototype.enqueue = function (request) {
    request.pendingProcessing(this);
    this.incomingRequestQueue.push(request);
}
LogicComponent.prototype.getAvailability = function() {
    return this.requestCapacity - this.containedRequests;
};
LogicComponent.prototype.isAvailable = function() {
    return this.numProcessing < this.requestCapacity;
};

/** Component control **/
LogicComponent.prototype.softReset = function() {
    this.numTransmitted = 0;
    this.numReceived = 0;
    this.goal = null;
    this.goalMet = false;
    this.incomingRequestQueue = [];
};
LogicComponent.prototype.hardReset = function() {
    this.softReset();
    this.connectedInputs = 0;
    this.connectedOutputs = 0;
    this.level = 0;
    this.upgrade();
};

