// Using promises

function sleep(amount) {
	return new Promise((resolve, reject) => {
		if (amount <= 300) {
			return reject('That is to fast, cool it down');
		}
		setTimeout(() => resolve(`Slept for ${amount}`), amount);
	});
}

// ################# This works but syntax is a bit callbacky #########################
// sleep(500)
// 	.then((result) => {
// 		console.log(result);
// 		return sleep(1000);
// 	})
// 	.then((result) => {
// 		console.log(result);
// 		return sleep(750);
// 	})
// 	.then((result) => {
// 		console.log(result);
// 		console.log('Done');
// 	});


// This is more elegant. PS: after .then(), we can do .catch() to get the value if the promise is rejected.
//
async function main() {
	await sleep(100).then((data) => {
		console.log(data)
	}).catch((error) => {
		console.log(error);
	});
	await sleep(1000).then((data) => {
		console.log(data)
	}).catch((error) => {
		console.log(error);
	});
	await sleep(2000).then((data) => {
		console.log(data)
	}).catch((error) => {
		console.log(error);
	});
	return "Hello"
}
console.log('Start');
console.log(main())
console.log('Stop')