define(['jquery', 'widget/declare', 'responsive/statefulview', 'text!./resources/footer.html'], function($, object, view, template) {
	return object([view], {
		template: template
	})
})