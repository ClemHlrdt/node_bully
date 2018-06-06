var zerorpc = require("zerorpc");

// var server = new zerorpc.Server({
//     hello: function(name, reply) {
//     	console.log('METHOD INVOKED!!!!!!!!!!!!!!!!!!!!!!!')
//         reply(null, "Hello, " + name);
//     }
// });

var kurwa = new Object();
kurwa.hello = async function(reply){
	console.log('METHOD INVOKED!!!!!!!!!!!!!!!!!!!!!!!')
    reply(null, 'KURWA!!!!!!!!!!!');
};

var server = new zerorpc.Server(kurwa);
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
