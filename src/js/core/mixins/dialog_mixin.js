define(['jquery', 'widget/object', 'jquerytools'], function($, object) {
	return object({
		template: "<div class='simple-overlay'>{{{content}}}</div>",
		modal: false,
		maskOpacity: 0.5,
		maskColor: "#000000",
		maskLoadSpeed: 200,
		_popUpCreated: false,

		open: function() {
			if (!this._popUpCreated) {
				this.createPopUp();
			}
			this.domNode.overlay().load();
		},

		close: function() {
			if (this._popUpCreated) this.domNode.overlay().close();
		},
		

		createPopUp: function() {
			var self = this;
			var conf = {
				load: false, left: "center", top: "center",
				onClose: function() {
					if (self.dialogClosed) self.dialogClosed.apply(self, arguments);
				},
				onLoad: function() {
					if (self.dialogOpened) self.dialogOpened.apply(self, arguments);	
				},
				onBeforeClose: function() {
					if (self.dialogWillClose) self.dialogWillClose.apply(self, arguments);
				},
				onBeforeLoad: function() {
					if (self.dialogWillOpen) self.dialogWillOpen.apply(self, arguments);	
				}
			};
			if (this.modal) {
				conf.mask = {
					color: this.maskColor,
					opacity: this.maskOpacity,
					loadSpeed: this.maskLoadSpeed
				}
				conf.closeOnClick = false;
			}
			if (this.domNode.overlay == null) {
				//in case domnode was initialized withou jquerytools
				this.domNode = $(this.domNode);
			}
			this.domNode.overlay(conf);
			this._popUpCreated = true;
		}
		
	});
});