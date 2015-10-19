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
        'photoCard': require('./html/cards/card-photo.html'),
        'quoteCard': require('./html/cards/card-quote.html'),
        'paragraphCard': require('./html/cards/card-paragraph.html'),
        'videoCard': require('./html/cards/card-video.html')
    });
    

	var key = '15ZNdHsQdrCuraPJNVkGfAKcpGhdmqgKngDQXcWak0eU';
	var isLive = ( window.location.origin.search('localhost') > -1 || window.location.origin.search('gutools.co.uk') > -1) ? false : true;
    var folder = (!isLive)? 'docsdata-test' : 'docsdata';

    getJSON('https://interactive.guim.co.uk/' + folder + '/' + key + '.json', 
        function(json){
            console.log(json)
            render(json, el);
        }
    );
}

function render(json, el){
	var content = Handlebars.compile( 
        template, 
        { 
            compat: true
        }
    );
	el.innerHTML = content([]);
}

module.exports = { boot: boot };
