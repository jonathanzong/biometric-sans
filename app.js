"use strict";

const escpos = require('escpos');

const find = escpos.USB.findPrinter()[0];
// Select the adapter based on your printer type
const device  = new escpos.USB(find.deviceDescriptor.idVendor,
                               find.deviceDescriptor.idProduct);

const printer = new escpos.Printer(device);

//

var fs = require('fs');

//

const express = require('express');
const app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

io.on('connection', function(client){
  client.on('word', function(data){
    var base64String = data.replace('data:image/png;base64,', '');
    fs.writeFileSync(__dirname + '/tmp/out.png', base64String, 'base64');

    // escpos.Image.load(__dirname + '/tmp/out.png', function(image) {
    //   device.open(function(){
    //     printer
    //     .align('ct')
    //     .raster(image)
    //     .flush();
    //   });
    // });

  });
});

app.use(express.static(__dirname));

server.listen(3000);
console.log('listening 3000')


//

