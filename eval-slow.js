importScripts('interpreter.js');

self.onmessage = function(e) {

    var p = e.data[0];
    var regs = e.data[1];
    var pos = e.data[2];
    var n_steps = e.data[3];
    var t = e.data[4];
//    var new_pos = pos;

    var eval_loop = setInterval(function() {
//        new_pos = step(p, pos, regs);
        pos = step(p, pos, regs);
        n_steps++;
//	    if (new_pos == pos) {
//        if (new_pos < 0 || p.length <= new_pos) {
        if (pos < 0 || p.length <= pos) {
	        clearInterval(eval_loop);
//	        self.postMessage([pos, regs, true]);
//            self.postMessage([new_pos, regs, true, n_steps]);
            self.postMessage([pos, regs, true, n_steps]);
	        self.close();
        };
//	    self.postMessage([pos, regs, false]);
//        self.postMessage([new_pos, regs, false, n_steps]);
        self.postMessage([pos, regs, false, n_steps]);
//        pos = new_pos;
    }, t);
};
