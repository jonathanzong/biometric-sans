"use strict";
/*
const escpos = require('escpos');

const find = escpos.USB.findPrinter()[0];
// Select the adapter based on your printer type
const device  = new escpos.USB(find.deviceDescriptor.idVendor,
                               find.deviceDescriptor.idProduct);

const printer = new escpos.Printer(device);
*/
//

var fs = require('fs');

//

const express = require('express');
const app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);
var x = 0;
io.on('connection', function(client){
  client.on('word', function(data){
    var base64String = data.replace('data:image/png;base64,', '');
    fs.writeFileSync(__dirname + '/tmp/out' + (x++) + '.png', base64String, 'base64');
  });
});

app.use(express.static(__dirname));

server.listen(3000);
console.log('listening 3000')

//

    // svg2img(svgString, function(error, buffer) {
    //     //returns a Buffer
    //     fs.writeFileSync(__dirname + '/tmp/out.png', buffer);
    // });

//

// escpos.Image.load(__dirname + '/tmp/out.png', function(image){

//   console.log(image);

//   device.open(function(){

//     console.log('hi');

//     printer
//     .align('ct')
//     .raster(image)
//     .cut();

//     console.log('bye');

//   });

// });
