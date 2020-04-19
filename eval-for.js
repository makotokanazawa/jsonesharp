importScripts('interpreter.js');

self.onmessage = function(e) {

    var p = e.data[0];
    var regs = e.data[1];
    var pos = e.data[2];
    var steps = e.data[3];

    var t = 0;

    while (t < steps && 0 <= pos && pos < p.length) {
        pos = step(p, pos, regs);
        t++;
    };

    if (pos < 0 || p.length <= pos) {
        self.postMessage([pos, regs, true, t]);
        self.close();
    } else {
        self.postMessage([pos, regs, false, t]);
        self.close();
    };

//    self.close();
};
