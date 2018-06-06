const zerorpc = require('zerorpc');
const fs = require('fs');
const sleep = require('sleep');
const threads = require('threads');
const spawn   = threads.spawn;
const thread  = spawn(function() {});

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

class Bully {
	constructor(addr, config_file='server_config_local') {
		this.S = new State();
		this.S.state = 'Normal';

		this.checkServerPool = null; //empty pool

		this.addr = addr;

		this.servers = [];

		//read config_file, put the content to an array and sort it
		let f = fs.readFileSync(config_file,'utf8').trim().split('\n').sort();
		this.servers = f.slice(); //copy of f
		console.log(`My addr: ${this.addr}`);
		console.log(`Server list: ${this.servers}`);

		this.connections = [];

		// Assigning priority varirable based on the order in the list
		for(let i = 0; i<this.servers.length;i += 1){
			if(this.servers[i] == this.addr){
				this.priority = i;
				this.connections.push(this);
			} else {
				let c = new zerorpc.Client(5); // new client
				c.connect('tcp://' + this.servers[i]);
				this.connections.push(c); //push new client
				//console.log(this.connections)
			}
		}
	}

	areYouThere() {
		return true;
	}

	areYouNormal() {
		if(this.S.state == 'Normal'){
			return true;
		} else {
			return false;
		}
	}

	halt(number) {
		this.S.state = 'Election';
		this.S.halt = number;
	}

	newCoordinator(nb) {
		console.log('call newCoordinator');
		if(this.S.halt == nb && this.S.state == 'Election'){
			this.S.coord = nb;
			this.S.state = 'Reorganization';
		}
	}

	ready(nb, x=null) {
		console.log('call ready');
		if(this.S.coord == nb && this.S.state == 'Reorganization'){
			//this.S.d = x;
			this.S.state = 'Normal';
		}
	}

	election() {
		console.log('Check the states of higher priority nodes:');
		//TODO
		let priorityPlusOne = this.priority +1;
		let restOfElements = this.servers.slice(priorityPlusOne);

		for(var i = 0; i<restOfElements.length; i += 1){
			//console.log(restOfElements[i]);
			try {
				// console.log('I am here')
				// let newConnection = this.connections[priorityPlusOne+i]
				// console.log(this.areYouThere(newConnection)) // true
				this.connections[this.priority+1+i].areYouThere();


				if(this.checkServerPool == null){
					this.S.coord = this.priority +1+i;
					console.log(this.S.coord);
					this.S.state = 'Normal';
					//this.checkServerPool = this.spawn(this.check());
					//this.checkServerPool = this.
					this.check();
					return;
				}
			} catch (error) {
				//console.log(error);
				console.log(`${restOfElements[i]} Timeout ! 1 (Checking for election)`);
			}
		}

		console.log('halt all lower priority nodes including this node:');
		this.halt(this.priority);
		this.S.state = 'Election';
		console.log(('I am', this.S.state));
		this.S.halt = this.priority;
		this.S.Up = [];
		// first time: this.priority = 0 for :9000, 1 for :9001
		for(let i = 0; i<=this.priority; i += 1){
			try {
				this.connections[i].halt(this.priority); 
				console.log(`Prompt: ${this.servers[i]} server halted`);
			} catch (error) {
				console.log(`Prompt: ${this.servers[i]} I have halted myself`);
				continue;
			}
			this.S.Up.push(this.connections[i]);
		}

		// reached the election point, now inform other nodes of new coordinator
		console.log('inform all nodes of new coordinator:');
		this.S.coord = this.priority;
		this.S.state = 'Reorganization';
		console.log(`I am ${this.S.state}`);
		for(let j = 0; j<this.S.Up.length; j += 1){
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
		for(let j = 0; j<this.S.UP;j += 1){
			try{
				this.S.Up[j].ready(this.priority);
			} catch (error){
				console.log('Timeout! 4');
				this.election();
				return;
			}
		}

		this.S.state = 'Normal';
		//this.checkServerPool = this.spawn(this.check());
		this.check();

	}

	recovery() {
		this.S.halt = -1;
		this.election();
	}

	check() {
		while(true){
			console.log('My address is ', this.addr);
			if(this.S.coord == this.priority){
				console.log('I am Coordinator');
			} else {
				console.log('I am Normal');
			}
			sleep.sleep(5);
			if(this.S.s == 'Normal' && this.S.coord == this.priority){
				for(let i = 0; i<this.servers.length; i += 1){
					if(i != this.priority){
						try {
							var ans = this.connections[i].areYouNormal();
						} catch (error) {
							//console.log(error);
							console.log(`${this.server[i]} Timeout! 5 (normal node unreachable)`);
							continue;
							// return;
						}
						if(!ans){
							this.election();
							return;
						}
					} else if(this.S.state == 'Normal' && this.S.coord != this.priority){
						console.log('check coordinator\'s state');
						try {
							let result = this.connections[this.S.coord].areYouThere();
							console.log(`Is the coordinator ${this.servers[this.S.coord]} up = ${result}`);
						} catch (error) {
							console.log('coordinator down, start election.');
							this.timeout();
						}
					}
				}
			}
		}
	}
	timeout() {
		if(this.S.state == 'Normal' || this.S.state == 'Reorganization'){
			try {
				this.connections[this.S.coord].areYouThere();
			} catch (error) {
				console.log(`${this.servers[this.S.coord]} Timeout! 6`);
				this.election();
			}
		} else {
			this.election();
		}
	}
	inititialize() {
		//this.pool = spawn;
		//this.recoveryThread = this.pool.spawn(this.recovery)
		this.recovery();

	}

}

const addr = process.argv[2];
//console.log(addr)
const bully = new Bully(addr);
const s = new zerorpc.Server(bully);

s.bind('tcp://' + addr);
bully.inititialize();
//initialize server
console.log(`${addr} initializing Server`);
