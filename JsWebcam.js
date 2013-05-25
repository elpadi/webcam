define(['jquery','underscore','promise'], function(jquery, underscore, promise) {
	function JsWebcam() {
		this.options = { video: true };
	}

	var userMediaKey = _.detect(['getUserMedia','webkitGetUserMedia','mozGetUserMedia','msGetUserMedia'], function(key) {
		return key in navigator;
	});
	var getUserMedia = userMediaKey ? navigator[userMediaKey].bind(navigator) : function() {};
	var URL = window[_.detect(['URL','webkitURL','msURL'], function(key) {
		return key in window;
	})];

	JsWebcam.prototype = {

		$container: null,
		video: document.createElement('video'),
		canvas: document.createElement('canvas'),
		options: null,
		
		requestWebcam: function(df) {
			getUserMedia(this.options, _.bind(df.resolve, df), _.bind(df.reject, df));
		},

		setVideoStream: function(stream) {
			if (this.video.mozSrcObject !== undefined) {
				this.video.mozSrcObject = stream;
			}
			else {
				this.video.src = URL.createObjectURL(stream);
			}
		},

		stop: function() {
			this.video.pause();
			this.video.removeAttribute('src');
		},

		screenshot: function() {
			var img = new Image();
			this.canvas.width = this.video.width;
			this.canvas.height = this.video.height;
			this.canvas.getContext('2d').drawImage(this.video, 0, 0);
			img.src = this.canvas.toDataURL('image/png');
			return img;
		},

		picture: function(df) {
			var triesLeft = 3;
			var image;
			var screenshot = _.bind(function() {
				try {
					image = this.screenshot();
					df.resolve(image);
				}
				catch (e) {
					triesLeft--;
					if (triesLeft > 0) {
						setTimeout(screenshot, 5000);
					}
					else {
						df.reject(e);
					}
				}
			}, this);
			setTimeout(screenshot, 1000);
		}
	};

	return JsWebcam;

});	
