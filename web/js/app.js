// Set constraints for the video stream
var constraints = { video: { facingMode: "environment" }, audio: false };
var tracked_color = null;
var tracked_hue = null;

// Define constants
const cameraView = document.querySelector("#camera--view"),
      cameraShadow = document.querySelector("#camera--shadow"),
      cameraColorShadow = document.getElementById('camera--color-shaddow');
      cameraCtx = cameraShadow.getContext("2d"),
      cameraReset = document.querySelector("#camera--reset");

// Access the device camera and stream to cameraView
function cameraStart() {
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function(stream) {
            track = stream.getTracks()[0];
            cameraView.srcObject = stream;
            loop();
        })
        .catch(function(error) {
            console.error("Oops. Something is broken.", error);
        });
}

function RGBToHue(data) {
  let r = data[0]/255;
  let g = data[1]/255;
  let b = data[2]/255
  let min = Math.min(Math.min(r, g), b);
  let max = Math.max(Math.max(r, g), b);

  let delta = max-min;
  if (delta == 0) {
      // Hue is unknown; Not a color: Black, White or Gray
      return null;
  }

  let hue = 0;
  if (max == r) {
      hue = (g - b) / delta;

  } else if (max == g) {
      hue = 2.0 + (b - r) / delta;

  } else {
      hue = 4.0 + (r - g) / delta;
  }

  hue = hue * 60;
  if (hue < 0) hue = hue + 360;

  return Math.round(hue);
}


var limit = 15;
function grayScale(color) {
  let imgData = cameraCtx.getImageData(0, 0, cameraShadow.width, cameraShadow.height);
    let pixels  = imgData.data;
    for (var i = 0, n = pixels.length; i < n; i += 4) {
      let data = pixels.slice(i, i+3);
      let hue = RGBToHue(data);
      if(hue != null) {
        if(Math.abs(hue - tracked_hue) > limit) {
          let grayscale = pixels[i] * .3 + pixels[i+1] * .59 + pixels[i+2] * .11;
          pixels[i  ] = grayscale;
          pixels[i+1] = grayscale;
          pixels[i+2] = grayscale;
        }
      }
    }
    cameraCtx.putImageData(imgData, 0, 0);
}

function loop(){
  cameraCtx.save();
  cameraShadow.width = cameraView.videoWidth;
  cameraShadow.height = cameraView.videoHeight;
  cameraCtx.drawImage(cameraView, 0, 0);
  if(tracked_color) {
    grayScale(tracked_color);
  }
  if(tracked_hue) {
    grayScale(tracked_hue);
  }
  cameraCtx.restore();

  setTimeout(loop, 1000/30);
}

cameraReset.onclick = function(evt) {
  tracked_color = null;
  tracked_hue = null;
}


cameraShadow.onclick = function(evt) {
  let ctx = cameraColorShadow.getContext('2d');
  cameraColorShadow.width = cameraView.videoWidth;
  cameraColorShadow.height = cameraView.videoHeight;
  ctx.drawImage(cameraView, 0, 0);
  let scaleHeight = cameraShadow.offsetHeight/cameraView.videoHeight;
  let scaleWidth = cameraShadow.offsetWidth/cameraView.videoWidth;
  let scale = Math.max(scaleHeight, scaleWidth);
  // The following are depending on (0,0) while the image is centered
  let tmpX = Math.floor(evt.x / scale);
  let tmpY = Math.floor(evt.y / scale);

  // Ratio scale
  let sdw = scaleWidth/scale;
  let sdh = scaleHeight/scale;

  // Center of the camera view
  let ch = cameraShadow.offsetHeight/2;
  let cw = cameraShadow.offsetWidth/2;

  let x = cw-(sdw*cameraShadow.offsetWidth)/2 + tmpX;
  let y = ch-(sdh*cameraShadow.offsetHeight)/2 + tmpY;

  let imageData = ctx.getImageData(Math.floor(x), Math.floor(y), 1, 1);
  tracked_color = imageData.data;
  tracked_hue = RGBToHue(imageData.data);
}

window.addEventListener("load", cameraStart, false);

// Install ServiceWorker
if ('serviceWorker' in navigator) {
  console.log('CLIENT: service worker registration in progress.');
  navigator.serviceWorker.register( '/js/sw.js' , { scope : ' ' } ).then(function() {
    console.log('CLIENT: service worker registration complete.');
  }, function() {
    console.log('CLIENT: service worker registration failure.');
  });
} else {
  console.log('CLIENT: service worker is not supported.');
}

