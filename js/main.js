var isMouseDownOnReticle = false;
var reticleElement;

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

    reticleElement = document.getElementById('reticle');

    reticleElement.addEventListener('mousedown', function() {
        isMouseDownOnReticle = true;
    });

    window.addEventListener('mouseup', function() {
        isMouseDownOnReticle = false;
    });

    reticleElement.addEventListener('mousemove', function(e) {
        if(isMouseDownOnReticle) {
            handleReticleMouseMove(e);
        }
    });
}

function handleReticleMouseMove(e) {
    var style = window.getComputedStyle(reticleElement, null);

    reticleElement.style.height = parseInt(style.getPropertyValue('height')) + e.movementY + 'px';
    reticleElement.style.width = parseInt(style.getPropertyValue('width')) + e.movementY + 'px';
}