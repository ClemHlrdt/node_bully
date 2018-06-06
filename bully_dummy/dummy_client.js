// const sleep = require('sleep');
// var zerorpc = require('zerorpc');

// var client = new zerorpc.Client();
// client.connect('tcp://127.0.0.1:4242');
// let myFirstPromise;
// client.invoke('hello', 'RPC', function(error, res, more) {
// 	//console.log(res); //WORKS ! logs 'Hello, RPC'
// 	myFirstPromise = new Promise((resolve, reject) => {
// 		//setTimeout(function(){
// 		return resolve(res);
// 		//},0);
// 	});

// 	myFirstPromise.then((message) => {
// 		callMeBack(message);
// 	});

// });

// function callMeBack(message){
// 	console.log(message.toUpperCase());
// }
// sleep.sleep(5);
// console.log('It works');

// // let myFirstPromise = new Promise((resolve, reject) => {
// // 	// We call resolve(...) when what we were doing asynchronously was successful, and reject(...) when it failed.
// // 	// In this example, we use setTimeout(...) to simulate async code. 
// // 	// In reality, you will probably be using something like XHR or an HTML5 API.
// // 	setTimeout(function(){
// // 	  resolve('Success!'); // Yay! Everything went well!
// // 	}, 250);
// // });
  
// // myFirstPromise.then((successMessage) => {
// // 	// successMessage is whatever we passed in the resolve(...) function above.
// // 	// It doesn't have to be a string, but if it is only a succeed message, it probably will be.
// // 	console.log('Yay! ' + successMessage);
// // });

var zerorpc = require('zerorpc');

var client = new zerorpc.Client();
client.connect('tcp://127.0.0.1:4242');

function call(param){
	client.invoke('hello', param, function(error, res, more) {
		console.log(res);
	});
}

call('THERE');