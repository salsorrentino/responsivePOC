/*
	borrowstate - extends statefulview: a view that borrows it's route from it's 
	parent widget or a defined target (must implement a routes functionm or have a routes array member)
	targets are identified by a selector, which must point to the dom node of a stateful view or similar widget
*/

define(['jquery', './statefulview'], function($, view) {
	return view.extend({suffix: "",
		target: null,
		suffix: null,

		borrowRoutes: function(routes) {
			this.routes = [];
			this.routes.push.apply(this.routes, routes);
			if (this.suffix) {
				var self = this;
				$.each(this.routes, function(index, el) {
					el = el.replace("(", "").replace(")"); //strip optionals
					if (comp == '*') { //if our target accepts all routes, then our route is our suffix
						self.routes[index] = "/" + self.suffix;
						return true;
					}

					var comp = el.split("/");
					if (comp.length > 1) { //tac our suffix onto the end. if the traget route ends ina wildcard, replace it
						var lastComp = comp[comp.length - 1];
						if (lastComp == "*") {
							comp[comp.length - 1] = self.suffix;
						} else {
							comp.push(self.suffix);
						}
					} else {
						var lastComp = comp[0];
						if (lastComp == "*") {
							comp[0] = "/" + self.suffix;
						} else {
							comp.push(self.suffix);
						}
					}
					self.routes[index] = comp.join("/");
				});
			}
		},

		postRepresent: function() {
			var parent = this.target === null ? this.parent : $(this.target).data("widget");
			if (parent && parent.routes) {
				var routes = $.isFunction(this.parent.routes) ? this.parent.routes() : this.parent.routes;
				this.borrowRoutes(routes);	
			}
			this.inherited(arguments);
		}
	});

})