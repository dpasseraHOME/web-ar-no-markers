var MARKER_INCHES = 6;

var isMouseDownOnReticle = false;

var videoSelect;
var videoElement;
var reticleElement;
var debugText;

var gn;

function init() {
	console.log("# init");

    initVideo();

    debugText = document.getElementById('debugText');
    
    initGyro();

    reticleElement = document.getElementById('reticle');

    reticleElement.addEventListener('mousedown', handleReticleMouseDown);
    reticleElement.addEventListener('mousemove', handleReticleMouseMove);
    window.addEventListener('mouseup', handleReticleMouseUp);

    reticleElement.addEventListener('touchstart', handleReticleTouchStart);
    reticleElement.addEventListener('touchmove', handleReticleTouchMove, false);
    reticleElement.addEventListener('touchend', handleReticleTouchEnd);

    document.getElementById('confirmScale').addEventListener('click', handleConfirmScale);
}

function initVideo() {
    navigator.getUserMedia = (navigator.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia || 
                                navigator.msGetUserMedia);

    videoElement = document.getElementById("camera-stream");
    videoSelect = document.querySelector('select#videoSource');

    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices).then(getStream).catch(handleError);

    videoSelect.onchange = getStream;
}

function gotDevices(deviceInfos) {
    for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i];
        var option = document.createElement('option');

        option.value = deviceInfo.deviceId;

        if (deviceInfo.kind === 'videoinput') {
          option.text = deviceInfo.label || 'camera ' +
            (videoSelect.length + 1);
          videoSelect.appendChild(option);
        } else {
          console.log('Found ome other kind of source/device: ', deviceInfo);
        }
    }
}

function getStream() {
    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
          track.stop();
        });
    }

    var constraints = {
        video: {
          optional: [{
            sourceId: videoSelect.value
          }]
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).
    then(gotStream).catch(handleError);
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
}

function handleError(error) {
    console.log('Error: ', error);
}

function handleReticleMouseDown(e) {
    e.preventDefault();
    debugText.innerHTML = 'handleReticleMouseDown';
    isMouseDownOnReticle = true;
}

function handleReticleMouseUp(e) {
    e.preventDefault();
    debugText.innerHTML = 'handleReticleMouseUp';
    isMouseDownOnReticle = false;
}

function handleReticleMouseMove(e) {
    e.preventDefault();
    debugText.innerHTML = 'handleReticleMouseMove : '+e.movementY;
    if(isMouseDownOnReticle) {
        var style = window.getComputedStyle(reticleElement, null);

        reticleElement.style.height = parseInt(style.getPropertyValue('height')) + e.movementY + 'px';
        reticleElement.style.width = parseInt(style.getPropertyValue('width')) + e.movementY + 'px';
    }
}

function handleReticleTouchStart(e) {
    e.preventDefault();
    debugText.innerHTML = 'handleReticleTouchStart';
}

function handleReticleTouchMove(e) {
    e.preventDefault();
    debugText.innerHTML = 'handleReticleTouchMove : '+evt.changedTouches[0].pageY;

}

function handleReticleTouchEnd(e) {
    e.preventDefault();
    debugText.innerHTML = 'handleReticleTouchEnd';
}

function handleConfirmScale(e) {
    reticleElement.removeEventListener('mousedown', handleReticleMouseDown);
    window.removeEventListener('mouseup', handleReticleMouseUp);
    reticleElement.removeEventListener('mousemove', handleReticleMouseMove);

    reticleElement.removeEventListener('touchstart', handleReticleTouchStart);
    reticleElement.removeEventListener('touchmove', handleReticleTouchMove);
    reticleElement.removeEventListener('touchend', handleReticleTouchEnd);

    var bConfirm = document.getElementById('confirmScale');
    bConfirm.removeEventListener('click', handleConfirmScale);
    bConfirm.style.visibility = "hidden";

    var dpi = getScreenDPI();
    var style = window.getComputedStyle(reticleElement, null);
    var apparentWidth = parseInt(style.width) / dpi;
    console.log('marker apparent size = ' + apparentWidth + 'inches');
}

function initGyro() {
    gn = new GyroNorm();

    gn.init().then(function() {
        gn.start(function(data){
            // debugText.innerHTML = data.do.alpha + " : " + data.do.beta + " : " + data.do.gamma + " : " + data.do.absolute;
        })
    }).catch(function(e){
        alert('DeviceOrientation or DeviceMotion is not supported by the browser or device');
    }); 
}

function getScreenDPI() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    dpi_x = document.getElementById('dpiMeasure').offsetWidth * devicePixelRatio;
    dpi_y = document.getElementById('dpiMeasure').offsetHeight * devicePixelRatio;

    console.log(dpi_x+", "+dpi_y);

    return dpi_x;
}