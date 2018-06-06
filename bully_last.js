const zerorpc = require('zerorpc');
const fs = require('fs');
const sleep = require('sleep');

//nvm use v8.11.2

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

var Bully = new Object(); //Create a new Bully Object
Bully.S = new State(); //assign a new State Object to Bully.S
Bully.S.state = 'Normal'; //set Bully.S.state to Normal (redundant)

Bully.checkServerPool = null; //empty pool

const address = process.argv[2]; //get server + port
Bully.addr = address; //assign it
Bully.config_file = 'server_config_local'; //confile file name

Bully.servers = []; //empty array of servers

//read config_file, put the content to an array, trim it and sort it
let f = fs.readFileSync(Bully.config_file, 'utf8').trim().split('\n').sort();
Bully.servers = f.slice(); //f is assigned to Bully.servers
console.log(`My addr: ${Bully.addr}`); 
console.log(`Server list: ${Bully.servers}`);

Bully.connections = []; //empty Bully.connections Array

// Assigning priority varirable based on the order in the list
for (let i = 0; i < Bully.servers.length; i++) {
	if (Bully.servers[i] == Bully.addr) { // if the server in the list is the one my script is running...
		Bully.priority = i; //assign i to its priority
		Bully.connections.push(Bully); //push it to the connections array
	} else { //else
		let c = new zerorpc.Client(); // create new client which will communicate with other servers from the list
		c.connect('tcp://' + Bully.servers[i]); //connect it
		console.log(`Binding server ${Bully.servers[i]}`);
		Bully.connections.push(c); //push new client
		// console.log(c)
	}
}


//Bully Methods
Bully.areYouThere = function(reply) {                               //when areYouThere is called by a client,
	console.log('METHOD INVOKED!!!!!!!!!!!!!!');
	//return true
	reply(null, true);                                              //return True using ZeroRPC Method
};

Bully.areYouNormal = function(reply) {
	console.log('METHOD INVOKED!!!!!!!!!!!!!!');
	if (this.S.state == 'Normal') {
		// return true
		reply(null, true);
	} else {
		// return false
		reply(null, false);
	}
};

Bully.halt = function(number) {                                     //When halt is called...
	this.S.state = 'Election';                                      // we change the state of this server to Election
	this.S.halt = number;                                           //and change this.S.halt to the number given
};

Bully.newCoordinator = function(nb) {                               //When newCoordinator is called
	console.log('call newCoordinator');                             
	if (this.S.halt == nb && this.S.state == 'Election') {          //if this.S.halt is True and this.S.state is Election
		this.S.coord = nb;                                          // we give this.S.coord the nb given as parameter
		this.S.state = 'Reorganization';                            // and change this.S.state to 'Reorganization'
	}
};

Bully.ready = function(nb, x = null) {                              //When ready is called...
	console.log('call ready');                  
	if (this.S.coord == nb && this.S.state == 'Reorganization') {   //if this.S.coord == nb AND we have reorganization State,
		//this.S.d = x;
		this.S.state = 'Normal';                                    //Set the state back to Normal
	}
};

