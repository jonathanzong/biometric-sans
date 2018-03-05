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
  console.log(task);
  sleep.msleep(task.sleep);

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

var TOTAL_TIME_MILLISECONDS = 5 * 24 * 60 * 60 * 1000;

fs.readFile('./letters-ifuf-1.json', function(err, data) {
  var json = JSON.parse(data);
  var x = 0;

  var total_time = 0;
  for (var i = 0, len = json.length; i < len; i++) {
    total_time += json[i].delay;
  }

  var SCALE_FACTOR = TOTAL_TIME_MILLISECONDS / total_time;

  for (var i = 0, len = json.length; i < len; i++) {
    setTimeout(function(i) {
      var path = __dirname + '/tmp/out' + (x++) + '.png';
      if (x > 10000000) x = 0;

      var sleepTime = Math.round(json[i].delay * SCALE_FACTOR);

      fs.writeFile(path, json[i].img, 'base64', function() {
        q.push({
          path: path,
          sleep: sleepTime
        });
      });
    }.bind(null, i), 0);
  }

});
