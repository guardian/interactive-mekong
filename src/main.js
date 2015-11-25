require( './utils/polyfills.js');

var Swiper = require('swiper');
var Handlebars = require('handlebars/dist/cjs/handlebars');
var detect = require('./utils/detect');
var getJSON = require('./utils/getjson');
var assetManager = require('./utils/assetManager');
var tracker = require('./utils/tracker');
var scroll = require('./utils/scroll-to');
var templates = require('./utils/handlebarsHelpers.js');


var windowHeight;
var isAlt = false;
var isMobile = true;
var isAndroidApp = ( detect.isAndroid() && window.location.origin === "file://" ) ? true : false;
var isMobileFullScreen = false;
var cardData;
var newChapter;

var shareMedia = ['facebook', 'twitter'];
var shareUrl = "http://gu.com/p/4dk3p";
var shareMessage = 'Mekong: a river rising. The fate of 70m people rests on what happens to the Mekong river. pic.twitter.com/ffsx0k5gNn';
var shareImage = "http://media.guim.co.uk/d3372f1a20be9c5fea7b8419d7b7b8a4a531cb47/49_0_1801_1080/1801.jpg";
var headerContent = {
    headline: "<span>Mekong:</span> a river rising",
    standfirst: 'The fate of 70 million people rests on what happens to the Mekong river. With world leaders meeting in Paris next week for crucial UN climate talks, John Vidal journeys down south-east Asia’s vast waterway - a place that encapsulates some of the dilemmas they must solve. He meets people struggling to deal with the impacts of climate change as well as the ecological havoc created by giant dams, deforestation, coastal erosion and fast-growing cities',
    mobile_standfirst: 'The fate of 70 million people rests on what happens to the Mekong river. Ahead of the Paris climate change summit, John Vidal finds countries calling for clean energy but creating ecological and human havoc',
    isMobile: true,
    media: shareMedia
}
var verticalSwiper;






function boot(el) {
    //reset if desktop
    if(window.innerWidth > 740){
        isMobile = headerContent.isMobile = false;
    }

    if(isAndroidApp){
        el.style.height = '2000px';
        setTimeout(function(){

            start(el);
            el.style.position = 'relative';
        },60)
    } else {
        start(el);
        
    }
    
}

function start(el){

    

    //setup the handlebars templates
    templates.init(Handlebars);


    /////////////////////////////
    //render the shell template with the header
    /////////////////////////////

    windowHeight = getInnerHeight();
    if(!isAndroidApp){
        headerContent.windowHeight = windowHeight;
    }

    var content = Handlebars.compile( 
        require('./html/base.html'), 
        { compat: true }
    );
    el.innerHTML = content(headerContent);

    
    if(isAndroidApp){
       el.style.height = '2000px'; 
    }


    /////////////////////////////
    //load the spreadsheet data and decide how to layout
    /////////////////////////////

    var key = '1vqPIwCHblYbrRHrvH_xMaQMx_TkEODbW6p6iqFmiNus'; //spreadsheet data
    //var isLive = ( window.location.origin.search('localhost') > -1 || window.location.origin.search('gutools.co.uk') > -1 || window.location.origin.search('interactive.guim.co.uk') > -1) ? false : true;
    var isLive = false;
    var folder = (!isLive)? 'docsdata-test' : 'docsdata';

    getJSON('https://interactive.guim.co.uk/' + folder + '/' + key + '.json', 
        function(json){
            
            //determine if display is mobile or desktop
            //organize the cards
            json.isMobile = isMobile;
            json.minWidth = window.innerWidth;
            json.media = shareMedia;
            json.stacks = [];
            var cardLookup = {};
            
            
            for(var key in json.sheets){
                if(key !== "overview"){
                    json.sheets[key].forEach(function(d){
                        cardLookup[key + "_" + d.id] = d;
                        d.card = key;
                    })
                }
            }

            var currentStack;
            var currentChapter;

            json.sheets["overview"].forEach(function(e){
                //if new chapter data is detected
                if(e.chapter !== ''){
                    currentChapter = {
                        chapter: e.chapter,
                        nav_title: e.nav_title,
                        background: e.background
                    }
                }

               
                if(isMobile){
                     ////////nesting for mobile
                    if(e.mobile_stack === 'new_stack'){

                        currentStack = {
                            chapterData: currentChapter,
                            cards: []
                        }
                        json.stacks.push(currentStack);

                    }

                } else {
                    /////// nesting for desktop
                    if(e.chapter !== ''){

                        currentStack = {
                            chapterData: currentChapter,
                            cards: []
                        }
                        json.stacks.push(currentStack);
                    }

                }

                var card = cardLookup[ e.card ];
   
                if(e.transition){
                    card.transition = e.transition;
                }

                if(e.transition_copy){
                    card.transition_copy = e.transition_copy;
                }
                //store the card data
                currentStack.cards.push( card )
            })

 
            //init the asset manager
            assetManager.init(isMobile, cardLookup);

            //render            
            if(document.location.search.indexOf('preview')>-1){
                //render alt cards
                var value = document.location.search.split('=')[1]  ;  

                for(sheet in json.sheets){
                    if(sheet !== "overview"){
                        json.sheets[sheet].forEach(function(e){
                            if(e.card + "_" + e.id === value){
                                json.stacks = [{
                                    "chapterData": {
                                        "background": "#333",
                                        "chapter": "1",
                                        "nav_title": "The first dam"
                                    },
                                    "cards": [e]
                                }] 
                            }
                        })
                    }
                }
                console.log('hdoei')
                console.log(json);
                render(json,el);
            }else{
                render(json, el);                
            }
            
        }
    );
}



