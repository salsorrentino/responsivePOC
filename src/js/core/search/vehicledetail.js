define(['jquery', 'can', 'responsive/statefulview', 'text!./resources/vehicledetail.html', 'core/search/models/vehiclelisting', 'core/util/formatter'],
	function($, can, view, template, model, formatters) {
		return view.extend({
			template: template,
			scope: null,
			currentParams: null,
			tabs: null,
			isVehicleDisplayed: false,
			routeMap: {
				main:'/vehicle/detail/:tab/:id/*',
				overview: '/vehicle/detail/overview/:id',
				offers: '/vehicle/detail/offers/:id'
			},
			tabController: null,
			init: function() {
				view.connect(this, "showVehicle", function() {
					console.log("showing", arguments);
				})
			},
			getHelpers: function() {
				return formatters;
			},
			// getTabs: function() {
			// 	if (this.tabs == null) {
			// 		this.tabs = new can.Map({
			// 			links: []
			// 		});
			// 	}
			// 	return this.tabs;
			// },

			routes: function() {
				return [this.routeMap.main];
			},

			checkLastState: function(params) {
				var search = this.router.buildRoute("/:id", params);
				if (search != this.lastSearch) {
					this.lastSearch = search;
					return true;
				}
				return false;
			},
			
			showVehicle: function(vehicle) {
				if (vehicle) {
					var rep = this.getRepresentation();
					vehicle.each(function(val, prop) {
						rep.attr(prop, val);
					})
					if (this.tabController) {
						this.tabController.updateLinkState();
					}
					// var tabs = this.getTabs();
					// tabs.attr("links", [
					// 	{href: this.router.buildRoute(this.routeMap.overview, vehicle, true), label: "Overview"}, 
					// 	{href: this.router.buildRoute(this.routeMap.offers, vehicle, true), label: "Offers"}
					// ]);
				};
				
			},
			isComplete: function() {
				return this.isVehicleDisplayed;
			},

			showState: function(route, params) {
				var self = this;
				this.currentParams = params;
				if (this.checkLastState(params)) {
					self.isVehicleDisplayed = false;
					model.findOne(params, function(item) {
						self.showVehicle(item);
						self.isVehicleDisplayed = true;
					});
				}
				this.inherited(arguments);
			}
		});
	}
);