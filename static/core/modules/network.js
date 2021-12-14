/*
 * Graph data structure
 */

import LogicComponent from './logicComponent.js';
import LogicConnection from './logicConnection.js';
import { ConnectionConfig } from '../../shared/lookup.js';
import findNetworkPath from '../../config/transmission.js';

export default class Network{
    constructor(){
        this.components = {}; 
        this.connections = [];
        this.adjList = new Map(); // Maps IDs -> { ID: Connection }

        this.transmitFunc = (src, dest) => findNetworkPath(this.adjList, src, dest);
        this._getComponents = () => Object.values(this.components);
        this._getConnections = () => this.connections;
    }

    getComponent(component) {
        let componentID;
        if (component instanceof LogicComponent) {
            componentID = component.id;
        } else if (typeof component === 'string') {
            componentID = component;
        } else {
            console.log(' input is not Component or id ');
            return;
        }
        if (!this.components.hasOwnProperty(componentID)) {
            return;
        }
        return this.components[componentID];
    }

    hasComponent(component){
        if (component instanceof LogicComponent) {
            return this.components.hasOwnProperty(component.id);
        } else if (typeof component === "string") {
            return this.components.hasOwnProperty(component);
        } else {
            console.debug(" input is not Component or id ")
        }
    }

    hasConnection(connection){
        if (!(connection instanceof LogicConnection)) {
            return false;
        }
        return this.connections.some(e => e.equals(connection));
    }

    clearConnections(){
        this.connections = []
        for (let index in this.components){
            this.components[index].connections = []
            this.adjList.delete(index);
        }
    }

    clearComponents(){
        this.connections = []
        this.adjList = new Map();
        for (let index in this.components){
            delete this.components[index]
        }
    }

    /**
    * @param {Component} src 
    * @param {Component} des 
    * @param {Object} options 
    * @returns 
    */
    verifyConnectionType(src, des, options){
        // Get connection config definition here. Problem with component tags being a list...
        if ( src.id === des.id ){
            return { 
                valid: false,
                info: " can't connect to self "
            }
        } 
        if (src.isClient && des.isClient) {
            return { 
                valid: false,
                info: " can't connect two clients "
            }
        }

        let srcType = src.type
        let desType = des.type

        // Use connectionTypes here
        return { valid: true };
    }

    /**
    * 解连
    * @param {Number} srcId 
    * @param {Number} desId 
    */
    disconnect(srcId, desId){
        let target = -1
        let index = 0
        for (const connection of this.connections) {
            if (connection.equals(srcId, desId)) {
                target = index
            }
            index += 1
        }

        if (target !== -1){
            let srcComponent = this.components[srcId];
            let desComponent = this.components[desId];
            
            srcComponent.removeOutput();
            desComponent.removeInput();
            
            this.connections.splice(target, 1)
        }
    }



    /**
    * Component
    * @param {Component} component 
    * @returns newly created or existing component
    */
    networkAddComponent(component){
        if (!this.hasComponent(component)) {
            this.components[component.id] = component;
            this.adjList.set(component.id, {});
        } else {
            return {
                valid: false,
                info: 'Component already exists or is of wrong type'
            }
        }
        return {
            valid: true,
            info: `Storing component ${component.id} in network`
        }; 
    }

    /**
    * @param {Component} src 
    * @param {Component} des 
    * @param {Object} options 
    * @returns 新建立的Connection
    */
    networkAddConnection(connection){
        if (!connection) { 
            return {
                valid: false,
                info: "Source or destination component doesn't exist or is of wrong type"
            }
        }
        let srcComponent = connection.src;
        let destComponent = connection.des;
        let options = connection.options;

        if (!srcComponent || !destComponent) { 
            return {
                valid: false,
                info: "Source or destination component doesn't exist or is of wrong type"
            }
        }

        let verification = this.verifyConnectionType(srcComponent, destComponent, options);
        if (!verification.valid) {
            return verification;
        }

        if (!srcComponent.hasAvailableOutput()) {
            return {
                valid: false,
                info: `The source (${srcComponent.name}) has no available outputs`
            };
        }
        if(!destComponent.hasAvailableInput()) {
            return {
                valid: false,
                info: `The destination (${destComponent.name}) has no available inputs`
            };
        }

        if (this.hasConnection(connection)) { 
            return {
                valid: false,
                info: ' Connection already exists or is of wrong type'
            } 
        }

        srcComponent.addOutput();
        destComponent.addInput();

        this.connections.push(connection);
        
        this.adjList.get(srcComponent.id)[destComponent.id] = connection;
        // this.adjList.get(destComponent.id)[srcComponent.id] = options.latency;

        return { 
            valid: true,
            info: `Added connection from ${srcComponent.id} to ${destComponent.id} in network`
        };
    }

    /**
    * Attempts to remove the component representated by provided argument
    * @param {Component} component 
    * @returns 
    */
    networkRemovedComponent(component) {
        let componentObject;
        if (component instanceof LogicComponent) {
            componentObject = component;
        } else if (typeof component === 'string') {
            componentObject = this.getComponent(component);;
        } 
        
        if (!componentObject) { 
            return { 
                valid: false,
                info: "Component doesn't exists or is of wrong type"
            }
        }

        let componentId = componentObject.id;

        this.connections.forEach(function(connection) {
            if (!connection) { return false; }
            let srcId = connection.src.id;
            let desId = connection.des.id;
            if (srcId === componentId || desId === componentId) {
                this.disconnect(srcId, desId);
            }
        }.bind(this));

        for (let c of this.adjList.values()) {
            if (c.hasOwnProperty(componentId)) {
                delete c[componentId];
            }
        }
        this.adjList.delete(componentId);

        delete this.components[componentId];
        
        return { 
            valid: true,
            info: `Removing component ${componentId} from network`
        };
    }

    /**
    * Attempts to remove a connection between two nodes
    * @param {Component} src 
    * @param {Component} des 
    * @returns 
    */
    networkDisconnect(src, des) {
        if (!this.hasComponent(src)) {
            console.debug("INVALID CONNECTION: could not find or create given src");
            return;
        }
        if (!this.hasComponent(des)) {
            console.debug("INVALID CONNECTION: could not find or create given des");
            return;
        }

        if (!this.hasConnection(src, des)) {
            console.debug("INVALID DISCONNCT: no existing connection between components");
            return false;
        }

        var filtered = this.connections.filter(function(connection) {
            return connection.des.id !== des.id
                    || connection.src.id !== src.id;
        });
        this.connections = filtered; 

        this.components.forEach(function(component) {
            var filtered = component.connections.filter(function(connection) {
                return connection.des.id !== des.id
                        || connection.src.id !== src.id;
            });
            component.connections = filtered;
        });

        delete this.adjList.get(src.id)[des.id];
        // delete this.adjList.get(des.id)[src.id];

        return true;
    }
}
  