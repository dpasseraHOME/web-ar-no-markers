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
    window.addEventListener('mouseup', handleReticleMouseUp);
    reticleElement.addEventListener('mousemove', handleReticleMouseMove);
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

    // navigator.getUserMedia(
 //        {video:true},
 //        function (stream){
 //            if (window.URL) {
 //                    videoElement.src = window.URL.createObjectURL(stream);
 //            } else if (videoElement.mozSrcObject !== undefined) {
 //                    videoElement.mozSrcObject = stream;
 //            } else {
 //                    videoElement.src = stream;
 //            }
 //        },
 //        function(error){
 //            console.log('XXX getUserMedia error');
 //            console.log(error);
 //        }
 //    );
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
    isMouseDownOnReticle = true;
}

function handleReticleMouseUp(e) {
    isMouseDownOnReticle = false;
}

function handleReticleMouseMove(e) {
    if(isMouseDownOnReticle) {
        var style = window.getComputedStyle(reticleElement, null);

        reticleElement.style.height = parseInt(style.getPropertyValue('height')) + e.movementY + 'px';
        reticleElement.style.width = parseInt(style.getPropertyValue('width')) + e.movementY + 'px';
    }
}

function handleConfirmScale(e) {
    reticleElement.removeEventListener('mousedown', handleReticleMouseDown);
    window.removeEventListener('mouseup', handleReticleMouseUp);
    reticleElement.removeEventListener('mousemove', handleReticleMouseMove);

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
            // console.log('gn start');
            // console.log(data.do.alpha + " : " + data.do.beta + " : " + data.do.gamma + " : " + data.do.absolute);
            debugText.innerHTML = data.do.alpha + " : " + data.do.beta + " : " + data.do.gamma + " : " + data.do.absolute;
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