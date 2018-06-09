var zerorpc = require("zerorpc");

// var server = new zerorpc.Server({
//     hello: function(name, reply) {
//     	console.log('METHOD INVOKED!!!!!!!!!!!!!!!!!!!!!!!')
//         reply(null, "Hello, " + name);
//     }
// });

var myObj = new Object();
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

myObj.S = new State(); //assign a new State Object to Bully.S
myObj.S.state = 'Normal';

myObj.hello = function(param, reply){
	console.log('METHOD INVOKED!!!!!!!!!!!!!!!!!!!!!!!')
    reply(null, param);
};

myObj.areYouThere = function(param, reply) { //when areYouThere is called by a client,
	console.log('METHOD INVOKED!!!!!!!!!!!!!!');
	//return true
	reply(null, true); //return True using ZeroRPC Method
};

myObj.areYouNormal = function(param, reply) {
	console.log('METHOD INVOKED!!!!!!!!!!!!!!');
	if (this.S.state == 'Normal') {
		// return true
		reply(null, true);
	} else {
		// return false
		reply(null, false);
	}
	return;
};

var server = new zerorpc.Server(myObj);
server.bind("tcp://127.0.0.1:4242");

// console.log(server)

// var clienter = new zerorpc.Client();
// clienter.connect("tcp://127.0.0.1:4242");
// clienter.invoke("hello", 'RPC', function(error, res, more) {
//     // response = res;
//     console.log('inside callback '+res) // I want to return res
//     // return res; //this line doesn't work
// })
// console.log('START')
