require(['./common'], function() {
	require(['jquery', 'responsive/page'], function($, responsivePage) {
	    $(document).ready(function() {
			new responsivePage().respond();
	    });
	});
});