var zerorpc = require("zerorpc");
const sleep = require('sleep');

var client = new zerorpc.Client();
// client.connect("tcp://127.0.0.1:4242");
client.connect("tcp://127.0.0.1:9000");

function invokerSleep(func_name, client_test, param) {
	return new Promise((resolve, reject) => {
		// console.log()
		client_test.invoke(func_name, param, function(error, res, more){
			if (error){
				return reject(error);
			}
			else{
				return resolve(res);
			}
			
		});
	});
}

async function drive_invoker(func_name, client_test, param=null){
	try{
		let result = await invokerSleep(func_name, client_test, param);
		console.log(result);
		return result;	
	} catch(error) {
		// throw new Error(error);
		console.log(error)
	}
}

drive_invoker("areYouNormal", client);
drive_invoker("areYouThere", client);
// console.log(result_final)