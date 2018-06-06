const fileSystems = require('fs');
const cld_proc = require('child_process');

for(var i=1; i<=5; i++) {
   var parentproc = cld_proc.exec('node child.js '+i,function 
      (error, stdout, stderr) {
      
      if (error) {
         console.log(error.stack);
         console.log('Error Code: '+error.code);
         console.log('Reason of error: '+error.signal);
      }
      console.log('Stdout value: ' + stdout);
      console.log('Stderror value: ' + stderr);
   });

   parentproc.on('exit', function (code) {
      console.log('Child process is exiting with exit code: '+code);
   });
}