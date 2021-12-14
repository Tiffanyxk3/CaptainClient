/*
* Interface index.js
*
* Main entry point into this module. Responsible for loading all of the sprites
* used throughout the game
* Still trying to figure out what belongs here. Biggest shift was offloading
* scene construction to `/scenes/index.js`
* The intent is for this to be a "governor"/"driver" of sorts that is responsible
* for directing information at the top-most level
*/


import k from './kaboom/kaboom.js';
import GameLogic from '../core/core.js';
import State from '../../shared/state.js';
import { AssetConfig, ComponentConfig, GameConfig } from '../shared/lookup.js'
import TimerControls from '../utilities/timer.js';

import LevelView from './scenes/levelView.js';
import GameOver from './scenes/gameOver.js';
import Leaderboard from './scenes/leaderboard.js';
import Settings from './scenes/settings.js';
import Home from './scenes/home.js';

import { getColor } from '../config/settings.js';

const TESTING = false;
const sceneTracker = {};

export default function Interface() { };


// Load all necessary Kaboom components and other setup
Interface.prototype.init = function() {

    const REL_PATH_TO_ROOT = '../';

    k.load(new Promise((resolve, reject) => {
        
        // Load all ui icons, background images, etc.
        for (const [name, loc] of Object.entries(AssetConfig.entries(REL_PATH_TO_ROOT))) {
            k.loadSprite(name, loc);
        }
    
        // Load all component images
        for (const [name, loc] of Object.entries(ComponentConfig.images(REL_PATH_TO_ROOT))) {
            k.loadSprite(name, loc);
        }

        // Load all custom shaders
        for (const [name, def] of Object.entries(GameConfig.get('shaders'))) {
            k.loadShader(name, ...def, false);
        }

        resolve('ok');
    }));

    // let c = k.vec2(10, 10);
    // let x = k.vec2(1, 0);
    // let ang = Math.atan2(c.x, c.y) * 180 / Math.PI;
    // console.log(ang);
    // console.log(c.angle(x));


    // Build game logic object
    this.gameLogic = new GameLogic();

    // Load all game scenes
    this.loadScenes();

    // Connect all event signals
    this.registerEvents();

    // Go to the home screen
    SceneControls.goHome();
};


Interface.prototype.loadScenes = function() {
    // Build and store Home scene
    let home = new Home(() => { this.goLevel(1); });
    sceneTracker['home'] = home;
    k.scene('home', (color)=>{
      home.scene(color)
    });

    // Build and store Leaderboard scene
    let leaderboard = new Leaderboard();
    sceneTracker['leaderboard'] = leaderboard;
    k.scene('leaderboard', (color)=>{
      leaderboard.scene.bind(this)(color)
    });

    // Build and store Settings scene
    let settings = new Settings();
    sceneTracker['settings'] = settings;
    k.scene('settings', (color)=>{
      settings.scene(color)
    });

    // Build and store Level scene
    let level = new LevelView();
    sceneTracker['level'] = level;
    k.scene('level', (color)=>{level.scene(color)});

    // Build and store GameOver scene
    let gameover = new GameOver();
    sceneTracker['gameover'] = gameover;
    k.scene('gameover', (color)=>{
      gameover.scene.bind(this)(color)
    });
};


Interface.prototype.registerEvents = function() {
    
    if (TESTING) {
        let totalLevels = 6; // HARD CODED (just for testing)
        const stageFuncs = {
            up: () => this.handleStageClear(),
            down: () => sceneTracker.level.showPopup()
        };
        const lvlFuncs = {
            up: () => { if (State.levelNumber < totalLevels) { this.goLevel(State.levelNumber+1); } },
            down: () => { if (State.levelNumber > 1) { this.goLevel(State.levelNumber-1); } }
        };
        sceneTracker.level.test(stageFuncs, lvlFuncs);
        k.scene('level', sceneTracker.level.scene);
        console.log('Initiated level testing...');

        var printTime = (timestamp, speedup) => console.log(`-- ${timestamp}s --`);
        TimerControls.register(printTime, this, TimerControls.RegistrationTypes.SPEEDUP_INTERVAL);
    }

    // Connect game logic's timestep callback function to the timer (Game Logic's callback)
    TimerControls.register(this.gameLogic.processInterval, this.gameLogic, 
        TimerControls.RegistrationTypes.SPEEDUP_INTERVAL);

    // Connect the level scene to the timer
    TimerControls.register(sceneTracker.level.update, sceneTracker.level); // default interval type

    // Connect gameover to timer (using a wrapper function to indiciate game lost)
    var timeExpired = () => SceneControls.goGameover(false);
    TimerControls.register(timeExpired, SceneControls, TimerControls.RegistrationTypes.TIMEOUT);

    // Connect gameover to coins/budget
    var bankrupt = () => { if (State.coins <= 0) { SceneControls.goGameover(false); } };
    State.register(bankrupt, SceneControls);

    // Connect the level scene to the game state
    var stagePassed = () => { if (State.stagePassed) { this.handleStageClear(); }};
    State.register(stagePassed, this);

    
};

// Function to load and "go to" a level
Interface.prototype.goLevel = function(levelNum) {
    TimerControls.pause() // Ensure timer is stopped first
    console.log("LEVEL CLEARED!");

    // Request a new level object from game logic
    levelNum = levelNum || State.levelNumber + 1;
    this.currentLvlLogic = this.gameLogic.getLevel(levelNum);

    if (!this.currentLvlLogic) {
        // GAME WON
        SceneControls.goGameover(true);
        return;
    }
    
    // Load current level into Level scene object
    sceneTracker.level.load(this.currentLvlLogic);
    // sceneTracker.level.initStage(nextStageSpecs);

    // Setup timer for this level
    let timeLimit = this.currentLvlLogic.levelSpecs.timeLimit;
    TimerControls.init(timeLimit);

    // Go to the level scene
    k.go('level', getColor());
};

// Handler function called when a stage has been completed
Interface.prototype.handleStageClear = function() {
    let nextStageSpecs = this.gameLogic.getStage(State.stageNumber + 1);

    if (nextStageSpecs) {
        // Move to next stage
        sceneTracker.level.initStage(nextStageSpecs);
    } else {
        // Completed stage, time for a new level :)
        this.goLevel(State.levelNumber + 1);
    }
};

// Set of controls to move between scenes. Independent of THIS instance
export const SceneControls = {
    goHome: () => { TimerControls.reset(); k.go('home', getColor()); },
    goLeaderboard: () => k.go('leaderboard', getColor()),
    goSettings: () => k.go('settings', getColor()),
    goGameover: (win) => {
        TimerControls.restore(); // completely wipe the timer
        sceneTracker.gameover.init(win);
        k.go('gameover', getColor());
    }
};
