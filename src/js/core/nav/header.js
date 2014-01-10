define(['jquery', 'widget/declare', 'responsive/statefulview', 'text!./resources/header.html'],
	function($, object, view, template) {
		return object([view], {
			template: template
		})
	}
)