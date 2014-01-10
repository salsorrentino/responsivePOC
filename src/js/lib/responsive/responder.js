define(['jquery', 'widget/declare'], function($, object) {
	return object([], {
		responsiveAttr: "data-responds-to",
		responsiveSelector: "[data-responds-to]",

		nodeResponse: function($el, currentDevice) {
			var respondsTo = $el.attr(this.responsiveAttr).split(",");
			$.each(respondsTo, function(index, device) {respondsTo[index] = $.trim(device).toLowerCase();});
			if (respondsTo.indexOf(currentDevice) < 0) {
				$el.remove();
			} else {
				$el.attr(this.responsiveAttr, null);
			}
		},

		parseContent: function(device, $content) {
			var self = this;
			var nodes = $content ? $(this.responsiveSelector, $content) : $(this.responsiveSelector);
			$.each(nodes, function(index, el) {
				self.nodeResponse($(el), device)
			});
		}
	})
})