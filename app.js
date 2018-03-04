"use strict";

var fs = require('fs');
var async = require('async');

var json_path = __dirname + '/tmp/letters.json';

fs.writeFile(json_path, "[]", { flag: 'wx' }, function (err) {});

var q = async.queue(function(task, callback) {
  // append new letter
  fs.readFile(json_path, function (err, data) {
    var json = JSON.parse(data);
    json.push(task);

    fs.writeFile(json_path, JSON.stringify(json, null, 2), function(){
      callback();
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
  client.on('letter', function(data){
    var base64String = data.img.replace('data:image/png;base64,', '');

    q.push({
      img: base64String,
      delay: data.delay
    });

  });
});

app.use(express.static(__dirname));

server.listen(3000);
console.log('listening 3000')


//