Bully.election = function() {                                       // When election is called...
	console.log('Check the states of higher priority nodes');
    
	let priorityPlusOne = this.priority + 1;                        // Priority + 1
	let restOfElements = this.servers.slice(priorityPlusOne);       //list of elements from priorityPlusOne to the end

	for (var i = 0; i < restOfElements.length; i++) {               
		try {
			console.log('I am here');
			// let newConnection = this.connections[priorityPlusOne+i]
			// console.log(this.areYouThere(newConnection)) // true
			// Call AreYouThere
			this.connections[this.priority + 1 + i].invoke('areYouThere', function(error, res, more) {
				console.log(res);
			});

			if (this.checkServerPool == null) {
				this.S.coord = this.priority + 1 + i;                // change this.S.coord to priority +1 + value of index
				this.S.state = 'Normal';                             // change state to Normal
				//this.check();                                      // call check()
			}
			return;
		} catch (error) {
			//console.log(error);
			console.log(`${restOfElements[i]} Timeout ! 1 (Checking for election)`);
		}
	}

	console.log('halt all lower priority nodes including this node:');
	this.halt(this.priority); //
	this.S.state = 'Election';
	console.log(`I am ${this.S.state}`);
	this.S.halt = this.priority;
	this.S.Up = [];
	// first time: this.priority = 0 for :9000, 1 for :9001
	for (let i = 0; i <= this.priority; i++) {
		try {
			this.connections[i].halt(this.priority); //only works for Bully objects
			console.log(`Prompt: ${this.servers[i]} server halted`);
		} catch (error) {
			console.log(`Prompt: ${this.servers[i]} I have halted myself`); //for Clients
			continue;
		}
		this.S.Up.push(this.connections[i]);
	}

	// reached the election point, now inform other nodes of new coordinator
	console.log('inform all nodes of new coordinator:');
	this.S.coord = this.priority;
	this.S.state = 'Reorganization';
	console.log(`I am ${this.S.state}`);
	// console.log(this.S.Up)
	for (let j = 0; j < this.S.Up.length; j++) {
		try {
			this.S.Up[j].newCoordinator(this.priority);
		} catch (error) {
			console.log('Timeout! 3 (election has to be restarted');
			this.election();
			return;
		}
	}
	//this.connections[((this.priority + 1) + i)].areYouThere()
	// Reorganization
	for (let j = 0; j < this.S.Up.length; j++) {
		try {
			this.S.Up[j].ready(this.priority);
		} catch (error) {
			console.log('Timeout! 4');
			this.election();
			return;
		}
	}

	this.S.state = 'Normal';
	//this.checkServerPool = this.spawn(this.check());
	//this.check();

};

Bully.recovery = function() {
	this.S.halt = -1;
	this.election();
};

Bully.sayhi = function(reply){
	reply(null,'Kurwa I work!!');
};

Bully.check = function() {
	while (true) {
		console.log('My address is ', this.addr);
		if (this.S.coord == this.priority) {
			console.log('I am Coordinator');
		} else {
			console.log('I am Normal');
		}
		sleep.sleep(5);
		if (this.S.state == 'Normal' && this.S.coord == this.priority) {

			for (let i = 0; i < this.servers.length; i++) {
				if (i != this.priority) {
					//console.log(i);
					//console.log(this.connections[i]);
					this.connections[i].invoke('areYouThere', function(error, res, more) {
						// return res
						if(error){
							console.error('Error when calling invoke areYouThere',error);
						} else {
							console.log(res);
						}
					});

					try {
						// console.log(this.connections[i])
						if (this.connections[i].invoke('areYouThere', function(error, res, more) {
							return res;
						}) == undefined) {
							throw error;
						} else {
							var ans = this.connections[i].invoke('areYouNormal', function(error, res, more) {
								return res;
							});
						}
					} catch (error) {
						// console.log(error);
						console.log(`${this.servers[i]} Timeout! 5 (normal node unreachable)`);
						continue;
						// return;
					}
					if (!ans) {
						this.election();
						return;
					}
				}
			}
		} else if (this.S.state == 'Normal' && this.S.coord != this.priority) {
			console.log('check coordinator\'s state');
			try {
				let result = this.connections[this.S.coord].invoke('areYouThere', function(error, res, more) {
					return res;
				});
				console.log(`Is the coordinator ${this.servers[this.S.coord]} up = ${result}`);
			} catch (error) {
				console.log('coordinator down, start election.');
				this.timeout();
			}
		}
	}
};

Bully.timeout = function() {
	if (this.S.state == 'Normal' || this.S.state == 'Reorganization') {
		try {
			this.connections[this.S.coord].invoke('areYouThere', function(error, res, more) {
				return res;
			});
		} catch (error) {
			console.log(`${this.servers[this.S.coord]} Timeout! 6`);
			this.election();
		}
	} else {
		this.election();
	}
};
Bully.inititialize = function() {
	this.recovery();

};

const s = new zerorpc.Server(Bully);
s.bind('tcp://' + address);
Bully.inititialize();
console.log(`${address} initializing Server`);