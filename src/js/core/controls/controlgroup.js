define(['jquery', 'responsive/statefulview', 'text!./resources/controlgroup.html'], function($, view, template) {
	return view.extend({
		template: template,
		linkMode: "replace",
		/*
			in case we want to do a location replace
		*/
		controlClicked: function(evt) {
			if (this.linkMode === "replace") {
				evt.preventDefault();
				location.replace(evt.currentTarget.href)
			}
		},

		bindLinks: function() {
			var links = $("a", this.domNode);
			var self = this;
			links.each(function(i, e) {
				self.bind($(e), "click", function() {
					self.controlClicked.apply(self, arguments);
				});
			})
		},

		updateLinkState: function() {
			var links = $("a", this.domNode);
			if (this.isMobileEnhanced()) {
				/*
					we need to do this for jqm
				*/
				links.attr("data-role", "button");
			}
			links.each(function(i, el){
				/*
					we need to do this for jqm.
					this really only happens on initial render, or on model change.
				*/
				var link = $(el);
				if (link.attr("href") != location.hash) {
					link.removeClass('ui-btn-active');
				} else {
					link.addClass('ui-btn-active');
				}
			});
		},

		showState: function() {
			this.inherited(arguments);
			if (this.isMobileEnhanced()) {
				this.updateLinkState();
			}
		},

		updateUI: function() {
			this.updateLinkState();
			this.domNode.trigger("create");
		},

		modelChanged: function() {
			if (this.isMobileEnhanced()) {
				this.updateUI();
			}
			this.bindTemplateEvents(this.domNode);
		},

		destroy: function() {
			if (this.__changeHandler) {
				this.getRepresentation().unbind("change", this.__changeHandler);
			}
			this.inherited(arguments);
		},

		postRepresent: function() {
			var rep = this.getRepresentation();
			this.bindLinks();
			if (this.isMobileEnhanced()) {
				this.groupContainer.attr("data-role", "controlgroup");
				this.updateUI();
			}
			var self = this;
			if ($.isFunction(rep.bind) ) {
				/*
					need a function variable so we can unbind later
					because the can bind function does not except a context argument :
				*/
				this.__changeHandler = function() {
					self.modelChanged();
				};
				this.getRepresentation().bind("change", this.__changeHandler);
			}
			this.inherited(arguments);
		}
	});
});