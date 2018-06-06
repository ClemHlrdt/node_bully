var zerorpc = require("zerorpc");
const sleep = require('sleep');

var client = new zerorpc.Client();
// client.connect("tcp://127.0.0.1:4242");
client.connect("tcp://127.0.0.1:4242");

// var driver_func = function(client_obj, func_name, para){
// 	console.log("inside driver");
// 	client_obj.invoke(func_name, para, function(error, res, more){
// 		// console.log(res);
// 		console.log("inside invoke")
// 		if(error){
// 			// console.log(error);
// 			console.log('returning error')
// 			return "ERROR!!!";
// 		}
// 		else{
// 			console.log('returning answer')
// 			console.log(res)
// 			return res;
// 		}
// 	});
// }

function invokerSleep(func_name, client_test) {
	return new Promise((resolve, reject) => {
		// console.log()
		client_test.invoke(func_name, function(error, res, more){
			if (error || !res){
				return reject(error);
			}
			else{
				return resolve(res);
			}
			
		});
		// if (amount <= 300) {
			// return reject('That is to fast, cool it down');
		// }
		// setTimeout(() => resolve(`Slept for ${amount}`), amount);
	});
}

// async function drive_invoker(func_name, client_test){
// 	console.log("start");
// 	await invokerSleep(func_name, client_test)
// 		.then((data)=>{
// 			console.log(data);
// 			// return data;

// 		}).catch((error)=>{
// 			console.error(error);
// 		})
// 	await invokerSleep(func_name, client_test)
// 		.then((data)=>{
// 			console.log(data);
// 		}).catch((error)=>{
// 			console.error(error);
// 		})
// 	console.log("end");
// }

async function drive_invoker(func_name, client_test){
	// console.log("start");
	// var result = await invokerSleep(func_name, client_test).catch((error) => {})
	// if(!result){console.log('FAIL!!!');}
	// console.log(result);
	// console.log("end");
	try{
		let result = await invokerSleep(func_name, client_test);
		console.log(result);
		return result;	
	} catch(error) {
		throw new Error(error);
	}
}

let result_final = drive_invoker("hello", client);
console.log(result_final)
// var tester = drive_invoker("hello", client);
// console.log('IT WORKS')
// console.log(tester)
// ans = driver_func(client, "hello", "hi");
// sleep.sleep(10)
// console.log(ans)
// sleep.sleep(10)
// console.log(ans)
// client.invoke("hello", "hi" ,function(error, res, more) {
//     console.log('inside callback '+res);
// })

