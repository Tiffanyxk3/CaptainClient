/**
 * Holds a controller for manipulating components on the PlayField.
 * 
 * In charge of adding/removing INTERFACE components & connections
 * 
 * MAIN COMMUNICATION BETWEEN interface AND game logic.
 * Each function "directs" information to verify and create components/connections
 * within Interface and Game Logic
 */

import k from '../kaboom/kaboom.js';

import InterfaceComponent from '../kaboom/components/interfaceComponent.js';
import InterfaceConnection from '../kaboom/components/interfaceConnection.js';
import InterfaceRequest from '../kaboom/components/interfaceRequest.js';
import State from '../../shared/state.js';
import generateUUID from '../../utilities/uuid.js';

import { drag } from '../kaboom/components/drag.js';
import { select } from '../kaboom/components/select.js';
import { ConnectionDisplayParams } from '../kaboom/components/interfaceConnection.js';
import { ScaledComponentImage } from '../kaboom/graphicUtils.js';

// TODO: add captain_192.png to asset directory
function errorMessage(message) {
    k.layers([
        "error",
    ], "game")

    const recWidth = k.width() / 3.5;
    const recHeight = k.height() / 3.5;

    let rec = k.add([
        k.rect(recWidth, recHeight),
        k.layer("error"),
        k.outline(2),
        k.color(176, 182, 221),
        k.pos(recWidth * 1.75, recHeight * 1.75),
        k.origin("center"),
    ]);

    let error = k.add([
        k.text(message, { size: recHeight * 0.13, width: recWidth * 0.9 }),
        k.layer("error"),
        k.pos(recWidth * 1.75, recHeight * 1.6),
        k.origin("center"),
    ])

    const btnPos = k.vec2(k.width() / 2, k.height() / 1.7);

    let btn = k.add([
        k.rect(recWidth / 5.9, recHeight / 4.7),
        k.layer("error"),
        k.outline(2),
        k.color(207, 226, 243),
        k.pos(btnPos),
        k.origin("center"),
        k.area({ cursor: "pointer", }),
    ]);

    let back = k.add([
        k.text("Back", {
            size: recHeight * 0.1
        }),
        k.layer("error"),
        k.pos(btnPos),
        k.origin("center"),
    ]);

    btn.clicks(() => {
        k.destroy(rec);
        k.destroy(error);
        k.destroy(btn);
        k.destroy(back);
    });
}


