require('./utils/polyfills.js');
var Swiper = require('swiper');
var detect = require('./utils/detect');
var Handlebars = require('handlebars/dist/cjs/handlebars');
var getJSON = require('./utils/getjson');
var template = require('./html/base.html');
var assetManager = require('./utils/assetManager.js')

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
    'card': require('./html/cards/card-base.html'),
    'photoCard': require('./html/cards/card-photo.html'),
    'quoteCard': require('./html/cards/card-quote.html'),
    'audioCard': require('./html/cards/card-audio.html'),
    'paragraphCard': require('./html/cards/card-paragraph.html'),
    'videoCard': require('./html/cards/card-video.html'),
    'titleCard': require('./html/cards/card-title.html')
});

var isAlt = false;
var isMobile = true;
var cardData;
var newChapter;
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
    'get_pending_status': function(cardType, isMobile){

        if( !isMobile ){ 
           return (cardType === 'audio' || cardType ==='video') ? 'swiper-slide-pending' : false;
        } 
        return false;
    }
});


function boot(el) {
    //reset if desktop
    if(window.innerWidth > 740){
        isMobile = false;
    }

	// var key = '15ZNdHsQdrCuraPJNVkGfAKcpGhdmqgKngDQXcWak0eU';
    var key = '1vqPIwCHblYbrRHrvH_xMaQMx_TkEODbW6p6iqFmiNus'; //spreadsheet data
	var isLive = ( window.location.origin.search('localhost') > -1 || window.location.origin.search('gutools.co.uk') > -1) ? false : true;
    // var folder = (!isLive)? 'docsdata-test' : 'docsdata';
    var folder = 'docsdata-test';

    getJSON('https://interactive.guim.co.uk/' + folder + '/' + key + '.json', 
        function(json){
            
            //determine if display is mobile or desktop
            //organize the cards
            json.isMobile = isMobile;
            var cardLookup = {};
            json.stories = [];
            
            for(var key in json.sheets){
                if(key !== "overview"){
                    json.sheets[key].forEach(function(d){
                        cardLookup[key + "_" + d.id] = d;
                        d.card = key;
                    })
                }
            }

            json.sheets["overview"].forEach(function(e){
                if(e.chapter){
                    json.stories.push({
                        chapter: e.chapter,
                        cards: []
                    })
                }
       
                //store the card data
                json.stories[ json.stories.length - 1 ].cards.push( cardLookup[ getCardData(e)] )
            })

            //init the asset manager
            assetManager.init(isMobile, cardLookup);

            //render            
            if(document.location.search.indexOf('preview')>-1){
                //render alt cards
                var value = document.location.search.split('=')[1]  ;  
                // json.stories = [];
                // value.forEach(function(i){
                //     json.stories.push({
                //         cards: [ {card: i} ]
                //     })
                // })
                for(sheet in json.sheets){
                    if(sheet !== "overview"){
                        json.sheets[sheet].forEach(function(e){
                            if(e.card + "_" + e.id === value){
                                json.stories = [{
                                    "chapter": 1,
                                    "cards": [e]
                                }] 
                            }
                        })
                    }
                }
                console.log(json);
                render(json,el);
            }else{

                render(json, el);
            }
            
        }
    );
}

function getCardData(cardData){
    return (isAlt && cardData.alternate_card) ? cardData.alternate_card : cardData.card;
}

function render(json, el){
    cardData = json;
	var content = Handlebars.compile( 
        template, 
        { 
            compat: true
        }
    );
	el.innerHTML = content(json);

    if(isMobile){
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
            pagination: el.getElementsByClassName('swiper-pagination')[0],
            paginationClickable: true,
            spaceBetween: 0,

            nextButton: el.getElementsByClassName('swiper-button-next')[0],
            prevButton: el.getElementsByClassName('swiper-button-prev')[0],
            keyboardControl: true,
            mousewheelControl: false,
            mousewheelReleaseOnEdges: true,
            freeModeMomentumBounce: false
        })
        .on('onSlideChangeStart', function (e) {
            assetManager.stopPlaying();
            scanCards(e.container[0]);
        });

        scanCards(el);

    }

}



function scanCards(el){
    
    var slides = el.querySelectorAll('.swiper-slide'),
        wtop,
        wheight;
    
    //measure if on desktop to know what to load
    if(!isMobile){
        wTop = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0);
        wHeight = window.innerHeight;
    }

    

    for(var s = 0; s < slides.length; s ++){

        var slide = slides[s];
        
        if(isMobile){
            handleMobileCard(slide);
        } else {
            handleDesktopCard(slide, wTop, wHeight);
        }
    }
}

function handleMobileCard(div){
    //manage the cards on mobile
    if( div.classList.contains('swiper-slide-active') || div.classList.contains('swiper-slide-prev') || div.classList.contains('swiper-slide-next')){
        enableCard(div, true);
    } else {
        enableCard(div, false);
    }
}

function handleDesktopCard(div, wTop, wHeight){
    
    //manage the cards on mobile
    var rect = div.getBoundingClientRect();
    var midPoint = rect.top + rect.height/2 + wTop;
    
    if(div.className.indexOf('slide-title') > -1){
        if(rect.top < 0){
            var colors = ["#333","#867F75","#7D7569","#484f53"]
            var currentChapter = div.getAttribute('data-card-id').split('_')[1];
            console.log(currentChapter);
            document.querySelector('body').style.background = colors[currentChapter-1];
        }
    }

    if(midPoint > wTop - wHeight * .5 && midPoint < wTop + wHeight * 2 ) {
        //load if in the viewport
        var autoPlay = false;
        if( midPoint > wTop + wHeight * .33 && midPoint < wTop + wHeight * .66){
           // console.log(rect)
            //console.log('autoplayin', midPoint, wTop + wHeight * .33, wTop + wHeight * .66)

            autoPlay = true;
        } else {
            autoPlay = false;
        }

        enableCard(div, true, autoPlay);
        

    } else {
        enableCard(div, false, false);
    }
}


function enableCard(div, isEnabled, autoPlay){

    //lookup card id
    var cardId = div.getAttribute('data-card-id');
    
    //load/activate the card media
    if(isEnabled){
        div.classList.remove('swiper-slide-pending')
        assetManager.initAsset(cardId, div);

        if( autoPlay ){
            //console.log('autoplayin', cardId)
            assetManager.autoPlay(cardId, true);
        } else {
            assetManager.autoPlay(cardId, false);
        }
            
    } else {
        assetManager.disableAsset(cardId);
    }
    
}

function initDesktop(el){
    scanCards(el);

    window.addEventListener(
        'scroll', 
        detect.debounce(function(){
            scanCards(el);
        }, 250)
    );

    window.addEventListener(
        'resize', 
        detect.debounce(function(){
            scanCards(el);
        }, 250)
    );

}

function inDesktopView(top,height,rect){
    if(rect.top <= top + height){
        return true;
    } 
    return false;
}




module.exports = { boot: boot };
