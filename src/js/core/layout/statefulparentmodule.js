define(['jquery', 'widget/object', 'responsive/statefulview'], function($, object, view) {
	return object([view], {
		template: "<div>{{{content}}}</div>",
		target: null,
		addChild: function(child) {
			this.inherited(arguments);
			if (!this._isRegistered && child.routes) {
				if (this.target) {
					if ($(child.domNode).attr("id") === this.target) {
						this._isRegistered = true;
						this.routes = function() { return $.isFunction(child.routes) ? child.routes() : child.routes;};
						this.router.registerView(this);
						this.__allDone()	
					}
				} else {
					this._isRegistered = true;
					this.routes = function() { return $.isFunction(child.routes) ? child.routes() : child.routes;};
					this.router.registerView(this);
					this.__allDone()
				}
			}
		},

		postRepresent: function() {
			/*
				killing suprs impl.
				we do not want to register with
				 the router until after our target is added
			*/
		}
	});
});