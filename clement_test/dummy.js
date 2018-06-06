// var fs = require('fs');


// class State {
//     constructor() {
//         //State of the node
//         // [Down, Election, Reorganization, Normal]
//         this.state = 'Normal';
//         // coordinator of the node (if coordinator, has it's own id. Otherwise the id of the coordinator node)
//         this.coord = 0;
//         // The node which recently made this node halt (election started by a higher priority node)
//         this.halt = -1;
//         // list of nodes which this node believes to be in operation
//         this.Up = [];
//     }
// }

// class Bully{
//     constructor(addr, config_file='server_config'){
//         this.S = new State();
//         this.S.state = 'Normal'

//         //this.check_servers_greenlet = null;

//         this.addr = addr;
        
//         this.servers = [];
        
//         //read config_file, put the content to an array and sort it
//         let f = fs.readFileSync(config_file,'utf8').trim().split('\n').sort();
//         this.servers = f.slice() //copy of f
//         console.log("here", this.servers)
//         console.log(`My addr: ${this.addr}`);
//         console.log(`Server list: ${this.servers}`);
//         console.log(this.servers)

//         // Assigning priority varirable based on the order in the list
//         for(let i = 0; i<this.servers.length;i++){
//             if(this.servers[i] == this.addr){
//                 this.priority = i;
//                 this.connections.push(this);
//             } else {
//                 let c = new zerorpc.Client(5);
//                 c.connect('tcp://' + this.servers[i]);
                
//                 this.connections.push(c)
//             }
//         }
//     }
// }

// let b = new Bully("127.0.0.1");

// let arr = [1,2,3,4,5];
// console.log(arr);
// let newArr = arr.map( e => {return e+1})
// console.log(newArr)

// const spawn = require('threads').spawn;
 
// const thread = spawn(function(input, done) {
//   // Everything we do here will be run in parallel in another execution context.
//   // Remember that this function will be executed in the thread's context,
//   // so you cannot reference any value of the surrounding code.
//   done({ string : input.string, integer : parseInt(input.string) });
// });
 
// thread
//   .send({ string : '123' })
//   // The handlers come here: (none of them is mandatory)
//   .on('message', function(response) {
//     console.log('123 * 2 = ', response.integer * 2);
//     thread.kill();
//   })
//   .on('error', function(error) {
//     console.error('Worker errored:', error);
//   })
//   .on('exit', function() {
//     console.log('Worker has been terminated.');
//   });

// const threads = require('threads');
// const spawn   = threads.spawn;
// const thread  = spawn(function() {});
 
// thread
//   .run(function minmax(int, done) {
//     if (typeof this.min === 'undefined') {
//       this.min = int;
//       this.max = int;
//     } else {
//       this.min = Math.min(this.min, int);
//       this.max = Math.max(this.max, int);
//     }
//     done({ min : this.min, max : this.max });
//   })
//   .send(2)
//   .send(3)
//   .send(4)
//   .send(1)
//   .send(5)
//   .on('message', function(minmax) {
//     console.log('min:', minmax.min, ', max:', minmax.max);
//   })
//   .on('done', function() {
//     thread.kill();
//   });


// const threads = require('threads');
// const spawn   = threads.spawn;
// const thread  = spawn(function() {});
 
// thread
//   .run(function(input, done, progress, hello) {
//     setTimeout(done, 1000);
//     setTimeout(function() { progress(25); }, 250);
//     setTimeout(function() { hello(); }, 500);
//     setTimeout(function() { progress(75); }, 750);
//   })
//   .send()
//   .on('progress', function(progress) {
//     console.log(`Progress: ${progress}%`);
//   })
//   .on('hello', function(){
//     console.log(`Hello world`);
//   })
//   .on('done', function() {
//     console.log(`Done.`);
//     thread.kill();
//   });

// const threads = require('threads');
// const spawn   = threads.spawn;
// const thread  = spawn(function() {});
 
// thread
//   .run(function(input, done, hello) {
//     // setTimeout(done, 1000);
//     // setTimeout(function() { progress(25); }, 250);
//     // setTimeout(function() { progress(50); }, 500);
//     // setTimeout(function() { progress(75); }, 750);
//     hello('Dharm');
//     hello('Clément');
//     setTimeout(done,1000)
//   })
//   .send()
//   .on('progress', function(value){
//     console.log(`Hello ${value}`)
//   })
//   // .on('progress', function(progress) {
//   //   console.log(`Progress: ${progress}%`);
//   // })
//   .on('done', function() {
//     console.log(`Done.`);
//     thread.kill();
//   });

// const threads = require('threads');
// const spawn   = threads.spawn;
// const thread  = spawn(function() {});

// console.log('1')

