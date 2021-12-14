/*
 * Stand-alone timer module. The actual object is private (not exported) to
 * other files and only the TimerControls are shared. This allows for safety and
 * integrity of the time value.
 * 
 * Along with basic play/pause/restart functions there is a concept of "listeners".
 * This is the way that other functions and objects can become aware of the timer.
 * A listener is simply a function that becomes linked as a callback for the timer
 * and will be executed at every time interval. The current implementation has
 * three types of listeners:
 *  1. BASE_INTERVAL: this callback will be executed at the initial interval length
 *                      that is set no matter what speedup is selected
 *  2. SPEEDUP_INTERVAL: this callback is executed with the current interval length
 *                      so when the timer is speedup, these listeners will be executed
 *                      at every interval
 *  3. TIMEOUT: this is a callback that will only be executed when the timer expires
 * 
 * These options or "enum" live inside of the `TimerControls` object and are
 * available as parameters to functions being registered as listeners
 */

import Broadcast from './broadcast.js';

const DFLT_INTERVAL = 1000; // in ms
const INIT_DURATION = 10; // # of intervals to execute
const MAX_SPEEDUP = 3; // multiplier of DFLT_INTERVAL

const RegistrationTypes = Object.freeze({
    BASE_INTERVAL: 'BASE',
    SPEEDUP_INTERVAL: 'SPEEDUP',
    TIME_ADJUSTEMENT: 'ADJUSTEMENT',
    TIMEOUT: 'TIMEOUT'
});

// Keep private/local
const Timer = {
    paused: false,
    running: false,

    _listeners: Object.assign({}, 
        ...Object.values(RegistrationTypes).map(x => ({ [x]: new Broadcast() }))),

    _defaultInterval: DFLT_INTERVAL,
    _currentInterval: DFLT_INTERVAL,
    
    _duration: INIT_DURATION,
    _time: INIT_DURATION,
    _speedup: 1,
    _timerFunc: null,

    init: function(duration, dfltInterval) { 
        if (Timer.running || Timer.paused) { Timer.stop(); };

        if (duration !== undefined) { Timer._duration = duration; Timer._time = duration; }
        if (dfltInterval !== undefined) { Timer._defaultInterval = dfltInterval; }
        Timer._speedup = 1;
    },

    start: function() {
        if (Timer.running) { return; }
        Timer.paused = false;
        Timer.running = true;
        Timer._timerFunc = setInterval(Timer._intervalCallback, Timer._currentInterval);
    },

    pause: function() {
        Timer.paused = true;
        Timer.running = false;
        Timer.stop();
    },

    stop: function() {
        if (!Timer._time) { return false; } // no time left on timer
        if (Timer._timerFunc) {
            clearInterval(Timer._timerFunc);
            delete Timer._timerFunc;
        }
        Timer.running = false;
        Timer.paused = false;

        // Not sure if we want these here. Essentially resets the speedup
        Timer._currentInterval = Timer._defaultInterval;
        Timer._speedup = 1; 

        return true;
    },

    restart: function(duration) {
        if (duration) { Timer._duration = duration; }
        Timer.stop();
        Timer._time = Timer._duration;

        Timer._listeners[RegistrationTypes.TIME_ADJUSTEMENT].dispatch(Timer._time, Timer._speedup)
    },

    reset: function() {
        Timer.stop();
        Timer._duration = INIT_DURATION;
        Timer._time = INIT_DURATION;
    },

    restore: function() { // REMOVES ALL LISTENERS
        Timer.reset();
        delete Timer._listeners;
        Timer._listeners = Object.assign({}, ...Object.values(RegistrationTypes).map(x => ({ [x]: new Broadcast() })));
    },

    append: function(time) {
        Timer.stop();
        Timer._time += Math.max(0, time);

        Timer._listeners[RegistrationTypes.TIME_ADJUSTEMENT].dispatch(Timer._time, Timer._speedup)
    },

    speedUp: function() {
        clearInterval(Timer._timerFunc);
        delete Timer._timerFunc;
        Timer._speedup = ((Timer._speedup % MAX_SPEEDUP) + 1);
        Timer._currentInterval = Math.ceil(Timer._defaultInterval / Timer._speedup);
        Timer._timerFunc = setInterval(Timer._intervalCallback, Timer._currentInterval);
    },

    remaining: () => { return Timer._time; },

    registerListener: function(listenerFunc, context, type=RegistrationTypes.BASE_INTERVAL) {
        
        // Ensure the type of interval being requested exists
        if (!Object.values(RegistrationTypes).includes(type)) { return; }
        
        // Prevent the same listener function to register for the same type twice
        if (Timer._listeners[type].has(listenerFunc, context)) { return; }
        return Timer._listeners[type].register(listenerFunc, context);

    },

    unregisterListener: function(listenerFunc, context, type=RegistrationTypes.BASE_INTERVAL) {
        // Ensure the type of interval being requested exists
        if (!Object.values(RegistrationTypes).includes(type)) { return; }
        return Timer._listeners[type].remove(listenerFunc, context);
    },

    // Alert all listeners of new data
    // NO TYPE CHECK (this will be called a lot and it may become inefficient. 
    //                  + it's meant to be a private function so type checks 
    //                  are done already by `registerListener()`)
    _intervalCallback: (() => {
        const callback = () => {

            if (--Timer._time < 0) {
                Timer.stop();
                Timer._listeners[RegistrationTypes.TIMEOUT].dispatch(Timer._time, Timer._speedup);
                return;
            }
            
            Timer._listeners[RegistrationTypes.SPEEDUP_INTERVAL].dispatch(Timer._time, Timer._speedup);

            if (Timer._time % Timer._speedup == 0) {
                Timer._listeners[RegistrationTypes.BASE_INTERVAL].dispatch(Timer._time, Timer._speedup);
            }
        };
        return callback;
    })()
};

