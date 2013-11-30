define(["jquery", "./object", "./string"], function($, jerk, stringUtil) {
	
	return jerk([],{
		_templater: null,
		_privates: ["_supers", "children", "jerks", "domNode"],
		hiddenRender: false,
		renderingComplete: false,
		childRenderingComplete: false,
		isRepresentative: true,
		autoRender: false,
		renderEvent: null,

		
		
		_checkRenderingComplete: function() {
			if (this.children.length == 0) {
				this.childRenderingComplete = true;
			}
			var renderCount = this.children.length;
			var self = this;
			$.each(this.children, function(index, child) {
				if (child.isRepresentative == true && child.isRenderingComplete()) {
					renderCount--;
				} else if (child.isRepresentative != true) {
					renderCount--;
				}
			});

			if (this.childRenderingComplete != true) {
				this.childRenderingComplete = (renderCount <= 0);
			}
			if (this.isRenderingComplete()) {
				if (this.parent) {
					this.parent._childRepresented(this);
				} else {
					$(document).trigger("jerkificationComplete", this);
				}
			}
		},
		
		getId: function() {
			return this.domNode.id;
		},
		
		isRenderingComplete: function() {
			return this.renderingComplete && this.childRenderingComplete;
		},
		
		addChild: function(child) {
			this._childBinds = this._childBinds ? this._childBinds : [];
			this.children = this.children ? this.children : []; 
			this.children.push(child);
// 			console.log(this.getId() + ": addChild:");
			var c = $(child.srcNode);
			var bind = c.attr("data-bind-object");
			var self = this;
			if (bind) {
				this[bind] = child;
				var bindEvents = c.attr("data-bind-object-event");
				if (bindEvents) {
					var kvs = stringUtil.parseKeyValue(c, 'data-bind-object-event');
					$.each(kvs, function(index, kv) {
						var func = function() {
							return self.executeBoundEvent(kv.value, arguments);
	                        // self[kv.value].apply(self, arguments);
	                    };
	                    $(child).on(kv.key, func);
	                    self._childBinds.push({element: $(child), eventName: kv.key, func: func})
					});
				}
			}
			this._checkRenderingComplete();
		},
		
		_childRepresented: function(child) {
// 			console.log(this.getId() + ": childRepresented:");
			this._checkRenderingComplete();
			if (this.childRepresented) this.childRepresented(child);
		},
		
		// getTemplater: function() {
		// 	if (this._templater == null) {
		// 		this._templater = new templater({template: this.template});
		// 	}
		// 	return this._templater;
		// },
		
		_preRender: function() {
			
		},
		
		_parseStyle: function(srcNode) {
			
			if (srcNode.attr("style")) {
				
				var map = {};
				var a = srcNode.attr("style").split(";");
				
				for (var i = 0; i < a.length; i++) {
					var kv = a[i].split(":");
						if (kv.length > 0) {
							var name = $.trim(kv[0]);
							if (name != "") {
							var val = "";
							if (kv.length == 2) {
								val = kv[1];
							} else if (kv.length > 2) {
								kv.pop();
								var val = kv.join(":");
							}
							map[name] = val;
						}
					}
				}
				return map;
			}
			
			return null;
		},
		
		_transferGuts: function(src, target) {
			target.data("widget", this);
			if (src.attr("id")) {
				target.attr("id", src.attr("id"));
				src.attr("id", null);
			}
			var style = this._parseStyle(src);
			var cssClass = src.attr("class");
			if (style) {
				target.css(style);
			}
			if (cssClass) {
				target.addClass(cssClass);
			}

		},

		preChildParse: function() {
			if (this.renderEvent == null) {
				this.represent();
				
				return true;
			} else {
				var self = this;
				$(document).on(this.renderEvent, function() {
					self.represent();
					self.parseChildren();
				});
			}
			return false;
		},
		
		childDefined: function(child) {
			child.parent = this;
// 			console.log(this.getId() + ": childDefined:");
			this._checkRenderingComplete();
		},
		
		parseChildren: function() {
			this.inherited(arguments);
// 			console.log(this.jerks.length);
			this._checkRenderingComplete();
		},
		
		getRepresentation: function() {
			return this;
		},
		
		
		destroy: function() {
			try {
				for (var i = 0; this._childBinds && i < this._childBinds.length; i++) {
	                this._childBinds[i].element.off(this._childBinds[i].eventName, this._childBinds[i].func);
	            };
	            this._clearArray(this._childBinds);

				for (var i = 0; this._previouslyBound && i < this._previouslyBound.length; i++) {
	                this._previouslyBound[i].element.off(this._previouslyBound[i].eventName, this._previouslyBound[i].func);
	            };
	            this._clearArray(this._previouslyBound);
	            
				
	            if (this.srcNode) {
	            	var n = $(this.srcNode);
	            	n.data("widget", null);
	            	n.replaceWith("");
	            	this.srcNode = null;
	            }
	        } catch(e) {
	        	console.log(e);
	        }
			this.inherited(arguments);
		},

		bindTemplateNodes: function($el) {
            var self = this;
            var bindNodes = $el.find('[data-bind-node]').add($el.filter('[data-bind-node]'));
            $.each(bindNodes, function(index, el) {
                el = $(el);
                var val = el.attr('data-bind-node');
                self[val] = el;
            });
        },

        executeBoundEvent: function(event, args) {
        	return this[event].apply(this, args)
        },

        bind: function($target, eventName, handler) {
        	$target.on(eventName, handler);
        	this._previouslyBound.push({element: $target, eventName: eventName, func: handler});
        },

        bindTemplateEvents: function($el) {
            var self = this;
            // var $el = this.autoRender ? $(this.domNode) : this.$el;
            //in case this gets run twice, we'll clear previous binds
            for (var i = 0; this._previouslyBound && i < this._previouslyBound.length; i++) {
                this._previouslyBound[i].element.off(this._previouslyBound[i].eventName, this._previouslyBound[i].func);
            };
            this._previouslyBound = [];
            var bindEvents = $el.find('[data-bind-event]').add($el.filter('[data-bind-event]'))
            $.each(bindEvents, function(index, el) {
                el = $(el);
                var kvs = stringUtil.parseKeyValue(el, 'data-bind-event');
                $.each(kvs, function(index, kv) {
                	var func = function() {
                		return self.executeBoundEvent(kv.value, arguments);
                    };
                    self.bind(el, kv.key, func);
                });
            });
        },

		represent: function() {
			if (!this.autoRender) return;
			if (this.preRender) this.preRender();
			var represent = this.getRepresentation ? this.getRepresentation() : this;
			
			var rep = this.renderTemplate(represent);
			
			if (this.domNode && rep) {
				rep = $(rep);

				this.domNode = $(this.domNode);
				this.domNode.replaceWith(rep);
				$(this.srcNode).data('widget', this);
				this.domNode = rep;
				// console.log( this.domNode);
				this._transferGuts($(this.srcNode), $(this.domNode));
				this.bindTemplateNodes(this.domNode)
				this.bindTemplateEvents(this.domNode);
			}

			if (this.hiddenRender) {
				$(this.domNode).removeClass("hiddenJerk")
			}
			

			
			if (this.parent && this.parent.childRepresented) {
				this.parent.childRepresented(this);
			}
			this.renderingComplete = true;
			
			if (this.postRepresent) {
				this.postRepresent();
			}
			
			
		},
		


		_stripPrivates: function() {
			var o = {};
			for (prop in  this) {
				if ($.inArray(prop, this._privates) < 0) {
					if (!$.isFunction(this.prop)) {
						o[prop] = this.representValue(prop);
					}
				}
			}
			return o;
		},

		representValue: function(key) {
			var funcName = stringUtil.createMethodName(["represent", key]);
			
			if (this[funcName] && $.isFunction(this[funcName])) {
				return this[funcName].apply(this, arguments);
			}
			return this[key];
		}
		
	});
});