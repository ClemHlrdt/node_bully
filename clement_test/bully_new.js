const zerorpc = require('zerorpc');
const fs = require('fs');
const sleep = require('sleep');
const threads = require('threads');
const spawn   = threads.spawn;
const thread  = spawn(function() {});

var State = new Object();
State.state = 'Normal';
State.coord = 0;
State.halt = -1;
State.Up = [];

//console.log(State);

var Bully = new Object();
Bully.addr = process.argv[2];
let config_file = 'server_config_local';
Bully.S = State;
Bully.checkServerPool = null;
let f = fs.readFileSync(config_file,'utf8').trim().split('\n').sort();
Bully.servers = f.slice();
console.log(`My addr: ${Bully.addr}`);
console.log(`Server list: ${Bully.servers}`);

Bully.connections =  [];

for(let i = 0; i<Bully.servers.length;i += 1){
	if(Bully.servers[i] == Bully.addr){
		Bully.priority = i;
		Bully.connections.push(Bully);
	} else {
		let c = new zerorpc.Client(5); // new client
		c.connect('tcp://' + Bully.servers[i]);
		Bully.connections.push(c); //push new client
		//console.log(Bully.connections)
	}
}

Bully.areYouThere = function(){
	return true;
};

Bully.areYouNormal= function() {
	if(Bully.S.state == 'Normal'){
		return true;
	} else {
		return false;
	}
};

Bully.halt = function(number) {
	Bully.S.state = 'Election';
	Bully.S.halt = number;
};

Bully.newCoordinator= function(nb) {
	console.log('call newCoordinator');
	if(Bully.S.halt == nb && Bully.S.state == 'Election'){
		Bully.S.coord = nb;
		Bully.S.state = 'Reorganization';
	}
};

Bully.ready = function(nb, x=null) {
	console.log('call ready');
	if(Bully.S.coord == nb && Bully.S.state == 'Reorganization'){
		//Bully.S.d = x;
		Bully.S.state = 'Normal';
	}
};

Bully.election= function() {
	console.log('Check the states of higher priority nodes:');
	//TODO
	let priorityPlusOne = Bully.priority +1;
	let restOfElements = Bully.servers.slice(priorityPlusOne);

	for(var i = 0; i<restOfElements.length; i += 1){
		//console.log(restOfElements[i]);
		try {
			// console.log('I am here')
			// let newConnection = Bully.connections[priorityPlusOne+i]
			// console.log(Bully.areYouThere(newConnection)) // true
			Bully.connections[Bully.priority+1+i].areYouThere();


			if(Bully.checkServerPool == null){
				Bully.S.coord = Bully.priority +1+i;
				console.log(Bully.S.coord);
				Bully.S.state = 'Normal';
				//Bully.checkServerPool = Bully.spawn(Bully.check());
				//Bully.checkServerPool = Bully.
				Bully.check();
				return;
			}
		} catch (error) {
			//console.log(error);
			console.log(`${restOfElements[i]} Timeout ! 1 (Checking for election)`);
		}
	}

	console.log('halt all lower priority nodes including Bully node:');
	Bully.halt(Bully.priority);
	Bully.S.state = 'Election';
	console.log(('I am', Bully.S.state));
	Bully.S.halt = Bully.priority;
	Bully.S.Up = [];
	// first time: Bully.priority = 0 for :9000, 1 for :9001
	for(let i = 0; i<=Bully.priority; i += 1){
		try {
			Bully.connections[i].halt(Bully.priority); 
			console.log(`Prompt: ${Bully.servers[i]} server halted`);
		} catch (error) {
			console.log(`Prompt: ${Bully.servers[i]} I have halted myself`);
			continue;
		}
		Bully.S.Up.push(Bully.connections[i]);
	}

	// reached the election point, now inform other nodes of new coordinator
	console.log('inform all nodes of new coordinator:');
	Bully.S.coord = Bully.priority;
	Bully.S.state = 'Reorganization';
	console.log(`I am ${Bully.S.state}`);
	for(let j = 0; j<Bully.S.Up.length; j += 1){
		try {
			Bully.S.Up[j].newCoordinator(Bully.priority);
		} catch (error) {
			console.log('Timeout! 3 (election has to be restarted');
			Bully.election();
			return;
		}
	}
	//Bully.connections[((Bully.priority + 1) + i)].areYouThere()
	// Reorganization
	for(let j = 0; j<Bully.S.UP;j += 1){
		try{
			Bully.S.Up[j].ready(Bully.priority);
		} catch (error){
			console.log('Timeout! 4');
			Bully.election();
			return;
		}
	}

	Bully.S.state = 'Normal';
	//Bully.checkServerPool = Bully.spawn(Bully.check());
	Bully.check();

};

Bully.recovery = function() {
	Bully.S.halt = -1;
	Bully.election();
};

Bully.check= function() {
	while (true) {
		console.log('My address is ', Bully.addr);
		if (Bully.S.coord == Bully.priority) {
			console.log('I am Coordinator');
		} else {
			console.log('I am Normal');
		}
		sleep.sleep(5);
		if (Bully.S.state == 'Normal' && Bully.S.coord == Bully.priority) {
			for (let i = 0; i < Bully.servers.length; i++) {
				if (i != Bully.priority) {
					// console.log(i)
					try {
						// console.log(Bully.connections[i])
						if (Bully.connections[i].invoke('areYouThere', function(error, res, more) {
							return res;
						}) == undefined) {
							throw error;
						} else {
							var ans = Bully.connections[i].invoke('areYouNormal', function(error, res, more) {
								return res;
							});
						}
					} catch (error) {
						// console.log(error);
						console.log(`${Bully.servers[i]} Timeout! 5 (normal node unreachable)`);
						continue;
						// return;
					}
					if (!ans) {
						Bully.election();
						return;
					}
				}
			}
		} else if (Bully.S.state == 'Normal' && Bully.S.coord != Bully.priority) {
			console.log('check coordinator\'s state');
			try {
				let result = Bully.connections[Bully.S.coord].invoke('areYouThere', function(error, res, more) {
					return res;
				});
				console.log(`Is the coordinator ${Bully.servers[Bully.S.coord]} up = ${result}`);
			} catch (error) {
				console.log('coordinator down, start election.');
				Bully.timeout();
			}
		}
	}
};
Bully.timeout= function() {
	if(Bully.S.state == 'Normal' || Bully.S.state == 'Reorganization'){
		try {
			Bully.connections[Bully.S.coord].areYouThere();
		} catch (error) {
			console.log(`${Bully.servers[Bully.S.coord]} Timeout! 6`);
			Bully.election();
		}
	} else {
		Bully.election();
	}
};

const address = process.argv[2];
Bully.inititialize = function() {
	//Bully.pool = spawn;
	//Bully.recoveryThread = Bully.pool.spawn(Bully.recovery)
	Bully.recovery();

};

const s = new zerorpc.Server(Bully);
console.log(s);
s.bind('tcp://' + address);
Bully.inititialize();
console.log(`${address} initializing Server`);
