console.log('halt all lower priority nodes including this node:');
    this.halt(this.priority); //
    this.S.state = 'Election';
    console.log(`I am ${this.S.state}`);
    this.S.halt = this.priority;
    this.S.Up = [];
    for (let i = 0; i < this.priority; i++) {
        if (i != this.priority){
        	this.syncFuncCall("halt", this.connections[i], this.priority)
	        	.then(()=>{
	        		console.log(`Prompt: ${this.servers[i]} server halted successfully`);
	        	})
	        	.catch(()=>{
	        		console.log(`Prompt: ${this.servers[i]} Timeout 2, server not reachable, cannot halt`);
	        		// continue;
	        	})
	        	.finally(() =>{
	        		this.S.Up.push(this.connections[i]);
	        	});
        } else {
        	this.halt(this.priority);
        }
    }