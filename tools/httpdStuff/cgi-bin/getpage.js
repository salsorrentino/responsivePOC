
var page = require('webpage').create(),
    system = require('system'),
    t, query, host;
//console.log("hi", system.env);
if (system.env['QUERY_STRING']) {
    query = system.env['QUERY_STRING'];
    host = "http://" + system.env['HTTP_HOST'];

    var buildRequetMap = function(queryString) {
        var params = {};
        var parts = queryString.split("&");
        for (var i = 0; i < parts.length; i++) {
            var part = parts[i];
            var kva = part.split("=");
            if (kva.length > 1) {
                params[kva[0]] = kva[1];    
            }
            
        };
        return params;
    };
    var params = buildRequetMap(query);
    var newAddress = params['_escaped_fragment_'] ? 
                    [params['_hashbang_page_'], params['_escaped_fragment_']].join("#!") : 
                    params['_hashbang_page_'];

    page.open(host + newAddress, function (status) {
    	var exists = false;
    	var executionCount = 0;
    	var maxExecutionCount = 100;
    	var interval = 100;
    	var pageLoaded = false;
    	// phantom.exit()
    	var pageDone = function() {
    		console.log(page.content);
    		phantom.exit();
    	}
    	var checkPage = function() {
    		if (executionCount < maxExecutionCount && pageLoaded == false) {
    			setTimeout(function() {
		        	executionCount++;
                    // console.log(executionCount);
		        	pageLoaded = page.evaluate(function() {
		        		return document.querySelector("[data-route-complete]");
		        	})
		        	checkPage();
		        }, interval);	
    		} else {
    			pageDone();
    		}
	    }
		checkPage()
    });
} else {
    phantom.exit();
}
