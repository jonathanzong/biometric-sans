opentype.load('fonts/cmunss.ttf', function(err, font) {
  if (err) {
     alert('Font could not be loaded: ' + err);
} else {
    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');

    processKeys();

    font.charToGlyph()
  }
});


function processKeys() {

  var textarea = document.getElementById('textarea');

  var keysDownToHoldTime = {};
  var keysDownToDelayTime = {};
  var keysDownToChar = {};
  var lastKeyUpTime = now();

  textarea.addEventListener('keydown', function(e) {
    keysDownToHoldTime[e.key] = now();
    keysDownToDelayTime[e.key] = now() - lastKeyUpTime;
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
      console.log(char + ' ' + holdTime + ' ' + delayTime);
    }

    delete keysDownToHoldTime[e.key];
    delete keysDownToDelayTime[e.key];
    delete keysDownToChar[e.key];
  });



}

function now() {
  return +(new Date);
}
