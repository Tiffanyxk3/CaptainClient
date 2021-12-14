
/*
 * Utility object used to create a signal-slot relationship between two objects/functions
 * It enables an object to "broadcast" a function call even if it may be out of scope
 * by storing the listener functions.
 * 
 * A broadcasting object creates a `Broadcast()` object and then uses the `register()`
 * method to add functions to it's "broadcast". Meaning when the broadcasting object
 * calls `dispatch()` al of those registered listener functions will be executed 
 */


export function Broadcast() {
    this._bindings = [];

    // enforce dispatch to aways work on same context
    var self = this;
    this.dispatch = function(){
        Broadcast.prototype.dispatch.apply(self, arguments);
    };
}

Broadcast.prototype.register = function(listener, listenerContext) {
    var prevIndex = this._indexOfListener(listener, listenerContext),
        binding;

    if (prevIndex !== -1) {
        binding = this._bindings[prevIndex];
    } else {
        binding = new BroadcastBinding(this, listener, listenerContext);
        this._addBinding(binding);
    }
    return binding;
};

Broadcast.prototype.has = function(listener, context) {
    return this._indexOfListener(listener, context) !== -1;
};

Broadcast.prototype.remove = function(listener, context) {
    var i = this._indexOfListener(listener, context);
    if (i !== -1) {
        this._bindings[i]._destroy();
        this._bindings.splice(i, 1);
    }
    return listener;
};

Broadcast.prototype.removeAll = function() {
    var numBindings = this._bindings.length;
    while (numBindings--) {
        this._bindings[numBindings]._destroy();
    }
    this._bindings.length = 0;
};

Broadcast.prototype.dispatch = function(params) {
    var paramsArr = Array.prototype.slice.call(arguments),
        numBindings = this._bindings.length,
        bindings;

    if (!numBindings) {
        return;
    }
    
    bindings = this._bindings.slice(); // clone array in case add/remove items during dispatch

    // execute all callbacks until end of the list or until a callback returns false
    do { numBindings--; } while (bindings[numBindings] && bindings[numBindings].execute(paramsArr) !== false);
};

Broadcast.prototype._addBinding = function(binding) {
    var numBindings = this._bindings.length;
    do { --numBindings; } while (this._bindings[numBindings]);
    this._bindings.splice(numBindings + 1, 0, binding);
};

Broadcast.prototype._indexOfListener = function(listener, context) {
    var numBindings = this._bindings.length,
        curr;
    while (numBindings--) {
        curr = this._bindings[numBindings];
        if (curr._listener === listener && curr.context === context) {
            return numBindings;
        }
    }
    return -1;
};


export function BroadcastBinding(signal, listener, listenerContext) {
    this._listener = listener;
    this._signal = signal;
    this.context = listenerContext;
}

BroadcastBinding.prototype.execute = function(paramsArr) {
    var handlerReturn = this._listener.apply(this.context, paramsArr);
    return handlerReturn;
};

BroadcastBinding.prototype.getListener = function() {
    return this._listener;
};

BroadcastBinding.prototype.getSignal = function() {
    return this._signal;
};

BroadcastBinding.prototype._destroy = function() {
    delete this._signal;
    delete this._listener;
    delete this.context;
};

export default Broadcast;