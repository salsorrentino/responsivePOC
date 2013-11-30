define(['jquery', 'widget/object', "./deviceDetector", './responder'], function($, object, deviceDetector, responder) {

	var responder = object([responder],{
		
		deviceDetector: deviceDetector,

		jqMobileDevices: {
			desktop: false,
			phone: true,
			tablet: true
		},

		deviceClassName: {
			desktop: "rspDesktop",
			phone: "rspPhone",
			tablet: "rspTablet"
		},
		device: null,

		init: function() {
			var start = new Date().getTime();
			$(document).one("routecomplete", function() {
				setTimeout(function() {
					$("body").append($("<div style='display: none;' data-route-complete='true'></div>"));
					var end = new Date().getTime();
					console.log("page completed in ", end - start, "ms")
				}, 10);
			});
			$(document).bind("mobileinit", function(){
				$.mobile.ajaxEnabled = false;
				$.mobile.hashListeningEnabled = false;
			});
		},
		
		styleSheetResponse: function($el) {
			var respondsTo = $el.attr(this.responsiveAttr).split(",");
			$.each(respondsTo, function(index, device) {respondsTo[index] = $.trim(device).toLowerCase();});
			if (respondsTo.indexOf(this.device) >= 0) {
				var fileref=document.createElement("link");
				fileref.setAttribute("rel", "stylesheet");
				fileref.setAttribute("type", "text/css");
				if ($el.attr("media")) fileref.setAttribute("media", $el.attr("media"));
				fileref.setAttribute("href", $el.attr('href'));
				$(fileref).insertAfter($el);
			}
			$el.remove();
		},

		

		doneParsing: function() {
			$(document.body).removeClass("rspLoading");
			$(document).trigger("pageparsed");
		},

		respond: function($node) {
			$("body").addClass("rspLoading");
			this.device = this.deviceDetector.currentDevice();
			console.log("responding to:", this.device);
			// console.log('head', $(document.head));
			var className = this.deviceClassName[this.device];

			if (className) {
				$(document.body).addClass(className);
			}

			
			var self = this;
			var styles = document.getElementsByTagName("cond");
			/*
				styles get updated as we modify the dom...
				we need to make a copy to iterate through since 
				styleSheetResponse will delete the original node
			*/
			var a = [].concat(styles); //making the copy

			$.each(a, function(index, el) {
				self.styleSheetResponse($(el));
			});
			this.parseContent(this.device, $node);
			
			if ( this.jqMobileDevices[this.deviceDetector.currentDevice()]) {
				require(["jquerymobile"], function() {
					object.parse($node, function() {
						$(document).trigger("create");
						self.doneParsing();
					});
				});
			} else {
				object.parse($node, function() {
					self.doneParsing();
				});
			}

			
		}

	});
	return responder;
});