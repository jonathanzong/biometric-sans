"use strict";

const escpos = require('escpos');

const find = escpos.USB.findPrinter()[0];
// Select the adapter based on your printer type
const device  = new escpos.USB(find.deviceDescriptor.idVendor,
                               find.deviceDescriptor.idProduct);

const printer = new escpos.Printer(device);

//

var fs = require('fs');
var async = require('async');

var q = async.queue(function(task, callback) {
  escpos.Image.load(task.path, function(image) {
    device.open(function(){
      printer
      .align('ct')
      .image(image)
      .flush(function() {
        callback();
      });
    });
  });
});

q.drain = function() {
  // console.log('all items have been processed');
};

//

const express = require('express');
const app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var x = 0;

io.on('connection', function(client){
  client.on('word', function(data){
    var base64String = data.replace('data:image/png;base64,', '');

    var path = __dirname + '/tmp/out' + (x++) + '.png';
    if (x > 10000000) x = 0;

    fs.writeFile(path, base64String, 'base64', function() {
      q.push({path: path});
    });

  });
});

app.use(express.static(__dirname));

server.listen(3000);
console.log('listening 3000')


//

