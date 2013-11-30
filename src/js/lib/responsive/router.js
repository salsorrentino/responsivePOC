define(['jquery', 'widget/object', 'pathjs'], function($, object, pathjs) {
	var isPushState = history.pushState != null;
	var singleton = null;
	var router = object({
		home: "",
		routeMap: {},
		listening: false,
		allViews: [],
		hashString: "#!",
		bang: "!",
		allRoutes: "*",
		pushstate: false,
		wildCard: "*",

		init: function() {
			// alert(this.root);
			if (singleton == null) {
				singleton = this;
			}
			
			this.setUpRoutes();
			
		},
		go: function(path) {
			// console.log(window.location);
			// var hasHash = path.indexOf(this.hashString);
			// path = hasHash
			var bang = this.hashString.indexOf(this.bang) > 0 ? this.bang : "";
			window.location.hash = bang + path;
		},

		replaceState: function(path) {
			var base = window.location.pathname + window.location.search;
			window.location.replace(base + this.hashString + path);
			// this.go(path);
		},

		buildRoute: function(route, params, includeHashString) {
			params = params ? params : {};
			var self = this;
			route = route.replace("(", "").replace(")", "");
			var pathEls = route.split("/");
			var wildCardIndex = -1;
			$.each(pathEls, function(i, el) {
				if (el.indexOf(":") === 0) {
					var key = el.substr(1);
					pathEls[i] = params[key];
				} else if (el === self.wildCard) {
					wildCardIndex = i;
					return false;
				}
			});
			if (wildCardIndex >= 0) {
				pathEls = pathEls.slice(0, wildCardIndex + 1);
			}

			var path = pathEls.join("/");
			return includeHashString ? this.hashString + path : path;
		},

		setUpRoutes: function() {
			
			pathjs.root(this.hashString + this.home);

			var self = this;
			pathjs.rescue(function() {
				self.noRoute.apply(self, arguments);
			});
			$(document).one("statefulviewsrendered", function() {
					if (!self.listening) {
						pathjs.listen();
						self.listening = true;
					}
				}
			);
		},

		callViewShowState: function(view, route, params) {
			//alert("calling view");
			//console.log(arguments);
			view.showState(route, params);
		},

		callViewLostState: function(view, route, params) {
			//alert("calling view");
			//console.log(arguments);
			view.lostState(route, params);
		},

		_removeEmptyFirstIndex: function(a) {
			if (a.length && a[0] === "") a.shift();
			return a;
		},

		_isVariable: function(s) {
			return s.length && s.substr(0,1) === ':';
		},

		_getVarName: function(s) {
			return s.substr(1);
		},
		noRoute: function() {
			var self = this;
			$.each(self.allViews, function(i, theView) {
				if (self.respondsToAllRoutes(theView)) {
					self.callViewShowState(theView, pathjs.routes.current, {});
				} else {
					self.callViewLostState(theView, pathjs.routes.current, {});	
				}
				
			});
		},

		respondsToAllRoutes: function(view) {
			var routes = $.isFunction(view.routes) ? view.routes() : view.routes;
			return routes.indexOf("*") >= 0;
		},

		// satisfiesCurrentRoute: function() {

		// },
		
		satisfiesRoute: function(view, matchRoute, params) {

			var routes = $.isFunction(view.routes) ? view.routes() : view.routes;

			var self = this;
			var order = this._removeEmptyFirstIndex(
							matchRoute.replace("(", "").replace(")", "").split("/")
						);
			var satisfied = false;
			$.each(routes, function(index, route) {
				if (route === self.allRoutes) {
					satisfied = true;
					return false;
				}
				var s = route.split("(");
				var req = self._removeEmptyFirstIndex( s[0].split("/") );
				var opt = self._removeEmptyFirstIndex( s.length > 1 ? s[1].split(")")[0].split("/") : [] );
				// console.log(req, opt, order);
				var wildCard = (req && req.length) ? req[req.length - 1] == self.wildCard : false;
				//var optWildCard = (!wildCard opt && opt.length) ? opt[opt.length - 1] == "*" : false;
				var matchLen = 0;
				for (var i = 0; i < order.length; i++, matchLen++) {
					if (  !wildCard && (req.length + opt.length !== order.length)  ) {
						//move on to next component
						break;
					}
					var isVar = self._isVariable( order[i] );
					if (i < req.length) {
						if (req[i] == self.wildCard) {
							//move on to next component
							break;
						}
						var isViewVar = self._isVariable( req[i] );
						if (!isVar && !isViewVar) {
							if (order[i] != req[i]) {
								//move on to next component
								break;
							}
						} else if (isVar && !isViewVar) {
							if (params[self._getVarName(order[i])] != req[i]) {
								//move on to next component
								break;
							}
						} else {
							if (params[self._getVarName(order[i])] == null) {
								//move on to next component
								break;
							}
						}
					}
				};
				if (matchLen < req.length 
						&& req[matchLen] != self.wildCard) {
					return true;	
				}
				satisfied = true;
				return false;
			});
			return satisfied;
		},

		unregisterView: function(view) {
			var restOfViews = [];
			for (var i = 0; i < this.allViews.length; i++) {
				if (this.allViews[i] !== view) restOfViews.push(this.allViews[i]);
			};
			this.allViews = restOfViews;
		},

		checkForViewCompletion: function(viewsWithState) {
			if (this._completionCheck) {
				clearTimeout(this._completionCheck);
			}
			var isComplete = true;
			for (var i = 0; i < viewsWithState.length; i++) {
				if (!viewsWithState[i].isComplete()) {
					isComplete = false;
					break;
				}
			};
			if (isComplete) {
				$(document).trigger("routecomplete")
			} else {
				var self = this;
				this._completionCheck = setTimeout(function() {
					self._completionCheck = null;
					self.checkForViewCompletion(viewsWithState)
				}, 10);
			}
		},

		checkForViewSatisfaction: function(route, paramContext) {
			var self = this;
			var viewsWithState = [];
			$.each(self.allViews, function(i, theView) {
				var satisfied = self.satisfiesRoute(theView, route, paramContext.params);
				if (satisfied) {
					viewsWithState.push(theView);
					self.callViewShowState(theView, route, paramContext.params);
				} else {
					self.callViewLostState(theView, route, paramContext.params);
				}
			});
			this.checkForViewCompletion(viewsWithState);
			
		},

		registerView: function(view) {
			if (this.allViews.indexOf(view) < 0) this.allViews.push(view);
			if (view.routes) {
				var routes = $.isFunction(view.routes) ? view.routes() : view.routes;
				var self = this;
				$.each(routes, function(index, route) {
					if (route != self.allRoutes 
						&& route.indexOf("/*") == (route.length - 2)) {
						route = route.substring(0, route.length - 2);
					}

					var fullRoute =  self.hashString + route;
					var existingRoutes = self.routeMap[fullRoute];
					if (!existingRoutes) {
						self.routeMap[fullRoute] = true;
						pathjs.map(fullRoute).to(
							function() {
								var paramContext = this;
								self.checkForViewSatisfaction.call(self, route, paramContext);
							}
						);
						
					} 
					
				});
			}

		}

	});
	router.getInstance = function() {
		return singleton;
	}
	return router;
});