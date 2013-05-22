define(['jquery','underscore','promise'], function(jquery, underscore, promise) {
	function JsWebcam() {
		this.video.width = 640;
		this.video.height = 480;
	}

	var getUserMedia = navigator[_.detect(['getUserMedia','webkitGetUserMedia'], function(key) {
		return key in navigator;
	})].bind(navigator);

	JsWebcam.prototype = {

		$container: null,
		video: document.createElement('video'),
		canvas: document.createElement('canvas'),
		isPlaying: false,
		
		requestWebcam: function() {
			var df = promise.defer();
			getUserMedia({ video: true }, _.bind(df.resolve, df), _.bind(df.reject, df));
			return df.promise;
		},

		setVideoStream: function(stream) {
			this.video.src = window.URL.createObjectURL(stream);
		},

		play: function() {
			return this.requestWebcam()
				.then(_.bind(this.setVideoStream, this))
				.then(_.bind(function() {
					this.video.play();
					this.isPlaying = true;
				}, this));
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
			this.video.play();
			img.src = this.canvas.toDataURL('image/png');
			return img;
		},

		picture: function() {
			var df = promise.defer();
			if (this.isPlaying) {
				df.resolve(this.screenshot());
			}
			else {
				$(this.video).one('timeupdate', _.bind(function() {
					df.resolve(this.screenshot());
					this.stop();
				}, this));
				this.play().fail(_.bind(df.reject, df));
			}
			return df.promise;
		}
	};

	return JsWebcam;

});	
