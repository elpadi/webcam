define(['jquery','underscore','promise','getUserMedia'], function(jquery, underscore, promise, getUserMedia) {

	function FlashWebcam() {
		this.$container.addClass('webcam--flash');
		this.$videoContainer.attr('id', 'flash-video-container');
		this.options = {
			width: this.$container.width(),
			height: this.$container.height(),
			mode: 'callback',
			swffile: '',
			quality: 85,
			debug: _.bind(this.onFlashInfo, this),
			onCapture: _.bind(this.onFlashCapture, this),
			onSave: _.bind(this.onCaputreStream, this),
			el: this.$videoContainer.attr('id'),
			append: true,
			context: 'flash' // webrtc for js. filled by shim
		};
	}

	FlashWebcam.prototype.type = 'flash';

	FlashWebcam.prototype.flash = {
		$container: null,
		html: '',
		pos: 0,
		imageData: null,
		deferreds: {
		}
	};

	FlashWebcam.prototype.setDimensions = function(width, height) {
		this.options.width = width;
		this.options.height = height;
	};

	FlashWebcam.prototype.requestWebcam = function(df) {
		this.flash.deferreds.request = df;
		window.webcam = this.options;
		df.promise.then(_.bind(function() { 
			window.webcam = this.options;
			this.flash.html = this.$videoContainer.html();
		}, this));
		if (('getCameraList' in webcam) && webcam.getCameraList()) {
			this.$videoContainer.html(this.flash.html);
		}
		else {
			window.getUserMedia(this.options);
		}
	};

	FlashWebcam.prototype.play = function() {
	};

	FlashWebcam.prototype.pause = function() {
	};

	FlashWebcam.prototype.stop = function() {
		this.$videoContainer.empty().invisible().addClass('hidden');
	};

	FlashWebcam.prototype.takePicture = function(df) {
		this.flash.deferreds.screenshot = df;
		setTimeout(function() { window.webcam.capture(); }, 2000);
	};

	FlashWebcam.prototype.screenshot = function() {
		this.flash.deferreds.screenshot = promise.defer();
		window.webcam.capture();
		return this.flash.deferreds.screenshot.promise;
	};

	FlashWebcam.prototype.onFlashInfo = function(type, value) {
		switch (value) {
			case "Camera stopped":
			case "No camera was detected.":
				this.flash.deferreds.request.reject();
				break;
			case "Camera started":
				this.flash.deferreds.request.resolve();
				break;
			case "Capturing finished.":
				this.onCaputreStreamFinish();
				break;
			default:
		}
	};

	FlashWebcam.prototype.onFlashCapture = function() {
		this.canvas.width = this.options.width;
		this.canvas.height = this.options.height;
		this.flash.imageData = this.canvas.getContext('2d').getImageData(0, 0, this.options.width, this.options.height);
		this.flash.pos = 0;
		window.webcam.save();
	};

	FlashWebcam.prototype.onCaputreStream = function(data) {
		var col = data.split(";"),
			tmp = null,
			w = this.options.width;

		for (var i = 0; i < w; i++) { 
			tmp = parseInt(col[i], 10);
			this.flash.imageData.data[this.flash.pos + 0] = (tmp >> 16) & 0xff;
			this.flash.imageData.data[this.flash.pos + 1] = (tmp >> 8) & 0xff;
			this.flash.imageData.data[this.flash.pos + 2] = tmp & 0xff;
			this.flash.imageData.data[this.flash.pos + 3] = 0xff;
			this.flash.pos += 4;
		}
	};

	FlashWebcam.prototype.onCaputreStreamFinish = function() {
		var w = this.options.width,
			h = this.options.height,
			c = this.canvas;
		
		if (this.flash.pos >= 4 * w * h) { 
			var img = new Image();
			c.width = this.options.width;
			c.height = this.options.height;
			c.getContext('2d').putImageData(this.flash.imageData, 0, 0);
			img.src = c.toDataURL('image/png');
			this.flash.deferreds.screenshot.resolve(img);
		}
	};

	return FlashWebcam;

});

