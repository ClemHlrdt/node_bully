// var zerorpc = require('zerorpc');

// // class Ser{
// // 	constructor(name){
// // 		this.name = name;
// // 	}
// // 	hello(name, reply){
// // 		reply(null, 'Hello' + name);
// // 	}
// // }

// // var serv = new Ser('123');
// let serv = new Object();
// serv.hello = function(name,reply){
// 	reply(null, 'Hello ' + name);
// };


// // {
// // 	hello: function(name, reply) {
// // 		reply(null, 'Hello, ' + name);
// // 	}
// // }


// // console.log('########################################################');
// // console.log(serv);
// // console.log('########################################################');

// var server = new zerorpc.Server(serv);

// server.bind('tcp://0.0.0.0:4242');

// // console.log(server);

var zerorpc = require('zerorpc');

var server = new zerorpc.Server({
	hello: function(name, reply) {
		reply(null, 'Hello, ' + name);
	}
});

server.bind('tcp://0.0.0.0:4242');
