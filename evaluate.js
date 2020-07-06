importScripts('interpreter.js');

self.onmessage = function(e) {

    var p = e.data[0];
    var regs = e.data[1];
//    var pos = onesharp(p, regs);
    var result = onesharp(p, regs);

//    self.postMessage([pos, regs]);
    self.postMessage([result[0], regs, result[1]]);
    self.close();
};
