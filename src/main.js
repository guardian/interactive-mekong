var Handlebars = require('handlebars/dist/cjs/handlebars');
var getJSON = require('./utils/getjson');
var template = require('./html/base.html');

/**
 * Guardian visuals interactive project
 *
 * ./utils/analytics.js - Add Google analytics
 * ./utils/detect.js	- Device and env detection
 */

function doStuff(data, el) {

}

function boot(el) {
	Handlebars.registerPartial({
        'photoCard': require('./html/cards/card-photo.html')
    });

    var content = Handlebars.compile( 
            template, 
            { 
                compat: true
            }
    );
	el.innerHTML = content([]);

	var key = '1hy65wVx-pjwjSt2ZK7y4pRDlX9wMXFQbwKN0v3XgtXM';
	var url = 'https://interactive.guim.co.uk/spreadsheetdata/' + key + '.json';
	getJSON(url, function(data) {
		doStuff(data, el);
	});
}

module.exports = { boot: boot };