// thread
//   .run(function minmax(int, done) {
//     if (typeof this.min === 'undefined') {
//       this.min = int;
//       this.max = int;
//     } else {
//       this.min = Math.min(this.min, int);
//       this.max = Math.max(this.max, int);
//     }
//     done({ min : this.min, max : this.max });
//   })
//   .send(2)
//   .send(3)
//   .send(4)
//   .send(1)
//   .send(5)
//   .on('message', function(minmax) {
//     console.log('min:', minmax.min, ', max:', minmax.max);
//   })
//   .on('done', function() {
//     thread.kill();
//   });

//   setInterval(function(){
//     console.log('2')
//   }, 2000)

// const { spawn } = require('child_process');

// const child = spawn('wc');

// process.stdin.pipe(child.stdin)

// child.stdout.on('data', (data) => {
//   console.log(`child stdout:\n${data}`);
// });

// const http = require('http');
// const { fork } = require('child_process');

// const server = http.createServer();

// server.on('request', (req, res) => {
//   if (req.url === '/compute') {
//     const compute = fork('compute.js');
//     compute.send('start');
//     compute.on('message', sum => {
//       res.end(`Sum is ${sum}`);
//     });
//   } else {
//     res.end('Ok')
//   }
// });

// server.listen(3000);

// const execFile = require('child_process').execFile;

// const child = execFile('node', ['--version'], (error, stdout, stderr) => {

//     if (error) {

//         console.error('stderr', stderr);

//         throw error;

//     }

//     console.log('stdout', stdout);

// });

// const exec = require('child_process').exec;  
// exec('bash file.sh', (err, stdout, stderr) => {  
//   if (err) {  
//     console.error(err);  
//     return;  
//   }  
//   console.log(stdout);  
// });  

// console.log('heyyyyy')

// EXEC
// const fs = require('fs');  
// const child_process = require('child_process');  //require child
// for(var i=0; i<3; i++) {  
//     // 3x create child process and execute node support.js 
//    var workerProcess = child_process.exec('node support.js '+i,  
//       function (error, stdout, stderr) {  
//          if (error) {  
//             console.log(error.stack);  
//             console.log('Error code: '+error.code);  
//             console.log('Signal received: '+error.signal);  
//          }  
//          console.log('stdout: ' + stdout);  
//          if(stderr){
//             console.log('stderr: ' + stderr);  
//          }
         
//       });  
//       workerProcess.on('exit', function (code) {  
//       console.log('Child process exited with exit code '+code);  
//    });  
// }  


// //Spawn
// const fs = require('fs');  
// const child_process = require('child_process');  
//  for(var i=0; i<3; i++) {  
//    var workerProcess = child_process.spawn('node', ['support.js', i]);  
//   workerProcess.stdout.on('data', function (data) {  
//       console.log('stdout: ' + data);  
//    });  
//  workerProcess.stderr.on('data', function (data) {  
//       console.log('stderr: ' + data);  
//    });  
//  workerProcess.on('close', function (code) {  
//       console.log('child process exited with code ' + code);  
//    });  
// }  

const fs = require('fs');  
const child_process = require('child_process');  
 

// var obj = {
//   a:1,
//   b:2,
//   funn: console.log(this.a),
//   // myFun: (param) => {
//   //   console.log('Here: ',param)
//   //   //for(var i=0; i<3; i++) {  
//   //   var worker_process = child_process.fork("support.js", param);    
//   //   worker_process.on('close', function (code) {  
//   //     console.log('child process exited with code ' + code);  
//   //   });  
//   //  //}  
//   // }
// }

// var Rectangle = class {
//   constructor(a, b) {
//     this.a = a;
//     this.b = b;
//   }
//   fun(){
//     //console.log(typeof(this.a))
//     var worker_process = child_process.fork("support.js", [this.a]);
//       worker_process.on('close', function (code) {  
//         console.log('child process exited with code ' + code); 
//     });
//   }
// };

// rect = new Rectangle(10,10)
// rect.fun()
// //obj.myFun(this.a)

// const spawn = require('threads').spawn;
 

 
// console.log("START ##########################################")
// const thread = spawn(sayHi());
// thread
//   .on('exit', function() {
//     console.log('Worker has been terminated.');
//   });


// function sayHi(){
//   let i = 0
//   while(i < 100){
//     console.log("hi")
//     i++
//   }
// }

// console.log("END ##########################################")

var co = require('co');
 
co(function *(){
  // yield any promise
  var result = yield Promise.resolve(true);
}).catch(onerror);
 
co(function *(){
  // resolve multiple promises in parallel
  var a = Promise.resolve(1);
  var b = Promise.resolve(2);
  var c = Promise.resolve(3);
  var res = yield [a, b, c];
  console.log(res);
  // => [1, 2, 3]
}).catch(onerror);
 
// errors can be try/catched
// co(function *(){
//   try {
//     yield Promise.reject(new Error('boom'));
//   } catch (err) {
//     console.error(err.message); // "boom"
//  }
// }).catch(onerror);
 
function onerror(err) {
  // log any uncaught errors
  // co will not throw any errors you do not handle!!!
  // HANDLE ALL YOUR ERRORS!!!
  console.error(err.stack);
}