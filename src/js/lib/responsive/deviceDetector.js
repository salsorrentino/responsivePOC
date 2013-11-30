/*
	deviceDetector - a very simple devive detector. uses screen width only
	only meant as a POC. should be expanded on to be more robust.
	must simple expand on the _detect method.

	stores the device type in sessionStorage.
	can be forced with a request parameter of 'forcedevice=phone|tablet|desktop'
*/

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