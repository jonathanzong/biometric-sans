opentype.load('fonts/CDType - Dense Bold.otf', function(err, font) {
  if (err) {
     alert('Font could not be loaded: ' + err);
} else {
    var dummy = document.getElementById('dummycanvas');
    var canvas = document.getElementById('canvas');

    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.scale(0.5, 0.5);
    ctx.fillStyle = "#000";

    var lineHeight = 100;

    var charsToRender = [];

    function renderChar(charToRender) {
      if (charToRender.pathData) {
        var p = new Path2D(charToRender.pathData);

        ctx.save();
        ctx.translate(charToRender.x, charToRender.y);
        ctx.fillStyle = "#000";
        ctx.fill(p);
        ctx.restore();
      }
    }

    function onCharHandler(char, holdTime, delayTime) {
      if (char == 'Enter') {
        var cursorY = lineHeight;
        if (charsToRender.length) {
          cursorY = charsToRender[charsToRender.length - 1].y;
        }
        charsToRender.push({
          advanceWidth: 0,
          x: 0,
          y: cursorY + lineHeight
        });
        return;
      }
      if (char.length > 1) {
        console.log('oh no,' + char);
        return;
      }

      var s = char//.toUpperCase();
      var glyph = font.charToGlyph(s);
      var pathData = glyph.getPath().toPathData();

      var xScaleFactor = 1 + delayTime / 400;
      // var yScaleFactor = 1 - holdTime / 500;
      // if (yScaleFactor < 0.1) yScaleFactor = 0.1;
      var yScaleFactor = 1;

      var transformedPath = Snap.path.map(pathData,
                    new Snap.Matrix().scale(xScaleFactor, yScaleFactor));

      // var commands = Snap.path.toCubic(transformedPath);
      // var path = commandsToOpentypePath(commands);

      // var newPathData = commands.toString();
      var newPathData = transformedPath;

      var advanceWidth = font.getAdvanceWidth(s) * xScaleFactor;

      var charToRender = {
        // commands: commands,
        glyph: glyph,
        pathData: newPathData,
        advanceWidth: advanceWidth,
        delayTime: delayTime,
        holdTime: holdTime,
      }

      var cursorX = 0;
      var cursorY = lineHeight;
      if (charsToRender.length) {
        cursorX = charsToRender[charsToRender.length - 1].x +
        charsToRender[charsToRender.length - 1].advanceWidth;
        cursorY = charsToRender[charsToRender.length - 1].y;
      }
      charToRender.x = cursorX;
      charToRender.y = cursorY;

      charsToRender.push(charToRender);

      renderChar(charToRender);
    }

    var backspace = function() {
      var deleted = charsToRender.pop();
      ctx.fillStyle = '#fff';
      ctx.fillRect(deleted.x, deleted.y - lineHeight * 0.8, deleted.advanceWidth, lineHeight * 1.2)
    }

    processKeys(onCharHandler, backspace);
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


function processKeys(onCharHandler, backspace) {

  var textarea = document.getElementById('textarea');
  textarea.focus();

  var wrapper = document.getElementById('canvas-text-editor');
  wrapper.addEventListener('focus', function(e) {
    textarea.focus();
  });
  window.addEventListener('focus', function(e) {
    textarea.focus();
  });

  var keysDownToHoldTime = {};
  var keysDownToDelayTime = {};
  var keysDownToChar = {};
  var lastKeyUpTime = 0;

  textarea.addEventListener('keydown', function(e) {
    keysDownToHoldTime[e.key] = now();
    keysDownToDelayTime[e.key] = lastKeyUpTime ? now() - lastKeyUpTime : 0;
    if (e.key == 'Backspace') {
      backspace();
    }
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
      onCharHandler(char, holdTime, delayTime);
    }

    delete keysDownToHoldTime[e.key];
    delete keysDownToDelayTime[e.key];
    delete keysDownToChar[e.key];
  });



}

function now() {
  return +(new Date);
}
