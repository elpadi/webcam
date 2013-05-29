define(['jquery','underscore','promise'], function(jquery, underscore, promise) {

	function IosWebcam() {
		this.ios.$container = $(document.createElement('form')).attr({
			id: 'webcam-ios-container'
		}).addClass('visibility--invisible').appendTo(this.$container.children().first());;
		this.ios.$input = $('<input id="webcam-input" type="file" accept="image/*;capture=camera">')
			.on('change', _.bind(this.onPictureUpload, this))
			.appendTo(this.ios.$container);
	}

	IosWebcam.prototype.ios = {
		$container: null,
		deferreds: {
		}
	};

	IosWebcam.prototype.setDimensions = function(width, height) {
	};

	IosWebcam.prototype.requestWebcam = function(df) {
		this.ios.deferreds.request = df;
		
	};

	IosWebcam.prototype.onPictureUpload = function() {
		this.ios.$container.invisibleImmediate();
		this.ios.deferreds.request.resolve();
	};

	IosWebcam.prototype.stop = function() {
		this.ios.$container.visibleImmediate();
	};

	IosWebcam.prototype.takePicture = function(df) {
		var reader = new FileReader();
		reader.onload = function(e) {
			var img = new Image();
			img.onload = _.bind(df.resolve, df, img);
			img.src = e.target.result;
		};
		reader.readAsDataURL(this.ios.$input[0].files[0]);
	};

	return IosWebcam;

});


