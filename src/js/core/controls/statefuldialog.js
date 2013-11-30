define(['jquery', 'responsive/borrowstate', '../mixins/dialog_mixin', 'jquerytools'], function($, view, dialog_mixin) {
	return view.extend([dialog_mixin], {
		previousState: null,


		dialogClosed: function() {
			if (this.previousState) {
				this.router.replaceState(this.previousState);
			} else {
				//attempt fallback
				var currentState = location.hash.split("/");
				if (currentState.length && currentState[currentState.length - 1] == this.suffix) {
					currentState.pop();
					if (currentState[0] == this.router.hashString) {
						currentState[0] = '';
					}
					this.router.replaceState(currentState.join("/"));
				}

			}
		},

		showState: function(route, params) {
			this.inherited(arguments);
			this.open();
		},

		lostState: function(route, params) {
			this.previousState = this.router.buildRoute(route, params);
			this.close();
			this.inherited(arguments);
		},

		postRepresent: function() {
			//var a = this.domNode;
			this.createPopUp();

			this.inherited(arguments);
		}
	});
});