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
    'audioCard': require('./html/cards/card-audio.html'),
    'paragraphCard': require('./html/cards/card-paragraph.html'),
    'videoCard': require('./html/cards/card-video.html'),
    'cardContent': require('./html/cards/card-base.html')
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
    'get_card_content': function(id){
        return cardData.cardLookup[id].content[0];
    },
    'get_card_size': function(id){
        return cardData.cardLookup[id].content[0].size;
    },
    'get_card_margin': function(id){
        return cardData.cardLookup[id].content[0].margin;
    }
});


function boot(el) {


    //reset if desktop
    if(window.innerWidth > 740){
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

            // AUDIO DEBUG

            console.log(json);
            json.stories[0].cards = ["5","6","7","8","9"]

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
        //init the swiper UX for mobile
        var hSwipers = el.getElementsByClassName('swiper-container-h')
        initMobile(hSwipers);
    } else {
        //init the loader / display for desktop
        initDesktop(el);
    }
}

function initMobile(elems){


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

function initDesktop(el){

    lazyLoad(el);

    window.addEventListener(
        'scroll', 
        detect.debounce(function(){
            lazyLoad(el);
        }, 250)
    );

    window.addEventListener(
        'resize', 
        detect.debounce(function(){
            lazyLoad(el);
        }, 250)
    );

}

function lazyLoad(el){
    var top = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0);
    var height = window.innerHeight;
    var toLoad;
    if( cardData.isMobile ){
        toLoad = el.querySelectorAll('.swiper-slide-active, .swiper-slide-next, .swiper-slide-prev');
    } else {
        toLoad = el.querySelectorAll('.swiper-slide-pending');
    }
    

    for(var s = 0; s < toLoad.length; s++){
        var div = toLoad[s];

        //if mobile
        if(div.classList.contains('swiper-slide-pending') && cardData.isMobile ){
            loadCard(div)
        }

        //if desktop
        if(!cardData.isMobile){
            // console.log(div)
            var rect = div.getBoundingClientRect();
        
            if(inDesktopView(top,height,rect)){
                loadCard(div);
            } else {
                break;
            }
        }
    }

}

function inDesktopView(top,height,rect){
    if(rect.top <= top + height){
        return true;
    } 
    return false;
}

function loadCard(div){
    div.classList.remove('swiper-slide-pending');
    var id = div.getAttribute('data-card-id');
    div.innerHTML  = cardContent(cardData.cardLookup[id].content[0]);
}


module.exports = { boot: boot };
