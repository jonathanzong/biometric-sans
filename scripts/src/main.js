opentype.load('fonts/Roadline-Regular_gdi.ttf', function(err, font) {
  if (err) {
     alert('Font could not be loaded: ' + err);
} else {
    var dummy = document.getElementById('dummycanvas');
    var canvas = document.getElementById('canvas');
    var resize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.onresize = resize;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000'
    ctx.scale(0.5, 0.5);

    var cursorX = 0;
    var cursorY = 100;

    var i = 0;
    var charHandler = function(char, holdTime, delayTime) {
      if (char == 'Enter') {
        cursorX = 0;
        cursorY += 100;
        return;
      }
      if (char == ' ') {
        ctx.translate(45, 0);
        return;
      }
      if (char.length > 1) {
        console.log(char);
        return;
      }
      var glyph = font.charToGlyph(char.toUpperCase());

      var pathData = glyph.getPath().toPathData();

      var transformedPath = Snap.path.map(pathData,
                    new Snap.Matrix().scale(1 + delayTime / 1000, 1));

      var commands = Snap.path.toCubic(transformedPath);
      // var path = commandsToOpentypePath(commands);

      var newPathData = commands.toString();
      var bbox = Snap.path.getBBox(newPathData);

      cursorX += bbox.width;

      var p = new Path2D(newPathData);

      ctx.save();
      ctx.translate(cursorX - bbox.width, cursorY);
      ctx.fillStyle = 'rgba(0, 0, 0, ' + (1 - (holdTime / 1000)) + ')'
      ctx.fill(p);
      ctx.restore();


      // glyph.path = path;
      // glyph.draw(ctx, 18 * (i++), 100 + delayTime, holdTime);

    }

    processKeys(charHandler);
  }
});

function commandsToOpentypePath(commands) {
  var path = new opentype.Path();
  commands.forEach(function(command) {
    var type = command.shift();
    switch(type) {
      case 'M':
        path.moveTo.apply(path, command);
        break;
      case 'C':
        path.bezierCurveTo.apply(path, command);
        break;
      default:
        console.log('oh no, ' + type);
    }
  });
  path.close();

  return path;
}


function processKeys(charHandler) {

  var textarea = document.getElementById('textarea');

  var keysDownToHoldTime = {};
  var keysDownToDelayTime = {};
  var keysDownToChar = {};
  var lastKeyUpTime = 0;

  textarea.addEventListener('keydown', function(e) {
    keysDownToHoldTime[e.key] = now();
    keysDownToDelayTime[e.key] = lastKeyUpTime ? now() - lastKeyUpTime : 0;
  });

  textarea.addEventListener('keypress', function(e) {
    keysDownToChar[e.key] = e.key;
  });

  textarea.addEventListener('keyup', function(e) {
    lastKeyUpTime = now();

    var holdTime = lastKeyUpTime - keysDownToHoldTime[e.key];
    var delayTime = keysDownToDelayTime[e.key];
    var char = keysDownToChar[e.key];

    if (char) {
      if (delayTime > 5000) {
        delayTime = 0;
      }
      charHandler(char, holdTime, delayTime);
    }

    delete keysDownToHoldTime[e.key];
    delete keysDownToDelayTime[e.key];
    delete keysDownToChar[e.key];
  });



}

function now() {
  return +(new Date);
}
