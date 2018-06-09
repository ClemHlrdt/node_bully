const fetch = require('node-fetch');
//npm install node-fetch

fetch('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => response.json())
  .then(json => {console.log(json)
    sayHi("Clément"); // function call
  })
  .catch((err) => bad())
  .finally(()=>{onFinally()});


function onFinally(){
    console.log('Finally')
}

//function def
function sayHi(name){
  console.log(`Hi ${name}`)
}

function bad(){
  console.log('Something went wrong here')
}