function render(json, el){
    cardData = json;
    console.log(json)


    //render the template
    var content;
    var div;

    if(isMobile){
        div = el.querySelector('.swiper-container-v .swiper-wrapper');

        //init the swiper UX for mobile
        content = Handlebars.compile( 
            require('./html/layout-mobile.html'), 
            { compat: true }
        );

        div.innerHTML += content(json);

        initMobile(el);
    } else {
        //init the loader / display for desktop
        div = el.querySelector('.gv-card-container');
        content = Handlebars.compile( 
            require('./html/layout-desktop.html'), 
            { compat: true }
        );

        div.innerHTML = content(json);

        initDesktop(el);
    }
    document.querySelector('body').classList.add('gv-loaded');
    //init share
    initShare(el);

    
}

/******************************/
//
//START OF MOBILE FUNCTIONALITY
//
/******************************/

function initMobile(el){

    document.querySelector('.mobile-cards').style.height = el.style.height = getInnerHeight() + 'px';

    var hSwipers = el.querySelectorAll('.swiper-container-h');
    var vSwiper = window.gvvertical = el.querySelector('.swiper-container-v');
    var header = document.querySelector('#header');

    //load the container swiper
    verticalSwiper = new Swiper(vSwiper, {
        paginationClickable: true,
        spaceBetween: 0,
        direction: 'vertical',
        nextButton: el.querySelectorAll('.swiper-button-down'),
        //prevButton: el.getElementsByClassName('swiper-button-prev')[0],
        keyboardControl: true,
        mousewheelControl: true,
        mousewheelReleaseOnEdges: true,
        freeModeMomentumBounce: false,
    })
    .on('onSlideChangeStart', function (e) {
        assetManager.stopPlaying();
        
    })
    .on('onSlideChangeEnd', function (e) {
        scanCardsMobile('chapters', e.container[0]);

        if(header){
            if(e.progress > 0 && e.progress < 1){
                header.classList.add('gv-hidden');
            } else {
                header.classList.remove('gv-hidden');
            }
        }
    })
    .on('onTouchStart', function (swiper, e) {
        if(isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch){
            window.GuardianJSInterface.registerRelatedCardsTouch(true);
        }
    })
    .on('onTouchEnd', function (swiper, e) {
        if(isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch){
            window.GuardianJSInterface.registerRelatedCardsTouch(false);
        }
    });





    for(var i = 0; i < hSwipers.length; i++) {
        var el = hSwipers[i];

        if(hSwipers[i].querySelectorAll('.gv-slide').length > 1){
            //initialize swiper
            new Swiper(el, {
               pagination: el.getElementsByClassName('swiper-chapter-pagination')[0],
                paginationClickable: true,
                spaceBetween: 0,
                 nextButton: el.getElementsByClassName('swiper-button-next')[0],
                // prevButton: el.getElementsByClassName('swiper-button-prev')[0],
                keyboardControl: true,
                mousewheelControl: false,
                mousewheelReleaseOnEdges: true,
                freeModeMomentumBounce: false
            })
            .on('onSlideChangeStart', function (e) {
                assetManager.stopPlaying();
                scanCardsMobile('section', e.container[0]);
            })
            .on('onTouchStart', function (swiper, e) {
                if(isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch){
                    window.GuardianJSInterface.registerRelatedCardsTouch(true);
                }
            })
            .on('onTouchEnd', function (swiper, e) {
                if(isAndroidApp && window.GuardianJSInterface.registerRelatedCardsTouch){
                    window.GuardianJSInterface.registerRelatedCardsTouch(false);
                }
            });
        }
        
    }

    scanCardsMobile('chapters', vSwiper);

    //initialize the scroll to button on mobile
    document.querySelector('.gv-start-button').addEventListener('click', function(e){
       positionMobile();
    })

    window.addEventListener( 'resize', detect.debounce(resizeMobile, 250) );

}

