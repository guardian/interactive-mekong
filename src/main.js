require('./utils/polyfills.js');
var Swiper = require('swiper');
var detect = require('./utils/detect');
var Handlebars = require('handlebars/dist/cjs/handlebars');
var getJSON = require('./utils/getjson');
var template = require('./html/base.html');

// var cardTemplate = require('./html/card-base.html');
/**
 * Guardian visuals interactive project
 *
 * ./utils/analytics.js - Add Google analytics
 * ./utils/detect.js	- Device and env detection
 */

 Handlebars.registerPartial({
    'layoutMobile': require('./html/layout-mobile.html'),
    'layoutDesktop': require('./html/layout-desktop.html'),
    'card': require('./html/cards/card-slide.html'),
    'photoCard': require('./html/cards/card-photo.html'),
    'quoteCard': require('./html/cards/card-quote.html'),
    'paragraphCard': require('./html/cards/card-paragraph.html'),
    'videoCard': require('./html/cards/card-video.html')
});


var isMobile = true;
var cardData;
var cardContent = Handlebars.compile( 
            require('./html/cards/card-base.html'), 
            { 
                compat: true
            }
        );

Handlebars.registerHelper({
    'if_eq': function(a, b, opts) {
        if(a === b){
            return opts.fn(this);
        }
        return opts.inverse(this);
    },
    'if_not_eq': function(a, b, opts) {
        if(a === b){
            return opts.inverse(this);
        }
        return opts.fn(this);
            
    },
    'if_contains': function(a, b, opts){
        if(a.search(b) == -1 ){
            return opts.inverse(this);
        }
        return opts.fn(this);
    },
    'get_card': function(id, cardLookup){
        return id
    }
});


function boot(el) {


    //reset if desktop
    if(window.innerWidth > 600){
        isMobile = false;
    }
   

	var key = '15ZNdHsQdrCuraPJNVkGfAKcpGhdmqgKngDQXcWak0eU';
	var isLive = ( window.location.origin.search('localhost') > -1 || window.location.origin.search('gutools.co.uk') > -1) ? false : true;
    var folder = (!isLive)? 'docsdata-test' : 'docsdata';

    getJSON('https://interactive.guim.co.uk/' + folder + '/' + key + '.json', 
        function(json){
            json.isMobile = isMobile;
            var cardLookup = {};
            json.cards.forEach(function(d){
                cardLookup[d.id] = d;
            })

            json.cardLookup = cardLookup;
            render(json, el);
        }
    );
}

function render(json, el){
    cardData = json;
    console.log(json)

	var content = Handlebars.compile( 
        template, 
        { 
            compat: true
        }
    );
	el.innerHTML = content(json);

    if(json.isMobile){
        var hSwipers = el.getElementsByClassName('swiper-container-h')
        initSwipers(hSwipers);
    }
}

function initSwipers(elems){


    for(var i = 0; i < elems.length; i++) {
        var el = elems[i];
        var gallery = new Swiper(el, {
            pagination: el.getElementsByClassName('swiper-pagination-h')[0],
            paginationClickable: true,
            spaceBetween: 0,

            nextButton: el.getElementsByClassName('swiper-button-next')[0],
            prevButton: el.getElementsByClassName('swiper-button-prev')[0],
            keyboardControl: true,
            mousewheelControl: false,
            mousewheelReleaseOnEdges: true,
            freeModeMomentumBounce: false
        })
        .on('slideChangeStart', function (e) {
            //console.log(e)
            lazyLoad(e.container[0]);
        });

       
        lazyLoad(el)
    }

}

function lazyLoad(el){


    var toLoad = el.querySelectorAll('.swiper-slide-active, .swiper-slide-next, .swiper-slide-prev');
    console.log(toLoad)
    for(var s = 0; s < toLoad.length; s++){
        var div = toLoad[s];
       
        if(div.classList.contains('swiper-slide-pending')){

            div.classList.remove('swiper-slide-pending');
            var id = div.getAttribute('data-card-id');
            div.innerHTML  = cardContent(cardData.cardLookup[id].content[0]);
        }
    }
}


module.exports = { boot: boot };
