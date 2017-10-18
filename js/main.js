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
}