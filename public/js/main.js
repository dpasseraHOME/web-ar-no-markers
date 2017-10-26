var MARKER_INCHES = 6;

var isMouseDownOnReticle = false;
var reticleElement;
var debugText;
var gn;

function init() {
	console.log("# init");

	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

	var videoElement = document.getElementById("camera-stream");

	navigator.getUserMedia({video:true}, function (stream){
            if (window.URL) {
                    videoElement.src = window.URL.createObjectURL(stream);
            } else if (videoElement.mozSrcObject !== undefined) {
                    videoElement.mozSrcObject = stream;
            } else {
                    videoElement.src = stream;
            }
        },
        function(error){
        }
    );

    debugText = document.getElementById('debugText');
    
    initGyro();

    reticleElement = document.getElementById('reticle');

    reticleElement.addEventListener('mousedown', handleReticleMouseDown);
    window.addEventListener('mouseup', handleReticleMouseUp);
    reticleElement.addEventListener('mousemove', handleReticleMouseMove);
    document.getElementById('confirmScale').addEventListener('click', handleConfirmScale);
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