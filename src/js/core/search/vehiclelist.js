define(['jquery', 'responsive/statefulview', 'text!./resources/vehiclelist.html','./models/vehiclelisting', 'core/util/formatter'], 
	function($, view, template, model, formatters) {
		return view.extend({
			template: template,
			//scope: null,
			route: '/search/:zip/:stockType/:make/:model/:year/*',
			
			listRendered: false,

			showVehicles: function(vehicles) {
				this.getRepresentation().attr("vehicles", vehicles);
			},
			getHelpers: function() {
				return formatters;
			},

			isComplete: function() {
				return this.listRendered;
			},
			showState: function(route, params) {
				
				if (this.checkLastState(params)) {
					var self = this;
					this.listRendered = false;
					model.findAll(params, function(items) {
						self.showVehicles(items);
						self.listRendered = true;
					});
				}
				this.inherited(arguments);
			},
		})
	}
)