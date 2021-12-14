const levelDefs = {
    1: {
        timeLimit: 100, // Initial time limit
        budget: 100, // Initial budget
        clients: [ // Initial placed clients
            {
                name: 'IPHONE',
                quantity: 1
            }
        ],
        processors: [ // Initial placed processors
            {
                name: 'SWITCH', 
                quantity: 1
            }
        ],
        endpoints: [ // Initial placed endpoints
            {
                name: 'HTML',
                quantity: 1
            }
        ],
        availableComponents: [ // Stage 1 newly available additional processors
            {
                name: 'SERVER', 
                quantity: 1
            },
            {
                name: 'DATABASE', 
                quantity: 1
            }
        ],
        stages: {
            1: {
                networkType: 'WIFI', // Stage 1 network type
                goals: [ // Stage 1 goals
                    {
                        mission: 'HTML', // goal is to have requets reach the HTML endpoint
                        quantity: 20 // number of requets needed to meet the goal
                    }   
                ],
                description: "HEY THERE PRIVATE!\nLet's say you want to access an HTML page from your IPHONE.\nThink you can do that?\nMake 10 REQUESTS to the HTML page."
            },
            2: {
                coinReward: 50, // Coin reward for reaching Stage 2
                timeBonus: 25, // Time bonus for reaching Stage 2
                networkType: 'WIFI', // Stage 2 network type
                goals: [ // Stage 2 goals
                    {
                        mission: 'HTML', // goal is to have requets reach the HTML endpoint
                        quantity: 30 // number of requets needed to meet the goal
                    }   
                ],
                addedClients: [ // Stage 2 newly added clients
                    {
                        name: 'IPHONE',
                        quantity: 1
                    }
                ],
                addedProcessors: [], // Stage 2 newly added processors
                addedEndpoints: [], // Stage 2 newly added endpoints
                additionalComponents: [ // Stage 2 newly available additional processors
                    {
                        name: 'SERVER', 
                        quantity: 1
                    }
                ],
                description: "GREAT!\nYou're on your way to becoming a CAPTAIN yourself!\nMake 30 REQUESTS to the HTML page with 2 IPHONES.\nRemember more CLIENTS means more REQUESTS to slow down your system!"
            }
        }
    },
    2: {
        timeLimit: 120,
        budget: 150,
        clients: [
            {
                name: 'LAPTOP',
                quantity: 1
            }
        ],
        processors: [
            {
                name: 'GATEWAY', 
                quantity: 1
            }
        ],
        endpoints: [
            {
                name: 'IMAGE',
                quantity: 1
            }
        ],
        availableComponents: [
            {
                name: 'SERVER', 
                quantity: 1
            },
            {
                name: 'DATABASE', 
                quantity: 1
            }
        ],
        stages: {
            1: {
                networkType: 'WIFI',
                goals: [
                    {
                        mission: 'IMAGE', // goal is to have requets reach the HTML endpoint
                        quantity: 20 // number of requets needed to meet the goal
                    }   
                ],
                description: "YOU'RE GETTING THE HAND OF IT!\nNow pull up an IMAGE on your LAPTOP.\nMake 20 REQUESTS to the IMAGE."
            },
            2: {
                coinReward: 60,
                timeBonus: 45,
                networkType: 'WIFI',
                goals: [
                    {
                        mission: 'IMAGE', // goal is to have requets reach the image endpoint
                        quantity: 30 // number of requets needed to meet the goal
                    }   
                ],
                addedClients: [
                    {
                        name: 'IPHONE',
                        quantity: 1
                    }
                ],
                addedProcessors: [],
                addedEndpoints: [],
                additionalComponents: [
                    {
                        name: 'SERVER', 
                        quantity: 1
                    }
                ],
                description: "HAH-HAH-HA!\nBUT CAN YOU HANDLE AN IPHONE AS WELL?!\nMake 30 REQUESTS to the IMAGE."
            }
        }
    },
    3: {
        timeLimit: 120,
        budget: 200,
        clients: [
            {
                name: 'IPHONE',
                quantity: 1
            }
        ],
        processors: [
            {
                name: 'SWITCH', 
                quantity: 1
            }
        ],
        endpoints: [
            {
                name: 'VIDEO',
                quantity: 1
            }
        ],
        availableComponents: [
            {
                name: 'SERVER', 
                quantity: 2
            },
            {
                name: 'CACHE', 
                quantity: 1
            },
            {
                name: 'LOAD_BALANCER', 
                quantity: 1
            }
        ],
        stages: {
            1: {
                networkType: 'WIFI',
                goals: [
                    {
                        mission: 'VIDEO', // goal is to have requets reach the hosted video
                        quantity: 20 // number of requets needed to meet the goal
                    }   
                ],
                description: "LET'S GET CREATIVE!\nTIME TO PIRATE SOME VIDEOS!\nMake 20 REQUESTS to the VIDEO."
            },
            2: {
                coinReward: 60,
                timeBonus: 45,
                networkType: 'WIFI',
                goals: [
                    {
                        mission: 'VIDEO', // goal is to have requets reach the hosted video
                        quantity: 30 // number of requets needed to meet the goal
                    }   
                ],
                addedClients: [],
                addedProcessors: [],
                addedEndpoints: [],
                additionalComponents: [
                    {
                        name: 'ROUTER', 
                        quantity: 1
                    },
                    {
                        name: 'MODEM', 
                        quantity: 1
                    }
                ],
                description: "ARRRGH!\nDON'T FORGET THE DIRTY ONES!\nMake 30 REQUESTS to the VIDEO."
            },
            3: {
                coinReward: 60,
                timeBonus: 50,
                networkType: 'WIFI',
                goals: [
                    {
                        mission: 'VIDEO', // goal is to have requets reach the hosted video
                        quantity: 50 // number of requets needed to meet the goal
                    }   
                ],
                addedClients: [],
                addedProcessors: [],
                addedEndpoints: [],
                additionalComponents: [
                    {
                        name: 'SERVER', 
                        quantity: 2
                    },
                    { 
                        name: 'CACHE',
                        quantity: 1
                    },
                ],
                description: "GET ME MARVEL'S 'ENDGAME'! Make 50 REQUESTS to the VIDEO."
            }
        }
    }
};

export default levelDefs;

