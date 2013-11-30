define(["jquery", "widget/object", "./canjswidget","./router", './responder'], function($, object, widget, router, responder) {
	var __represents = 0;
	var __completed = 0;

	var allDone = function() {
		__completed++;
		if (__represents === __completed) {
			$(document).trigger("statefulviewsrendered");
		}
	};	

	var sv =  object([widget],{
		route: "*",
		template: "<view>{{{content}}}</view>",
		_templateParsed: false,
		router: router.getInstance(),
		placeHolderNode: null,
		isAttached: true,

		__mustInit: function() {
			$(this.domNode).addClass("rspStatefulHidden");
			this.inherited(arguments);
			__represents++;
		},

		getTemplate: function() {
			if (!this._templateParsed) {
				var t = $("<span>" + this.template + "</span>");
				new responder().parseContent(this.currentDevice(), t);
				this.template = t.html();
				this._templateParsed = true;
			}
			return this.inherited(arguments);
		},

		routes: function() {
			return [this.route];
		},

		getDefaultRoute: function() {
			var routes = this.routes;
			if (routes && $.isFunction(routes)) {
				routes = routes.apply(this, arguments);
			}
			return routes && routes.length ? routes[0] : this.route;

		},
		
		getRouter: function() {
			if (this.router) {
				return this.router;
			}
			if (this.parent && this.parent.getRouter) {
				return this.parent.getRouter();
			}
			return router.getInstance();
		},

		lastState: null,

		checkLastState: function(params) {
			var search = this.buildRoute(params);
			if (search != this.lastSearch) {
				this.lastSearch = search;
				return true;
			}
			return false;
		},

		buildRoute: function(params, includeHash) {
			params = params ? params : this.getRepresentation();
			return this.getRouter().buildRoute(this.getDefaultRoute(), params, includeHash);
		},

		makeStateActive: function (replace, params) {
			if (replace) {
				this.getRouter().replaceState(this.buildRoute(params));
			} else {
				this.getRouter().go(this.buildRoute(params));
			}
		},

		isComplete: function() {
			return true;
		},

		showState: function(route, params) {
			$(this.domNode).removeClass("rspStatefulHidden"); //probably not needed
			/*
				add the node back to the dom
			*/
			if (!this.isAttached) {
				this.isAttached = true;
				if (this.placeHolderNode) {
					this.domNode.insertAfter(this.placeHolderNode);
					this.placeHolderNode.detach();
				}
			}
		},

		lostState: function(route, params) {
			$(this.domNode).addClass("rspStatefulHidden"); //probably not needed
			/*
				we're going to actually remove the node from the dom
				instead of just hiding it. this is for search engine optimization.
				don't want to muddy up the content with possibly non relevant info
			*/
			if (this.isAttached) {
				this.isAttached = false;
				if (this.placeHolderNode == null) {
					this.placeHolderNode = $("<placeholder style='display: none;'></placeholder>");
						
				}
				this.placeHolderNode.insertAfter(this.domNode);
				this.domNode.detach();
			}
		},

		destroy: function() {
			/*
				clean up placeholders and unregister from router
			*/
			if (this.placeHolderNode) {
				this.placeHolderNode.replaceWith("");
				this.placeHolderNode = null;
			}
			this.getRouter().unregisterView(this);
			this.inherited(arguments);
		},

		__allDone: function() {
			setTimeout(allDone, 100);
		},
		postRepresent: function() {
			this.getRouter().registerView(this);
			
			this.__allDone()
			this.inherited(arguments);
		},

		doRouting: function() {

		}
	});
	
	//convenience method here...
	// sv.extend = function (mixins, body) {
	// 	var ext = [sv];
	// 	if (arguments.length === 1) {
	// 		body = mixins
	// 		mixins = [];
	// 	}
	// 	ext.push.apply(ext, mixins);
	// 	return object(ext, body);
	// }
	return sv;
});