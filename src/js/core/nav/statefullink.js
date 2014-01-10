define(['widget/declare', 'responsive/statefulview'], function(object,view) {
	return object([view], {
		template: "<a href='{{href}}' data-bind-event='click: linkClicked'>{{{content}}}</a>",
		borrow: "",
		mode: "link",
		suffix: "",
		root: "",
		modes: {
			link: "link",
			replace: "replace",
			back: "back"
		},

		linkClicked: function(evt) {
			if (this.mode === this.modes.replace) {
				evt.preventDefault();
				location.replace(evt.currentTarget.href);
			} else if (this.mode === this.modes.back) {
				evt.preventDefault();
				history.go(-1);
			}
		},

		showState: function(route, params) {
			this.inherited(arguments);
			if (this.mode === this.modes.replace || this.mode === this.modes.link) {
				var myRoute = this.router.buildRoute(this.borrow, params, true);
				// var theRoute = this.router.buildRoute(route, params, true);
				if (myRoute.indexOf("//") < 0) {
					this.getRepresentation().attr("href", this.root + myRoute + this.suffix);
				} 
				if (!this.getRepresentation().attr("href")) {
					this.lostState(route, params, true);
				}
			}
		},
		lostState: function(route, params, force) {
			//override- always show
			if (force) {
				this.inherited(arguments);
			}
		}

	});
});