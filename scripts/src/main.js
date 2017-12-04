opentype.load('fonts/Roadline-Regular_gdi.ttf', function(err, font) {
  if (err) {
     alert('Font could not be loaded: ' + err);
} else {
    var s = Snap('#svg');

    var lineHeight = 100;

    var charsToRender = [];

    function renderChar(charToRender) {
      if (charToRender.pathData) {
        var g = s.group(s.path({
         path: charToRender.pathData,
         fill: '#bada55',
         stroke: '#c00',
         strokeWidth: 0,
         strokeLinecap: 'round',
        }));
        g.attr('transform', 'translate(' + charToRender.x + ', ' + charToRender.y + ')');
      }
    }

    function draw() {
      s.clear();
      for (var i = 0, len = charsToRender.length; i < len; i++) {
        renderChar(charsToRender[i]);
      }
      window.requestAnimationFrame(draw);
    }
    window.requestAnimationFrame(draw);

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

      var s = char.toUpperCase();
      var glyph = font.charToGlyph(s);
      var pathData = glyph.getPath().toPathData();

      var xScaleFactor = 0.5 + delayTime / 300;

      var advanceWidth = font.getAdvanceWidth(s) * xScaleFactor;

      var charToRender = {
        glyph: glyph,
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

      var transformedPath = Snap.path.map(pathData,
                    new Snap.Matrix()
                            .scale(xScaleFactor, 1));

      charToRender.pathData = transformedPath;

      charsToRender.push(charToRender);
    }

    var backspace = function() {
      var deleted = charsToRender.pop();
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

  var wrapper = document.getElementById('text-editor');
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
