/*
* Graph traversal functions to be used by components when forwarding requests
* after they have been processed
*
* Can provide multiple traversal algorithms to be used by different components
*/


var dijkstraFastestNeighbor = (speeds, visited) => {
    let fastest = null;
    let current;
    for (let connection in speeds) {
        current = fastest === null || speeds[connection] < (speeds[fastest]);
        if (current && !visited.includes(connection)) {
            fastest = connection;
        }
    }
    return fastest;
};

var dijkstraFastestPath = (network, request) => {
    // Extract src and dest IDs
    let currComponentID = request.currComponent.id;
    let destComponentID = request.destID;

    // Track latencies from the start component using a hash object
    let latencies = {};
    latencies[destComponentID] = 'Infinity';
    let neighbors = network.get(currComponentID);
    for (let key in neighbors) {
        latencies[key] = neighbors[key].latency;
    }
    
    // Track paths using a hash object
    let parents = { endNode: null };
    for (let child in neighbors) {
        parents[child] = currComponentID;
    }
    // Collect visited
    let visited = [];
    // Find the quickest neighbor
    let component = dijkstraFastestNeighbor(latencies, visited);
    let connection, childrenConnections, newLatency;
    while (component) {
        connection = latencies[component];
        childrenConnections = network.get(component); 
        
        for (let child in childrenConnections) {
            if (child === currComponentID) {
                continue;
            } else {
                newLatency = connection + childrenConnections[child].latency;
                if (!latencies[child] || latencies[child] > newLatency) {
                    latencies[child] = newLatency;
                    parents[child] = component;
                } 
            }
        }  
        visited.push(component);
        component = dijkstraFastestNeighbor(latencies, visited);
    }
    
    if (Object.keys(parents).length > 1 && latencies[destComponentID] !== 'Infinity') {
        let shortestPath = [destComponentID];
        let parent = parents[destComponentID];
        while (parent) {
            shortestPath.push(parent);
            parent = parents[parent];
        }
        
        let nextID = shortestPath.at(-2);
        return neighbors[nextID];
    }
};

var returnToSender = function(network, request) {
    return request.prevConnection;
}

export const getTransmitFunction = function(name, network) {
    switch (name) {
        case 'dijkstra':
            return (req) => dijkstraFastestPath(network, req);
            break;
        case 'return':
            return (req) => returnToSender(network, req);
            break;
        default:
            return (req) => dijkstraFastestPath(network, req);
    }
}

export default getTransmitFunction;