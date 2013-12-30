define(["jquery", "widget/object", "./canjswidget","./router", './responder'], function($, object, widget, router, responder) {
	var __represents = 0;
	var __completed = 0;

	/*
		we need to keep track of all the stateful views status, 
		so we can send an event when all stateful views are ready.
		the router listens for this event, so it knows when to start listening to path/hash change events
	*/
	var allDone = function() {
		__completed++;
		if (__represents === __completed) {
			$(document).trigger("statefulviewsrendered");
		}
	};
	/**
		a view that responds to url hash changes. works in conjunction with {@link responsive/router responsive/router}

		@class responsive/statefulview
		@example
		define(['responsive/statefulview', 'text!mytemplate.html'], function(view, template) {
			return view.extend({
				route: "/example/route/{id}/overview",
				template: template,
				showState: function(route, params) {
					//write code here to do stuff when view is activated
					this.inherited(arguments);
				}
			})
		});

		@extends responsive/canjswidget
		@requires canjswidget
		@requires router
		@requires responder
	*/
	return object([widget], /** @lends responsive/statefulview */{
		
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

		/** 
			a list of all the routes this view responds to.
			by default, it returns the 'route' member of the view.
			can be overridden by a method or can be set to an array.
			@instance
		*/
		routes: function() {
			return [this.route];
		},

		/**
			by default, returns the forst route in the array returned by routes()
			@instance
		*/
		getDefaultRoute: function() {
			var routes = this.routes;
			if (routes && $.isFunction(routes)) {
				routes = routes.apply(this, arguments);
			}
			return routes && routes.length ? routes[0] : this.route;

		},
		
		/**
			a convenience method for getting the router.
			if it is not available, will check this.parent
			@instance
		*/
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

		/**
			to see if the view should check it's state.
			cuts down on the number of calls made to showState() and lostState()
			if the new state is the same as the last state.
			@instance
		*/
		checkLastState: function(params) {
			var search = this.buildRoute(params);
			if (search != this.lastSearch) {
				this.lastSearch = search;
				return true;
			}
			return false;
		},

		/**
			builds a url hash based on the current params for this view.
			uses getDefaultRoute() for the route.

			@param [params=this.getRepresentation()] {object} - the current route parameters, used in building the url hash
			@param [includeHash=false] {boolean} - if true, include the hash or hashbang (depending on router configuration) in the resulting string
			@returns {string} the resulting url hash
			@instance
		*/
		buildRoute: function(params, includeHash) {
			params = params ? params : this.getRepresentation();
			return this.getRouter().buildRoute(this.getDefaultRoute(), params, includeHash);
		},

		/**
			set the current path of the page to this views active state.
			@param replace {boolean} - when true, replaces the url state instead of adding to the browser history
			@param params {object} - the current route parameters, used in building the url hash
			@instance
		*/
		makeStateActive: function (replace, params) {
			if (replace) {
				this.getRouter().replaceState(this.buildRoute(params));
			} else {
				this.getRouter().go(this.buildRoute(params));
			}
		},

		/**
			isComplete is called by router.js.
			used to determine if the widget is actualy complete.
			override if you are using an ajax call to populate data.

			once all stateful views on a page respond with true, the page is considered complete,
			and router.js sends a 'routecomplete' event indicating so.
			page.js listens for this event...
			is very helpful for making ajax applications crawlable by search engines

			@example
			isComplete: function() {
				return this.dataIsLoaded
			}

			@instance

		*/
		isComplete: function() {
			return true;
		},

		/**
			the router has determined that this view should be active.
			add back to the dom. Override this method to make ajax calls etc...
			be sure to call this.inherited(arguments) to make it's added back to the dom.
			@example

			isComplete: function() {
				return this.listRendered;
			},

			showState: function(route, params) {
				
				if (this.checkLastState(params)) {
					var self = this;
					this.listRendered = false;
					model.findAll(params, function(items) {
						self.showItems(items);
						self.listRendered = true;
					});
				}
				this.inherited(arguments);
			}
			@param route {string} - the current route being evaluated by the router
			@param params {object} - the current route parameters, used in building the url hash
			@instance
		*/
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

		/**
			the router has determined that this view should not be active.
			hide the contents of this view.
			the dom node is actually removed from the dom and kept in memory for later insertion so
			search engines are not tracking non-relevant content

			@param route {string} - the current route being evaluated by the router
			@param params {object} - the current route parameters, used in building the url hash

			@instance
		*/
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


		/**
			do cleanup after view is destroyed.
			@instance
		*/
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

		/*
			we need to keep track of all the stateful views status, 
			so we can send an event when the page is done rendering
		*/
		__allDone: function() {
			setTimeout(allDone, 100);
		},

		/**
			overrides method from represent.js 
			registers the view with the router,
			and signals that it's done being instanciated
			@instance
		*/
		postRepresent: function() {
			this.getRouter().registerView(this);
			
			this.__allDone()
			this.inherited(arguments);
		},

		doRouting: function() {

		}
	});
});