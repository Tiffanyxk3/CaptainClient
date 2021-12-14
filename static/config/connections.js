/*
 * Define different types of connections and give specs for different networks
 */
export var connectionTypes = {
    CLIENT: {
        EDGE: {}
    },
    EDGE: {
        CLIENT: {}, 
        PRE_PROCESSOR: {},
        PROCESSOR: {}, 
        ENDPOINT: {}
    },
    PRE_PROCESSOR: {
        PROCESSOR: {},
        EDGE: {}
    },
    PROCESSOR: {
        EDGE: {},
        PRE_PROCESSOR: {},
        ENDPOINT: {}, 
        PROCESSOR: {}
    },
    ENDPOINT: {
        PROCESSOR: {}, 
        EDGE: {}
    }
};

export var networkTypes = {
    'WIFI': {
        latency: 2 // universal constant for all connections in WIFI network
    },
    'ETHERNET': {
        latency: 1 // universal constant for all connections in Ethernet network
    },
    '4G': {
        latency: 3 // universal constant for all connections in 4G network
    },
    'LTE': {
        latency: 2 // universal constant for all connections in LTE network
    },
    '5G': {
        latency: 1 // universal constant for all connections in 5G network
    }
};
