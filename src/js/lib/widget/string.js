 define([], function() {
 	var util =  {
 		captializaFirstLetter: function(word) {
 			return word && word.length ? word.substr(0,1).toUpperCase() + word.substr(1) : word;
 		},

 		camelize: function(string, splitChar) {
 			var arr = [];
 			splitChar = splitChar ? splitChar : "-";
 			if (string) {
 				var components = string.split(splitChar);
	 			for (i = 0; i < components.length; i++) {
	 				arr.push( i > 0 ?  util.captializaFirstLetter( components[i]) : components[i]);
	 			}
	 			return arr.join("");
	 		}
	 		return undefined;
 		},

 		createMethodName: function(components) {
 			var arr = [];
 			if (components) {
	 			for (i = 0; i < components.length; i++) {
	 				arr.push( i > 0 ?  util.captializaFirstLetter( components[i]) : components[i]);
	 			}
	 			return arr.join("");
	 		}
	 		return undefined;
 		},
 		
 		parseKeyValue: function($node, attrName) {

			var eventString = $node.attr(attrName);
			var result = [];
			if (eventString) {
				var map = eventString.split(",");
				for (var i = 0; i < map.length; i++) {
					var kv = $.trim(map[i]).split(":");
					if (kv.length === 2) {

						var key = $.trim(kv[0]);
						var value = $.trim(kv[1]);
						if (key && value) {
							result.push({key: key, value: value});
						}
					}
					
				};
			}
			return result;
		}
 	}
 	return util;
 });