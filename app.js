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

var sleep = require('sleep');

var q = async.queue(function(task, callback) {
  console.log(task.sleep);
  if (task.sleep)
    sleep.msleep(task.sleep);

  var path = './tmp/out.png';
  fs.writeFile(path, task.img, 'base64', function() {
    escpos.Image.load(path, function(image) {
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

});

q.drain = function() {
  // console.log('all items have been processed');
};

//

var TOTAL_TIME_MILLISECONDS = 5 * 24 * 60 * 60 * 1000;

fs.readFile('./letters-ifuf-1.json', function(err, data) {
  var json = JSON.parse(data);

  var total_time = 0;
  for (var i = 0, len = json.length; i < len; i++) {
    total_time += json[i].delay;
  }

  var SCALE_FACTOR = TOTAL_TIME_MILLISECONDS / total_time;

  for (var i = 0, len = json.length; i < len; i++) {
    setTimeout(function(i) {
      var sleepTime = Math.round(json[i].delay * SCALE_FACTOR);

      q.push({
        img: json[i].img,
        sleep: sleepTime
      });
    }.bind(null, i), 0);
  }

});
