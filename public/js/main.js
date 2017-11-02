var MARKER_INCHES = 6;

var isMouseDownOnReticle = false;
var lastYValue = -1;

var videoSelect;
var videoElement;
var reticleElement;
var debugText;
var cameraElement;

var gn;

function init() {
	console.log("# init");

    initVideo();

    debugText = document.getElementById('debugText');
    
    reticleElement = document.getElementById('reticle');

    reticleElement.addEventListener('mousedown', onReticleMouseDown);
    reticleElement.addEventListener('mousemove', onReticleMouseMove);
    window.addEventListener('mouseup', onReticleMouseUp);

    reticleElement.addEventListener('touchstart', onReticleTouchStart);
    reticleElement.addEventListener('touchmove', onReticleTouchMove, false);
    reticleElement.addEventListener('touchend', onReticleTouchEnd);

    document.getElementById('confirmScale').addEventListener('click', onConfirmScale);
}

function initVideo() {
    navigator.getUserMedia = (navigator.getUserMedia ||
                                navigator.webkitGetUserMedia ||
                                navigator.mozGetUserMedia || 
                                navigator.msGetUserMedia);

    videoElement = document.getElementById("camera-stream");
    videoSelect = document.querySelector('select#videoSource');

    navigator.mediaDevices.enumerateDevices()
        .then(gotDevices).then(getStream).catch(onError);

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
    then(gotStream).catch(onError);
}

function gotStream(stream) {
    window.stream = stream; // make stream available to console
    videoElement.srcObject = stream;
}

function onError(error) {
    console.log('Error: ', error);
}

function onReticleMouseDown(e) {
    e.preventDefault();
    debugText.innerHTML = 'onReticleMouseDown';
    isMouseDownOnReticle = true;
}

function onReticleMouseUp(e) {
    e.preventDefault();
    debugText.innerHTML = 'onReticleMouseUp';
    isMouseDownOnReticle = false;
}

function onReticleMouseMove(e) {
    e.preventDefault();
    debugText.innerHTML = 'onReticleMouseMove : '+e.movementY;
    if(isMouseDownOnReticle) {
        var style = window.getComputedStyle(reticleElement, null);

        reticleElement.style.height = parseInt(style.getPropertyValue('height')) + e.movementY + 'px';
        reticleElement.style.width = parseInt(style.getPropertyValue('width')) + e.movementY + 'px';
    }
}

function onReticleTouchStart(e) {
    e.preventDefault();
    debugText.innerHTML = 'onReticleTouchStart';
}

function onReticleTouchMove(e) {
    e.preventDefault();
    debugText.innerHTML = 'onReticleTouchMove : '+e.changedTouches[0].pageY;

    if(lastYValue > -1) {
        var dY = e.changedTouches[0].pageY - lastYValue;

        var style = window.getComputedStyle(reticleElement, null);

        reticleElement.style.height = parseInt(style.getPropertyValue('height')) + dY + 'px';
        reticleElement.style.width = parseInt(style.getPropertyValue('width')) + dY + 'px';
    }

    lastYValue = e.changedTouches[0].pageY;
}

function onReticleTouchEnd(e) {
    e.preventDefault();
    debugText.innerHTML = 'onReticleTouchEnd';
}

function onConfirmScale(e) {
    reticleElement.removeEventListener('mousedown', onReticleMouseDown);
    window.removeEventListener('mouseup', onReticleMouseUp);
    reticleElement.removeEventListener('mousemove', onReticleMouseMove);

    reticleElement.removeEventListener('touchstart', onReticleTouchStart);
    reticleElement.removeEventListener('touchmove', onReticleTouchMove);
    reticleElement.removeEventListener('touchend', onReticleTouchEnd);

    var bConfirm = document.getElementById('confirmScale');
    bConfirm.removeEventListener('click', onConfirmScale);
    bConfirm.style.visibility = "hidden";

    videoSelect.style.visibility = "hidden";

    var dpi = getScreenDPI();
    var style = window.getComputedStyle(reticleElement, null);
    var apparentWidth = parseInt(style.width) / dpi;
    console.log('marker apparent size = ' + apparentWidth + 'inches');

    initGyro();
    initScene();
}

function initGyro() {
    console.log ('* initGyro');
    gn = new GyroNorm();

    gn.init().then(function() {
        gn.start(function(data){
            onDeviceMove(data);
        })
    }).catch(function(e){
        alert('DeviceOrientation or DeviceMotion is not supported by the browser or device');
    }); 
}

function initScene() {
    var scene = document.getElementById('scene');
    scene.classList.remove('hidden');

    cameraElement = document.getElementById('camera');
}

function onDeviceMove(data) {
    debugText.innerHTML = data.do.alpha + " : " + data.do.beta + " : " + data.do.gamma + " : " + data.do.absolute + "\n" + data.dm.x + " : " + data.dm.y + " : " + data.dm.z;
    // camera.setAttribute('rotation', {x: data.do.alpha, y: data.do.beta, z: data.do.gamma});
}

function getScreenDPI() {
    var devicePixelRatio = window.devicePixelRatio || 1;
    dpi_x = document.getElementById('dpiMeasure').offsetWidth * devicePixelRatio;
    dpi_y = document.getElementById('dpiMeasure').offsetHeight * devicePixelRatio;

    console.log(dpi_x+", "+dpi_y);

    return dpi_x;
}