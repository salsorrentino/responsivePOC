define(['jquery', './deviceDetector', 'widget/declare', 'widget/represent', 'can'], function($, deviceDetector, object, widget, can) {
	/**
		fulfils widget/represent. renders via can.view.mustache
		utilizes live-binding by returnning a can.Map for it's representaion object
		if jquerymobile is being used, will attempt to ehance it's template by looking for 
		the data-role attribute in the template.

		also prepares live binding within subwidgets defined in it's template.
		todo: elaborate on live-binding in subwidgets

		@class responsive/canjswidget
		@extends widget/represent
	*/
	return object([widget], /** @lends responsive/canjswidget */{
			
		canComponent: null,
		autoRender: true,
		renderer: null,
		scope: null,
		
		_jqmParsed: false,

		currentDevice: function() {
			return deviceDetector.currentDevice();
		},
		
		isMobileEnhanced: function() {
			return $.mobile != null;
		},

		getTemplate: function() {

			/*
				if we're using jquery mobile, attempt decorate the template
				before we parse and represent
			*/
			if (this.isMobileEnhanced() && !this._jqmParsed) {
				var t = $("<span>" + this.template + "</span>");
				var roles = $('[data-role]', t);
				$.each(roles,
					function(i, el) {
						el = $(el)
						if ( $.isFunction(el[el.data("role")]) ) {
							el[el.data("role")].call(el);
						}
					});
				//t.trigger("create");
				this._jqmParsed = true;
				this.template = t.html();
			}
			return this.template;
		},

		getRepresentation: function() {
			if (this.scope === null) {
				this.scope = new can.Map({
					content: this.content
				});
			}
			return this.scope;
		},

		getRenderer: function() {
			if (this.renderer == null) {
				this.renderer = can.view.mustache(this.getTemplate());
				// console.log("this.renderer:", this.renderer.prototype);
			}
			return this.renderer;
		},

		/**
			renders the widget
			@instance
		*/
		renderTemplate: function(rep, helpers) {
			return this.getRenderer()(rep, helpers);
		},

		/**
			creates a proxied function so the 'this' keyword correctly points to the canjswidget being defined. intended for template helpers. is automatically called for helpers provided from the getHelpers function.
			@instance
			@param {function} fn - function to be proxied
		*/
		helperProxy: function (fn) {
			return function() {
				var newArgs = [];
				for (var i = 0; i < arguments.length; i++) {
					newArgs[i] = $.isFunction(arguments[i]) ? arguments[i]() : arguments[i];
				};
				return fn.apply(this, newArgs);
			}
		},

		_getHelpers: function() {
			var helpers = this.getHelpers();
			var proxied = {};
			for(prop in helpers) {
				proxied[prop] = this.helperProxy(helpers[prop]);
			}
			return proxied;
		},

		/**
			mustache helpers to be used during template rendering.
			override to provide your own helpers.
			@instance
			@returns {object} mustache helper object...key->function
		*/
		getHelpers: function() {
			return {
				currency: function(val, object) {
					return "$" + val();
				}
			};
		},

		childRepresented: function(child) {
			this._resolvePlaceHeldNodes(child);
			this.inherited(arguments);
		},

		_placeHeldNodes: null,

		_getPlaceHeldNode: function(ph) {
			var attr = ph.attr("data-placeholder");
			if (this._placeHeldNodes) {
				var node = this._placeHeldNodes[attr];
				this._placeHeldNodes[attr] = null;
				if (node) return node;
			}
			return this.parent && this.parent._getPlaceHeldNode ? this.parent._getPlaceHeldNode(ph) : null;
		},

		_resolvePlaceHeldNodes: function(child) {
			var self = this;
			var placeHolders = $("[data-placeholder]", child.domNode);
			$.each(placeHolders, function(index, el){
				el = $(el);
				var node = self._getPlaceHeldNode(el);
				if (node) {
					node.insertBefore(el);
					el.remove();
				}
				// console.log("placeHeld:", node);
			});
		},

		addChildPlaceHolders: function() {
			var childContentPlaceholders = $("[data-object] > *", this.domNode).not("[data-object]").not("[data-placeholder]");
			var self = this;
			this._placeHeldNodes = {};
			$.each(childContentPlaceholders, function(index, el) {
				el = $(el);
				var id = self.genUniqueId();
				var ph = $("<div style='display: none;' data-placeholder='"+id+"'></div>");
				self._placeHeldNodes[id] = el;
				ph.insertBefore(el);
				el.detach();
			});
		},

		parseChildren: function() {
			this.addChildPlaceHolders();
			this.inherited(arguments);
		},

		represent: function() {
			if (!this.autoRender) return;
			
			if (this.preRender) this.preRender();
			var represent = this.getRepresentation ? this.getRepresentation() : this;
			this.domNode = $(this.domNode);
			var rep = this.renderTemplate(represent, this._getHelpers()).firstChild;
			
			this.domNode.replaceWith(rep);
			this.domNode = $(rep);
			
			this._transferGuts($(this.srcNode), $(this.domNode));
			this.bindTemplateNodes(this.domNode)
			this.bindTemplateEvents(this.domNode);
			
			if (this.parent && this.parent.childRepresented) {
				this.parent.childRepresented(this);
			}
			this.renderingComplete = true;
			if (this.postRepresent) {
				this.postRepresent();
			}
			
			
			
		}
	});
	
});