export const TimerControls = {
    init: Timer.init,
    play: Timer.start,
    pause: Timer.pause,
    restart: Timer.restart,
    append: Timer.append,
    reset: Timer.reset,
    restore: Timer.restore,
    running: Timer.running,
    fastforward: Timer.speedUp,
    remaining: Timer.remaining,

    register: Timer.registerListener,
    unregister: Timer.unregisterListener,
    RegistrationTypes: RegistrationTypes
};

export default TimerControls;


/*
 * Stand-alone object to perform tests on the Timer (has ability to use
 *  keyboard input)
 * 
 * 
 * let tester = new TimerTester();
 * tester.init();
 * tester.testControls();
 */

function TimerTester () {

    function GameLogic() {
        this.processInterval = function(time, speedup) {
            console.log('Game Logic timestep ', time);
        };
    };

    function Interface() { this.name = "Interface"; };
    function Scene() { this.name = "Scene"; };
    function myObject() { this.name = "myObject"; };

    Interface.prototype.init = function() {

        this.gameLogic = new GameLogic();
    
        TimerControls.init(15);
        TimerControls.register(this.gameLogic.processInterval, this.gameLogic, TimerControls.RegistrationTypes.SPEEDUP_INTERVAL);
    
        TimerControls.register(this.gameOver, this, TimerControls.RegistrationTypes.TIMEOUT);
    
        var scene = new Scene();
        scene.init();
    };
    
    Interface.prototype.gameOver = function() {
        console.log("GAAAAMMMEEE OVER");
    };
    
    
    Scene.prototype.init = function() {
    
        this.obj = new myObject();
        this.obj.init();
    
        this.testObj = new Map([['Scene', 'init()']]);
    };
    
    myObject.prototype.init = function() {
        this.testObj = new Map([['myObject', 'init()']]);
    
        TimerControls.register(this.handleAnimation, this);
        TimerControls.register(this.handleClock, this, TimerControls.RegistrationTypes.SPEEDUP_INTERVAL);
    }
    
    myObject.prototype.handleClock = function(timestamp, speedup) {
        let time = Math.floor(timestamp / 60) 
                    + ":" + (timestamp % 60 < 10 ? ('0' + timestamp % 60) : timestamp % 60);
        console.log(`Clock time: ${time}`);
    };
    
    myObject.prototype.handleAnimation = function(timestamp, speedup) {
        console.log(`Animation timestep: ${timestamp} @ ${speedup}x`);
        if (timestamp % 10 == 0) {
            console.log('\n-- SPEEDUP --\n');
            TimerControls.fastforward();
        }
    };

    this.init = () => { this.interface = new Interface; this.interface.init(); }

    this.testControls = () => {
        const prompt = require('prompt');
        
        console.log('Actions:');
        var inputOptions = Object.keys(TimerControls);
        inputOptions.forEach((opt) => {
            console.log(opt);
        });
        console.log();
    
        prompt.start();
    
        prompt.get(['action'], function (err, result) {
            if (err) { return onErr(err); }
            console.log('Command-line input received:');
            console.log('  Action: ' + result.action);
            
            var input = result.action;
            if (inputOptions.includes(input)) {
                TimerControls[input]();
            }
        });
    
        var onErr = function(err) {
            console.log(err);
            return 1;
        };
    };
};


