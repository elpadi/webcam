define(['jquery','underscore','promise'], function(jquery, underscore, promise) {
	function JsWebcam() {
		this.options = { video: true };
		this.$videoContainer.append(this.video);
	}

	var userMediaKey = _.detect(['getUserMedia','webkitGetUserMedia','mozGetUserMedia','msGetUserMedia'], function(key) {
		return key in navigator;
	});
	var getUserMedia = userMediaKey ? navigator[userMediaKey].bind(navigator) : function() {};
	var URL = window[_.detect(['URL','webkitURL','msURL'], function(key) {
		return key in window;
	})];

	JsWebcam.prototype = {

		video: document.createElement('video'),
		stream: null,
		type: 'js',
		
		setDimensions: function(width, height) {
			this.video.width = width;
			this.video.height = height;
		},

		requestWebcam: function(df) {
			getUserMedia(this.options, _.bind(df.resolve, df), _.bind(df.reject, df));
			df.promise.then(_.bind(this.setVideoStream, this));
		},

		setVideoStream: function(stream) {
			this.stream = stream;
			if (this.video.mozSrcObject !== undefined) {
				this.video.mozSrcObject = this.stream;
			}
			else {
				this.video.src = URL.createObjectURL(this.stream);
			}
		},

		stop: function() {
			this.video.pause();
			this.stream && this.stream.stop();
			this.video.removeAttribute('src');
			if (this.video.mozSrcObject !== undefined) {
				this.video.mozSrcObject && delete this.video.mozSrcObject;
			}
			else {
				this.stream && URL.revokeObjectURL(this.stream);
			}
		},

		screenshot: function() {
			var img = new Image();
			this.canvas.width = this.video.videoWidth;
			this.canvas.height = this.video.videoHeight;
			this.canvas.getContext('2d').drawImage(this.video, 0, 0);
			img.src = this.canvas.toDataURL('image/png');
			return img;
		},

		pause: function() {
			this.video.pause();
		},

		play: function() {
			this.video.play();
		},

		takePicture: function(df) {
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
			this.video.play();
			setTimeout(screenshot, 1000);
		}
	};

	return JsWebcam;

});	
