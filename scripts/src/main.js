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

    var lineHeight = 100;
    var spaceWidth = 45;

    var renderedChars = [];

    var renderChar = function(charToRender) {
      if (charToRender.pathData) {
        var p = new Path2D(charToRender.pathData);

        ctx.save();
        ctx.translate(charToRender.x, charToRender.y);
        ctx.fillStyle = 'rgba(0, 0, 0, ' + (1 - (charToRender.holdTime / 1000)) + ')'
        ctx.fill(p);
        ctx.restore();
      }
    }

    var redraw = function() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderedChars.forEach(function(charToRender) {
        renderChar(charToRender);
        // console.log(charToRender.x + " " + charToRender.y);
      });
    }

    var charHandler = function(char, holdTime, delayTime) {
      if (char == 'Enter') {
        var cursorY = lineHeight;
        if (renderedChars.length) {
          cursorY = renderedChars[renderedChars.length - 1].y;
        }
        renderedChars.push({
          bbox: { width: 0 },
          x: 0,
          y: cursorY + lineHeight
        });
        return;
      }
      if (char == ' ') {
        var cursorX = 0;
        var cursorY = lineHeight;
        if (renderedChars.length) {
          cursorX = renderedChars[renderedChars.length - 1].x +
                    renderedChars[renderedChars.length - 1].bbox.width;
          cursorY = renderedChars[renderedChars.length - 1].y;
        }
        renderedChars.push({
          bbox: { width: spaceWidth },
          x: cursorX,
          y: cursorY
        });
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

      // var commands = Snap.path.toCubic(transformedPath);
      // var path = commandsToOpentypePath(commands);

      // var newPathData = commands.toString();
      var newPathData = transformedPath;

      var bbox = Snap.path.getBBox(newPathData);

      var charToRender = {
        // commands: commands,
        pathData: newPathData,
        bbox: bbox,
        delayTime: delayTime,
        holdTime: holdTime
      }

      var cursorX = 0;
      var cursorY = lineHeight;
      if (renderedChars.length) {
        cursorX = renderedChars[renderedChars.length - 1].x +
        renderedChars[renderedChars.length - 1].bbox.width;
        cursorY = renderedChars[renderedChars.length - 1].y;
      }
      charToRender.x = cursorX;
      charToRender.y = cursorY;

      renderedChars.push(charToRender);

      redraw();
    }

    var backspace = function() {
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
