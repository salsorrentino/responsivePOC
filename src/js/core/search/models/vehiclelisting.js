define(["can"], function() {
	var model = can.Model.extend({
		findAll: 'GET /vehicle/search/{stockType}/{make}/{model}/{year}/',
		findOne: 'GET /vehicle/detail/{id}'
		// create:  'POST /todos.json',
		// update:  'PUT /todos/{id}.json',
		// destroy: 'DELETE /todos/{id}.json'
	}, {});
	//testing 

	//setting up the fixture for testing
	var vl = []
	can.fixture({
		'GET /vehicle/search/{stockType}/{make}/{model}/{year}/': function(params) {
			//console.log(arguments)
			var year = params.data.year !== '*' ? params.data.year : 2011;
			var model = params.data.model !== '*' ? params.data.model : "cooper";
			vl = [
					{year: year, make: params.data.make, model: model, price: 10000, id: 1, stockType: params.data.stockType},
					{year: year, make: params.data.make, model: model, price: null, id: 2, stockType: params.data.stockType},
					{year: year, make: params.data.make, model: model, price: 10000, id: 3, stockType: params.data.stockType},
					{year: year, make: params.data.make, model: model, price: 10000, id: 4, stockType: params.data.stockType},
					{year: year, make: params.data.make, model: model, price: 10000, id: 5, stockType: params.data.stockType},
					{year: year, make: params.data.make, model: model, price: 10000, id: 6, stockType: params.data.stockType}
				]
			return {"data": vl};
		},
		'GET /vehicle/detail/{id}': function(params) {
			for (var i = 0; i < vl.length; i++) {
				if (vl[i].id == params.data.id) {
					return vl[i];		
				}
			};
			return {year: 2012, make: "mini", model: 'cooper', price: 10000, id: params.data.id, stockType: 'new'};
			
		}
	});
	return model;
});