const FieldControls = {
    // This stores the current level logic object (found in `shared/level.js`)
    // It's the key communication object between Interface --> Game Logic
    logicControls: null,

    loadLogic: (levelLogic) => FieldControls.logicControls = levelLogic,

    initStage: (addedClients, addedProcessors, addedEndpoints, playField) => {
        // Minimal safety checks... assumed to be OK because no user intervention here

        let addedComponents = {};
        let size = ScaledComponentImage();

        let baseParams = [
            k.area(),
            k.origin('center'),
            '_component', // used as a group identifier
            'selectable',
            select()
        ];

        const appendComponents = (currPos, spacers, existingIDs, newComponents, boundaryBox) => { 

            // First adjust all existing endpoint's positions
            let existingComponent, interfaceComponents;
            for (const componentID of existingIDs) {
                interfaceComponents = k.get(componentID);
                // Safety check
                if (interfaceComponents.length === 1) {
                    existingComponent = interfaceComponents[0];
                    existingComponent.pos = currPos;
                    currPos.add(spacers);
                }
            }
    
            // Then add the new stage's endpoints
            let newID, tags, kaboomParams, interfaceComponent;
            for (const component of newComponents) {
                tags = FieldControls.logicControls.componentSpecs(component.name).tags;
                if (!tags.includes('CLIENT')) {
                    tags.push('draggable');
                    tags.push(drag());
                }
                for (let i = 0; i < component.quantity; i++) {
                    newID = generateUUID();
                    tags.push(newID, component.name);
                    kaboomParams = [k.sprite(component.name, size), 
                                    k.pos(currPos), 
                                    InterfaceComponent(component.name, newID, tags)];

                    k.add(baseParams.concat(kaboomParams, tags));
                    addedComponents[newID] = component.name;
                    currPos.add(spacers);
                }
            }
        };

        let reducer = (acc,curr) => acc = acc + curr["quantity"];
        let numAddedClients = Object.values(addedClients).reduce(reducer, 0);
        let numAddedProcessors = Object.values(addedProcessors).reduce(reducer, 0);
        let numAddedEndPoints = Object.values(addedEndpoints).reduce(reducer, 0);

        let totalNumClients = numAddedClients + State.placedClientIDs.length;
        let totalNumProcessors = numAddedProcessors + State.placedProcessorIDs.length;
        let totalNumEndpoints = numAddedEndPoints + State.placedEndpointIDs.length;

        if (numAddedClients) {
            let clientSpace = playField.clientSpace.rect;
            let clientSpacer = k.vec2(0, clientSpace.height / (totalNumClients + 1));
            let initClientPos = k.vec2(...clientSpace.center);
            appendComponents(initClientPos, clientSpacer,
                            State.placedClientIDs, addedClients, clientSpace);
        }

        if (numAddedProcessors) {
            // Spread processors out in a line on the field
            let componentSpace = playField.componentSpace.rect;
            let processorXSpacer = componentSpace.width / (numAddedProcessors + 1);
            let processorYSpacer = 0;

            let processorSpacer = k.vec2(componentSpace.x + processorXSpacer, 
                                        componentSpace.y + componentSpace.height / 2);
            let initProcessorPos = k.vec2(...componentSpace.center);
    
            appendComponents(initProcessorPos, processorSpacer,
                            [], addedProcessors, componentSpace);
        }

        if (numAddedEndPoints) {
            // Spread endpoints out in a line on the field
            let endpointSpace = playField.endpointSpace.rect;
            let endpointXSpacer = 0;
            let endpointYSpacer = endpointSpace.height / (numAddedEndPoints + 1);

            let endpointSpacer = k.vec2(endpointSpace.x + endpointSpace.width / 2,
                                            endpointSpace.y + endpointYSpacer);
            let initEndpointPos = k.vec2(...endpointSpace.center);
            appendComponents(initEndpointPos, endpointSpacer,
                            State.placedEndpointIDs, addedEndpoints, endpointSpace);
        }

        // Store new data in Game Logic
        FieldControls.logicControls.initStage(addedComponents);
    },

    placeComponent: function(componentName, pos) { 

        // Safety check. Need logicControls to communicate with Game Logic
        if (FieldControls.logicControls === null) {
            console.debug('Attempted to add component but no game logic controller present.');
            errorMessage("Attempted to add component but no game logic controller present.");
            return;
        }

        let newID = generateUUID();
        let logicResponse = FieldControls.logicControls.addComponent(componentName, newID);

        if (!logicResponse.valid) {
            console.log(logicResponse.info);
            return;
        }

        let size = ScaledComponentImage();
        let tags = FieldControls.logicControls.componentSpecs(componentName).tags;
        let params = [
            k.sprite(componentName, { width: size.width, height: size.height }),
            k.pos(pos),
            k.area(),
            k.origin('center'),
            componentName, 
            newID,
            '_component', // used as a group identifier
            'selectable', 
            'deletable',
            'draggable',
            drag(),
            select(),
            InterfaceComponent(componentName, newID, tags)
        ];
        params.concat(tags)
        console.log(params)
        return k.add(params);
    },

    connect: function(srcComponent, destComponent) {

        // Safety check. Need logicControls to communicate with Game Logic
        if (FieldControls.logicControls === null) {
            console.debug('Attempted to connect components but no game logic controller present.');
            errorMessage("Attempted to connect components but no game logic controller present.");
            return;
        }
        if (!srcComponent || !destComponent) {
            console.debug('Attempted to connect components but either src or dest was missing.');
            errorMessage("Attempted to connect components but either src or dest was missing.");
            return;
        }

        let srcID = srcComponent.getID();
        let destID = destComponent.getID();

        let logicResponse = FieldControls.logicControls.addConnection(srcID, destID);
        
        if (!logicResponse.valid) {
            console.log(logicResponse.info);
            errorMessage(logicResponse.info);
            return;
        }

        let ang = srcComponent.pos.angle(destComponent.pos);
        let height = srcComponent.pos.dist(destComponent.pos);

        // FIXME: area() & rotate() don't work together, so can't click a connection 
        let baseParams = [
            k.rect(ConnectionDisplayParams.width, height),
            k.pos(srcComponent.pos),
            k.color(...ConnectionDisplayParams.backgroundColor),
            k.opacity(ConnectionDisplayParams.opacity),
            k.origin('top'),
            k.rotate(ang),
            // k.area()
        ];

        let tags = [srcID, destID, '_connection'];
        let properties = [InterfaceConnection(srcComponent, destComponent)];

        let rectDef = baseParams.concat(tags, properties);
        let r = k.add(rectDef);
        
        k.readd(srcComponent);
        k.readd(destComponent);
        return r;
    },

    removeComponent: function(component) {

        // Safety check. Need logicControls to communicate with Game Logic
        if (FieldControls.logicControls === null) {
            console.debug('Attempted to remove component but no game logic controller present.');
            errorMessage("Attempted to remove component but no game logic controller present.");
            return;
        }
        if (!component) {
            console.debug('Attempted to remove component but it was missing');
            errorMessage("Attempted to remove component but it was missing");
            return;
        }

        let componentName = component.getID();
        let componentID = component.getID();
        let logicResponse = FieldControls.logicControls.removeComponent(componentID);

        if (!logicResponse.valid) {
            console.log(logicResponse.info);
            errorMessage("Attempted to remove component but it was missing");
            return false;
        }
        
        let connections = k.get(componentID);
        for (const conn of connections) {
            k.destroy(conn);
        }
        k.destroy(component);
        return true;
    },

    disconnect: function(srcComponent, destComponent) {

        // Safety check. Need logicControls to communicate with Game Logic
        if (FieldControls.logicControls === null) {
            console.debug('Attempted to disconnect components but no game logic controller present.');
            errorMessage("Attempted to disconnect components but no game logic controller present.");
            return;
        }
        if (!srcComponent || !destComponent) {
            console.debug('Attempted to disconnect components but either src or dest was missing');
            errorMessage("Attempted to disconnect components but either src or dest was missing");
            return;
        }

        let srcID = srcComponent.getID();
        let destID = destComponent.getID();
        let logicResponse = FieldControls.logicControls.removeConnection(srcID, destID);

        if (!logicResponse.valid) {
            console.log(logicResponse.info);
            errorMessage(logicResponse.info);
            return false;
        }

        let connections = k.get(srcID);
        for (const conn of connections) {
            if (conn.dest() === destComponent) {
                k.destroy(conn);
            }
        }
        return true;
    },

    spawnRequest: function(request, good) { 
        let goodRequestParams = [
            k.sprite("capn"),
            k.pos(request.src.pos),
            k.scale(0.20),
            k.area(),
            k.color(0, 255, 0),
            k.health(10),
            request.id,
            request.state,
            k.state("intransit", ["intransit", "processing", "blocked"]),
            'request'
        ]
        
        let badRequestParams = [
            k.sprite("capn"),
            k.pos(request.src.pos),
            k.scale(0.15),
            k.area(),
            k.color(255, 0, 0),
            k.health(5),
            request.id,
            request.state,
            k.state("blocked", ["intransit", "processing", "blocked"]),
            'request'
        ]
        
        let goodReqDef = goodRequestParams.concat(request);
        let badReqDef = badRequestParams.concat(request);
        let drawReq = k.add(goodReqDef);
        console.log(good);
        if (good == false) {
            drawReq = k.add(badReqDef);
            console.log("bad req drawed");         
        }         

    },

    moveRequest: function(request) {
        let requests = k.get('request'); 
        const speed = 120;
        const dir = k.vec2(request.dest.pos.sub(request.src.pos));
        //console.log(dir);
        for (const r of requests) { 
            r.onStateUpdate("intransit", () => {
                r.move(dir);
            })
    
            r.onStateUpdate("processing", () => {
                this.hideRequest(r);
            })
            
            r.onCollide('selectable', () => {
                r.enterState("processing");   
            })
        }
    },

    hideRequest: function(request) {
        k.destroy(request);
        k.wait(3, () => {
            this.spawnRequest(request, true);
        })
    }
};

export default FieldControls;
