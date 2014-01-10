define(["jquery", "./declare", "mustache"], function($, jerk, mustache) {
	return jerk({
		renderer: mustache,
		templateString: "",
		writer: null,
		renderer: null,
		
		setTemplate: function(template) {
			this.templateString = template;
			this.renderer = null;
		},
		
		
		renderTemplate: function() {
			if (arguments.length == 1) {
				return mustache.to_html(this.templateString, arguments[0]);	
			}

			if (arguments.length == 2) {
				return mustache.to_html(arguments[0], arguments[1]);	
			}

			if (arguments.length == 0) {
				return mustache.to_html(this.templateString, this);	
			}

			return mustache.to_html.apply(null, arguments);

			// return $(mustache.to_html(this.templateString, data));// $(this.getRenderer()(data));
		}
		
	}); 
});