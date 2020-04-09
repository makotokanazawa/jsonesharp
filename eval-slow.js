importScripts('interpreter.js');

self.onmessage = function(e) {

    var p = e.data[0];
    var regs = e.data[1];
    var t = e.data[2];
    var pos = 0;
    var new_pos = 0;
    var n_steps = 0;

    var eval_loop = setInterval(function() {
        new_pos = step(p, pos, regs);
        n_steps++;
//	    if (new_pos == pos) {
        if (new_pos < 0 || p.length <= new_pos) {
	        clearInterval(eval_loop);
//	        self.postMessage([pos, regs, true]);
            self.postMessage([new_pos, regs, true, n_steps]);
	        self.close();
        }
//	    self.postMessage([pos, regs, false]);
        self.postMessage([new_pos, regs, false, n_steps]);
        pos = new_pos;
    }, t);
};
