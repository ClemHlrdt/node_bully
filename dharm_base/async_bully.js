const zerorpc = require('zerorpc');
const fs = require('fs');
const sleep = require('sleep');
//nvm use v8.11.1

class State {
    constructor() {
        //State of the node
        // [Down, Election, Reorganization, Normal]
        this.state = 'Normal';
        // coordinator of the node (if coordinator, has it's own id. Otherwise the id of the coordinator node)
        this.coord = 0;
        // The node which recently made this node halt (election started by a higher priority node)
        this.halt = -1;
        // list of nodes which this node believes to be in operation
        this.Up = [];
    }
}

var Bully = new Object();

Bully.S = new State();
Bully.S.state = 'Normal';
Bully.checkServerPool = null; //empty pool

const address = process.argv[2];
Bully.addr = address;
Bully.config_file = 'server_config_local';

Bully.servers = [];

//read config_file, put the content to an array and sort it
let f = fs.readFileSync(Bully.config_file, 'utf8').trim().split('\n').sort();
Bully.servers = f.slice() //copy of f
console.log(`My addr: ${Bully.addr}`);
console.log(`Server list: ${Bully.servers}`);

Bully.connections = [];

// Assigning priority varirable based on the order in the list
for (let i = 0; i < Bully.servers.length; i++) {

    if (Bully.servers[i] == Bully.addr) {
        Bully.priority = i;
        Bully.connections.push(Bully);
    } else {
        let c = new zerorpc.Client(); // new client
        c.connect('tcp://' + Bully.servers[i]);
        Bully.connections.push(c) //push new client
        // console.log(c)
    }
}

//to be called for clients
Bully.areYouThere = function(reply) {
    console.log('METHOD INVOKED!!!!!!!!!!!!!!')
    reply(null, true);
}

//to be called for clients
Bully.areYouNormal = function(reply) {
    console.log('METHOD INVOKED!!!!!!!!!!!!!!')
    if (this.S.state == 'Normal') {
        reply(null, true);
    } else {
        reply(null, false);
    }
}

//to be called for clients
Bully.halt = function(number) {
    this.S.state = 'Election';
    this.S.halt = number
}

//to be called for clients
Bully.newCoordinator = function(nb) {
    console.log('call newCoordinator');
    if (this.S.halt == nb && this.S.state == 'Election') {
        this.S.coord = nb;
        this.S.state = 'Reorganization';
    }
}

//to be called for clients
Bully.ready = function(nb, x = null) {
    console.log("call ready");
    if (this.S.coord == nb && this.S.state == "Reorganization") {
        this.S.state = 'Normal';
    }
}

Bully.election = function() {
    console.log("Check the states of higher priority nodes");
    let priorityPlusOne = this.priority + 1;
    let restOfElements = this.servers.slice(priorityPlusOne);

    for (var i = 0; i < restOfElements.length; i++) {
        try {
            let result = await driverMain("areYouThere",this.connections[this.priority+1+i]);
            if (result != true){
                console.log(`${restOfElements[i]} Timeout ! 1 (Checking for election)`)
                continue;
            }
        } catch (error) {
            console.log(`${restOfElements[i]} baah`)
        }
    }

    console.log('halt all lower priority nodes including this node:');
    this.halt(this.priority);
    this.S.state = 'Election';
    console.log(`I am ${this.S.state}`);
    this.S.halt = this.priority
    this.S.Up = [];
    for (let i = 0; i <= this.priority; i++) {
        try {
            this.connections[i].halt(this.priority); //only works for Bully objects
            console.log(`Prompt: ${this.servers[i]} server halted`);
        } catch (error) {
            console.log(`Prompt: ${this.servers[i]} I have halted myself (I may be dead too)`); //for Clients
            continue;
        }
        // this.S.Up.push(this.connections[i])
    }

    // reached the election point, now inform other nodes of new coordinator
    console.log('inform all nodes of new coordinator:')
    this.S.coord = this.priority;
    this.S.state = 'Reorganization';
    console.log(`I am ${this.S.state}`);
    for (let j = 0; j < this.S.Up.length; j++) {
        try {
            this.S.Up[j].newCoordinator(this.priority);
        } catch (error) {
            console.log('Timeout! 3 (election has to be restarted');
            this.election();
            return
        }
    }
    // Reorganization
    for (let j = 0; j < this.S.Up.length; j++) {
        try {
            this.S.Up[j].ready(this.priority);
        } catch (error) {
            console.log('Timeout! 4');
            this.election();
            return
        }
    }

    this.S.state = 'Normal';
    // this.check();

}

Bully.recovery = function() {
	console.log('in recovery')
    this.S.halt = -1;
    this.election();
}

Bully.check = function() {
    while (true) {
        console.log('My address is ', this.addr);
        if (this.S.coord == this.priority) {
            console.log('I am Coordinator');
        } else {
            console.log('I am Normal');
        }
        sleep.sleep(5)
        if (this.S.state == 'Normal' && this.S.coord == this.priority) {

            for (let i = 0; i < this.servers.length; i++) {
                if (i != this.priority) {
                    try {
                        // if (this.connections[i].invoke("areYouThere", function(error, res, more) {
                        //         return res;
                        //     }) == undefined) {
                        //     // throw error;
                        //     continue;
                        // } else {
                        //     var ans = this.connections[i].invoke("areYouNormal", function(error, res, more) {
                        //         return res;
                        //     })
                        // }
                        driverMain("areYouThere",this.connections[i]);

                    } catch (error) {
                        // console.log(error);
                        console.log(`${this.servers[i]} Timeout! 5 (normal node unreachable)`);
                        continue;
                        // return;
                    }
                    // if (!ans) {
                    //     this.election();
                    //     return;
                    // }
                }
            }
        } else if (this.S.state == 'Normal' && this.S.coord != this.priority) {
            console.log("check coordinator\'s state");
            try {
                // let result = this.connections[this.S.coord].invoke("areYouThere", function(error, res, more) {
                //     return res;
                // });
                driverMain("areYouThere",this.connections[this.S.coord]);
                console.log(`Is the coordinator ${this.servers[this.S.coord]} up ? YES it is!`);
            } catch (error) {
                console.log('coordinator down, start election.');
                this.timeout();
            }
        }
    }
}

Bully.timeout = function() {
    if (this.S.state == 'Normal' || this.S.state == 'Reorganization') {
        try {
            // this.connections[this.S.coord].invoke("areYouThere", function(error, res, more) {
            //     return res
            // });
            driverMain("areYouThere",this.connections[this.S.coord]);

        } catch (error) {
            console.log(`${this.servers[this.S.coord]} Timeout! 6, start election again`)
            this.election();
        }
    } else {
        this.election();
    }
}
Bully.inititialize = function() {
    //Bully.pool = spawn;
    //Bully.recoveryThread = Bully.pool.spawn(Bully.recovery)
    console.log('in initialize')
    this.recovery();

}

Bully.syncFuncCall = function(func_name, client_test) {
    return new Promise((resolve, reject) => {
        // console.log()
        client_test.invoke(func_name, function(error, res, more){
            if (error || !res){
                return reject(error);
                // return reject();
            }
            else{
                return resolve(res);
            }
            
        });
    });
}

var driverMain = async function(func_name, client_test){
    var result = await this.syncFuncCall(func_name, client_test).catch((error) => {});
    // if(!result){
        // throw new Error;
    //  return null;
    // }
    return result;
}

// console.log(typeof(Bully));
// console.log(Bully);
const s = new zerorpc.Server(Bully);

s.bind('tcp://' + address);
Bully.inititialize();
// initialize server
console.log(`${address} initializing Server`);