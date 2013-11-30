define(['jquery', 'widget/object', 'responsive/statefulview', 'text!./resources/header.html'],
	function($, object, view, template) {
		return object([view], {
			template: template
		})
	}
)