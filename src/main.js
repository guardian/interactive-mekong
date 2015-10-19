var Swiper = require('swiper');
var detect = require('./utils/detect');
var Handlebars = require('handlebars/dist/cjs/handlebars');
var getJSON = require('./utils/getjson');
var template = require('./html/base.html');

/**
 * Guardian visuals interactive project
 *
 * ./utils/analytics.js - Add Google analytics
 * ./utils/detect.js	- Device and env detection
 */

var isMobile = true;

function boot(el) {
	Handlebars.registerPartial({
        'layoutMobile': require('./html/cards/layout-mobile.html'),
        'layoutDesktop': require('./html/cards/layout-desktop.html'),
        'photoCard': require('./html/cards/card-photo.html'),
        'quoteCard': require('./html/cards/card-quote.html'),
        'paragraphCard': require('./html/cards/card-paragraph.html'),
        'videoCard': require('./html/cards/card-video.html')
    });

    //reset if desktop
    if(window.innerWidth > 600){
        isMobile = false;
    }
   

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