function scanCardsMobile(type, el){
    var cards;
    if(type === 'chapters'){
        cards = el.querySelectorAll('.swiper-slide-active .slide-single, .swiper-slide-next .slide-single, .swiper-slide-active .swiper-slide-active, .swiper-slide-active .swiper-slide-next, .swiper-slide-next .swiper-slide-active' );
    } else {
        cards = el.querySelectorAll('.swiper-slide-active, .swiper-slide-next' );
    }

    for(var c = 0; c < cards.length; c ++){
        handleMobileCard(cards[c]);
    }   


}


function handleMobileCard(div){
    //manage the cards on mobile
    if( div.classList.contains('swiper-slide-active') || div.classList.contains('slide-single') || div.classList.contains('swiper-slide-next')){
        enableCard(div, true, false);

        tracker.track(div.getAttribute('data-card-id'));
        

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

function resizeMobile(){

    //deals with weird ios behavior when browser nav + share bar hide and reveal

        var currentHeight = getInnerHeight();;
        if( currentHeight != windowHeight){
            windowHeight = currentHeight;
            document.querySelector('.mobile-cards').style.height = currentHeight + 'px';
            verticalSwiper.update(true);
        }
}



/******************************/
//
//START OF DESKTOP FUNCTIONALITY
//
/******************************/

function initDesktop(el){
    
    scanCardsDesktop(el);

    window.addEventListener(
        'scroll', 
        detect.debounce(function(){
            scanCardsDesktop(el);
        }, 100)
    );

    window.addEventListener(
        'resize', 
        detect.debounce(function(){
            scanCardsDesktop(el);
        }, 100)
    );

}

function scanCardsDesktop(el){
    
    var slides = el.querySelectorAll('.gv-slide'),
        wTop = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0),
        wHeight = getInnerHeight();

    for(var s = 0; s < slides.length; s ++){
        handleDesktopCard(slides[s], wTop, wHeight);
    }
}

function handleDesktopCard(div, wTop, wHeight){
    
    //manage the cards on mobile
    var rect = div.getBoundingClientRect();
    var midPoint = rect.top + rect.height/2 + wTop;
    var position = getPosition(wTop,wHeight,rect);

    if(div.classList.contains('slide-title')){
        if(rect.top < 100){
            var chapterColor = div.parentElement.getAttribute('data-chapter-color');
            document.querySelector('body').style.background = chapterColor;
        }
    }    

    if(position.nearViewport ) {
        //load if in the viewport
        var autoPlay = false;

        //slide tracking etc
        if(position.inViewport){
            if( !div.classList.contains('slide-video') && !div.classList.contains('slide-audio') && !div.classList.contains('slide-title') ){
                div.classList.remove('gv-slide');
            }

            tracker.track(div.getAttribute('data-card-id'));
        }
        
        if( position.inMiddle ){
            autoPlay = true;
        } else {
            autoPlay = false;
        }
 
        enableCard(div, true, autoPlay);
        

    } else {
        enableCard(div, false, false);
    }
}

//helper functions
function getPosition(wTop, wHeight, rect){
    var midPoint = rect.top + rect.height/2 + wTop;

    return {
        inViewport: (midPoint > wTop - wHeight && midPoint < wTop + wHeight) ? true : false,
        nearViewport: ( Math.abs(rect.top) < wHeight * 2 ) ? true : false,
        inMiddle: midPoint > wTop + wHeight * .3 && midPoint < wTop + wHeight * .7,
        inTopHalf: ( Math.abs(rect.top) < wHeight / .5 ) ? true : false
    }
}

function initShare(el){
    var shareButtons = el.querySelectorAll('.gv-share');
    for(var s = 0; s < shareButtons.length; s ++){
        shareButtons[s].addEventListener('click', share);
    }
}

function share(e){
    var btn = e.srcElement;
    var shareWindow;
    var twitterBaseUrl = "http://twitter.com/share?text=";
    var facebookBaseUrl = "https://www.facebook.com/dialog/feed?display=popup&app_id=741666719251986&link=";

    if( btn.classList.contains('share-twitter') ){

        shareWindow = twitterBaseUrl + 
                        encodeURIComponent(shareMessage) + 
                        "&url=" + 
                        encodeURIComponent(shareUrl);

    } else if( btn.classList.contains('share-facebook') ){

        shareWindow = facebookBaseUrl + 
                        encodeURIComponent(shareUrl) + 
                        "&picture=" + 
                        encodeURIComponent(shareImage) + 
                        "&redirect_uri=http://www.theguardian.com";
    }

    window.open(shareWindow, "Share", "width=640,height=320"); 

}

function getInnerHeight(){
    var h = window.innerHeight;

    if(isAndroidApp){
        h = h - 77;
    }
    return h;
}





module.exports = { boot: boot };