var Set = require("collections/set");

var set = new Set();
console.log(set);
set.add([1,2,3]);
console.log(set);
set.add([4,5,6]);
console.log(set);
console.log(iterator(set));