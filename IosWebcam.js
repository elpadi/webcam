define(['jquery','underscore','promise'], function(jquery, underscore, promise) {

	function IosWebcam() {
		this.$container.addClass('webcam--ios');
		this.ios.$input = $('<input id="webcam-input" type="file" accept="image/*;capture=camera">')
			.on('change', _.bind(this.onPictureUpload, this))
			.appendTo(this.$container);
	}

	IosWebcam.prototype.ios = {
		$container: null,
		deferreds: {
		}
	};

	IosWebcam.prototype.type = 'ios';

	IosWebcam.prototype.setDimensions = function(width, height) {
	};

	IosWebcam.prototype.requestWebcam = function(df) {
		this.ios.deferreds.request = df;
	};

	IosWebcam.prototype.onPictureUpload = function() {
		this.ios.deferreds.request.resolve();
	};

	IosWebcam.prototype.stop = function() {
		this.ios.$container.visibleImmediate();
	};

	IosWebcam.prototype.preprocessScreenshot = function(img) {
		var l = Math.min(720, img.width, img.height),
			ar = img.width / img.height,
			i = new Image(),
			c = document.createElement('canvas'),
			scale,
			ctx = c.getContext('2d');

		console.group('IosWebcam.preprocessScreenshot');
		console.log('img width:', img.width, 'img height:', img.height, 'img ratio:', ar);
		c.width = 720;
		c.height = 720;
		scale = c.width / img.width;
		console.log('c.width:', c.width, 'c.height:', c.height, 'scale:', scale);
		console.groupEnd();
		ctx.drawImage(img, (img.width - l) / 2, (img.height - l) / 2, l, l, 0, 0, 720, 720);
		i.src = c.toDataURL();
		return i;
	};

	IosWebcam.prototype.takePicture = function(df) {
		var reader = new FileReader(), that = this;
		reader.onload = function(e) {
			var img = new Image();
			img.onload = function() {
				df.resolve(that.preprocessScreenshot(img));
			};
			img.src = e.target.result;
		};
		reader.readAsDataURL(this.ios.$input[0].files[0]);
	};

	IosWebcam.prototype.screenshot = function() {
		var df = promise.defer();
		this.takePicture(df);
		return df.promise;
	};

	return IosWebcam;

});


