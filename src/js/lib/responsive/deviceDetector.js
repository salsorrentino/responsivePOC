define(["widget/object"], function(object) {
	var detector = function() {}
	detector.prototype = {
		storageKey: "cars_responsive_detected_device",
		device: null,
		phoneWidth: 480,
		tabletWidth: 700,
		overrideKey: "forcedevice",

		currentDevice: function() {
			if (this.device === null) {
				this.device = this.detectDevice();
			}
			return this.device;
		},

		_detect: function() {
			var width = screen.width;
			if (width <= this.phoneWidth) {
				return "phone";
			}

			if (width <= this.tabletWidth) {
				return "tablet";
			}

			return "desktop";
		},

		checkForUrlOverride: function() {
			var params = location.search;
			params = params ? params.substr(1).split("&") : [];
			var query = {};
			for (var i = 0; i < params.length; i++) {
				var param = params[i].split("=");
				query[param[0]] = param[1];
			};
			return query[this.overrideKey];
		},

		detectDevice: function() {
			var over = this.checkForUrlOverride();
			var device = over ? over : sessionStorage[this.storageKey];
			if (device == null) {
				device = this._detect()
				
			}
			sessionStorage[this.storageKey] = device;
			return device;
		},

		reset: function() {
			this.device = null;
			sessionStorage[this.storageKey] = null;
		}
	};

	return new detector();
});