define(['jquery', 'can', 'responsive/statefulview', 'text!./resources/searchForm.html'],
	function($, can, view, template) {
		return view.extend({
			template: template,
			route: "/search(/:zip/:stockType/:make/:model/:year)",
			rep: null,
			resultsPage: "search-results/",

			init: function() {
				// alert("init")
			},

			getRepresentation: function() {
				if (this.rep == null) {
					this.rep = new can.Map({
						stockType: "used",
						make: "*",
						model: "*",
						year: "*",
						zip: "46311",
						newId: this.genUniqueId(),
						usedId: this.genUniqueId(),
						cpoId: this.genUniqueId()
					})
				}
				return this.rep;
			},

			showState: function(route, params) {
				//console.log("showState:", this.route, route, params);
				var rep = this.getRepresentation();
				for (prop in params) {
					rep.attr(prop, params[prop]);
				}
				this.syncInputs();
				this.inherited(arguments);
			},

			syncInputs: function() {
				
				if (this.isMobileEnhanced()) {
					$("input[name=stockType]", this.stockTypeSelect).checkboxradio('refresh');
					$("select", this.domNode).selectmenu('refresh');
				}
			},

			formChanged: function() {
				this.makeStateActive(true);
			},
			
			formSubmit: function(evt) {
				evt.preventDefault();
				this.doSearch();
			},

			doSearch: function() {
				window.location = this.resultsPage +  this.buildRoute(null, true);
			},

			stockTypeChanged: function() {
				console.log(this.getRepresentation().attr("stockType"));
				// this.getRepresentation().attr("stockType", this.stockTypeSelect.val());
			},

			makeChanged: function() {
				console.log(this.getRepresentation().attr("make"));
				//this.getRepresentation().attr("make", this.makeSelect.val());
			},

			modelChanged: function() {
				console.log(this.getRepresentation().attr("model"));
				// this.getRepresentation().attr("model", this.modelSelect.val());
			},

			yearChanged: function() {
				console.log(this.getRepresentation().attr("year"));
				// this.getRepresentation().attr("year", this.yearSelect.val());
			},

			zipChanged: function() {
				console.log(this.getRepresentation().attr("zip"));
				// this.getRepresentation().attr("zip", this.zipSelect.val());
			}

		})
	}
)