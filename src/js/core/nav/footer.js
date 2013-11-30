define(['jquery', 'widget/object', 'responsive/statefulview', 'text!./resources/footer.html'], function($, object, view, template) {
	return object([view], {
		template: template
	})
})