opentype.load('fonts/Roadline-Regular_gdi.ttf', function(err, font) {
  if (err) {
     alert('Font could not be loaded: ' + err);
} else {
    var dummy = document.getElementById('dummycanvas');
    var canvas = document.getElementById('canvas');

    var ctx = canvas.getContext('2d');
    ctx.scale(0.5, 0.5);

    var lineHeight = 100;
    var spaceWidth = 45;

    var renderedChars = [];
    var backspaceCount = 0;

    var renderChar = function(charToRender) {
      if (charToRender.pathData) {
        var p = new Path2D(charToRender.pathData);

        ctx.save();
        ctx.translate(charToRender.x, charToRender.y);
        if (charToRender.fill) {
          ctx.fillStyle = 'rgba(0, 0, 0, ' + (1 - Math.min(0.9, charToRender.holdTime / 1000)) + ')'
          ctx.fill(p);
        }
        else {
          ctx.lineWidth = 0.5;
          ctx.strokeStyle = 'rgba(0, 0, 0, ' + (1 - Math.min(0.9, charToRender.holdTime / 1000)) + ')'
          ctx.stroke(p);
        }
        ctx.restore();
      }
    }

    var redraw = function() {
      console.log(renderedChars)
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderedChars.forEach(function(charToRender) {
        renderChar(charToRender);
        // console.log(charToRender.x + " " + charToRender.y);
      });
    }

    var resize = function() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      redraw();
    };
    resize();
    window.onresize = resize;

    var charHandler = function(char, holdTime, delayTime) {
      var isBackspace = backspaceCount > 0;
      if (isBackspace) {
        backspaceCount--;
      }
      if (char == 'Enter') {
        var cursorY = lineHeight;
        if (renderedChars.length) {
          cursorY = renderedChars[renderedChars.length - 1].y;
        }
        renderedChars.push({
          advanceWidth: 0,
          x: 0,
          y: cursorY + lineHeight
        });
        return;
      }
      // if (char == ' ') {
      //   var cursorX = 0;
      //   var cursorY = lineHeight;
      //   if (renderedChars.length) {
      //     cursorX = renderedChars[renderedChars.length - 1].x +
      //               renderedChars[renderedChars.length - 1].advanceWidth;
      //     cursorY = renderedChars[renderedChars.length - 1].y;
      //   }
      //   renderedChars.push({
      //     advanceWidth: spaceWidth,
      //     x: cursorX,
      //     y: cursorY
      //   });
      //   return;
      // }
      if (char.length > 1) {
        console.log(char);
        return;
      }

      var s = char.toUpperCase();
      var glyph = font.charToGlyph(s);
      var pathData = glyph.getPath().toPathData();

      var xScaleFactor = 1 + delayTime / 1000;

      var transformedPath = Snap.path.map(pathData,
                    new Snap.Matrix().scale(xScaleFactor, 1));

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
        fill: !isBackspace,
      }

      var cursorX = 0;
      var cursorY = lineHeight;
      if (renderedChars.length) {
        cursorX = renderedChars[renderedChars.length - 1].x +
        renderedChars[renderedChars.length - 1].advanceWidth;
        cursorY = renderedChars[renderedChars.length - 1].y;
      }
      charToRender.x = cursorX;
      charToRender.y = cursorY;

      renderedChars.push(charToRender);

      redraw();
    }

    var backspace = function() {
      backspaceCount++;
      renderedChars.pop();
      redraw();
    }

    processKeys(charHandler, backspace);
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


function processKeys(charHandler, backspace) {

  var textarea = document.getElementById('textarea');
  textarea.focus();

  var wrapper = document.getElementById('canvas-text-editor');
  wrapper.addEventListener('focus', function(e) {
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
