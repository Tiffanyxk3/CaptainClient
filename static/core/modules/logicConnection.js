

export default class LogicConnection{
    /**
     * Connection
     * @param {Component} src 
     * @param {Component} des 
     * @param {Object} options 
     */
    constructor(src, des, latency, options){
        this.src = src
        this.des = des
        this.options = options || {}
        this.latency = latency
        this.load = []
    }

    setLatency(latency) {
        this.latency = latency || 0;
    }

    setOptions(options) {
        this.options = options || {};
    }

    processTimestep(){
        let req;
        let i = this.load.length;
        let modifiedRequests = [];
        while (i--) {
            req = this.load[i];
            if (++req[0] >= this.latency) {
                this.load.splice(i, 1);
                this.des.enqueue(req[1]);
                modifiedRequests.push(req[1]);
            }
        }
        return modifiedRequests;
    }
    addRequest(req){
        this.load.push([0, req]);
    }
    removeRequest(){}

    equals(other){
        if (!(other instanceof LogicConnection)) {
            return false;
        }
        return other.src.id === this.src.id
                && other.des.id === this.des.id;
    }

    equals(srcId, desId) {
        return this.src.id === srcId && this.des.id === desId;
    }

    softReset() {
        this.load = [];
    }

    hardReset() {
        this.softReset();
        for (let opt in this.options) {
            delete this.options[opt];
        }
        this.options = {};
        this.latency = 0
        this.src = null;
        this.des = null;
    }
}
