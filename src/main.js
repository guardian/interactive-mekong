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
var isMobileFullScreen = false;
var cardData;
var newChapter;

var headerContent = {
    headline: 'Tales <span id="title-break-1">of the</span> river <span id="title-break-2">bank</span>',
    standfirst: 'The fate of 70m people rests on what happens to the Mekong river. Ahead of the Paris climate change summit, John Vidal finds countries calling for clean energy but creating ecological and human havoc with giant dams, deforestation and fast-growing cities',
    isMobile: true
}




function boot(el) {
    //reset if desktop
    if(window.innerWidth > 740){
        isMobile = headerContent.isMobile = false;
    }

    //setup the handlebars templates
    templates.init(Handlebars);


    /////////////////////////////
    //render the shell template with the header
    /////////////////////////////
    var content = Handlebars.compile( 
        require('./html/base.html'), 
        { compat: true }
    );
    el.innerHTML = content(headerContent);

    /////////////////////////////
    //load the spreadsheet data and decide how to layout
    /////////////////////////////

    var key = '1vqPIwCHblYbrRHrvH_xMaQMx_TkEODbW6p6iqFmiNus'; //spreadsheet data
	var isLive = ( window.location.origin.search('localhost') > -1 || window.location.origin.search('gutools.co.uk') > -1 || window.location.origin.search('interactive.guim.co.uk') > -1) ? false : true;
    var folder = (!isLive)? 'docsdata-test' : 'docsdata';

    getJSON('https://interactive.guim.co.uk/' + folder + '/' + key + '.json', 
        function(json){
            
            //determine if display is mobile or desktop
            //organize the cards
            json.isMobile = isMobile;
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

                
                //store the card data
                currentStack.cards.push( cardLookup[ getCardData(e)] )
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
                                json.stories = [{
                                    "chapter": 1,
                                    "cards": [e]
                                }] 
                            }
                        })
                    }
                }
                
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



    //render the template
	var content;
	var div = el.querySelector('.gv-card-container');

    if(isMobile){
        //init the swiper UX for mobile
        content = Handlebars.compile( 
            require('./html/layout-mobile.html'), 
            { compat: true }
        );

        div.innerHTML = content(json);

        initMobile(el);
    } else {
        //init the loader / display for desktop

        content = Handlebars.compile( 
            require('./html/layout-desktop.html'), 
            { compat: true }
        );

        div.innerHTML = content(json);

        initDesktop(el);
    }

    
}

/******************************/
//
//START OF MOBILE FUNCTIONALITY
//
/******************************/

function initMobile(el){

    windowHeight = window.innerHeight;
    document.querySelector('.mobile-cards').style.height = windowHeight + 'px';

    var hSwipers = el.querySelectorAll('.swiper-container-h');
    var vSwiper = el.querySelector('.swiper-container-v');


    //load the container swiper
    new Swiper(vSwiper, {
        paginationClickable: true,
        spaceBetween: 1,
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
    });



    for(var i = 0; i < hSwipers.length; i++) {
        var el = hSwipers[i];

        //initialize swiper
        new Swiper(el, {
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
            scanCardsMobile('section', e.container[0]);
        })
        .on('onSlideChangeEnd', function (e) {
            
        })
        .on('onProgress', function (e, prog) {
   
            if(prog === 1){
                e.container[0].querySelector('.swiper-button-down').classList.remove('swiper-down-disabled');
            } else {
                e.container[0].querySelector('.swiper-button-down').classList.add('swiper-down-disabled');
            }
        });
    }

    scanCardsMobile('chapters', vSwiper);

    //initialize the scroll to button on mobile
    document.querySelector('.gv-start-button').addEventListener('click', function(e){
       document.querySelector('.mobile-cards-overlay').classList.add('mobile-cards-active');
       scroll.scrollTo( document.querySelector('.mobile-cards') );
       isMobileFullScreen = true;
    })

    window.addEventListener( 'resize', detect.debounce(resizeMobile, 250) );

}

function scanCardsMobile(type, el){
    var cards;
    if(type === 'chapters'){

        cards = el.querySelectorAll('.swiper-slide-active .swiper-slide-active, .swiper-slide-active .swiper-slide-next, .swiper-slide-next .swiper-slide-active' );
    } else {
        cards = el.querySelectorAll('.swiper-slide-active, .swiper-slide-next' );
    }

    for(var c = 0; c < cards.length; c ++){
        handleMobileCard(cards[c]);
    }   


}


function handleMobileCard(div){
    //manage the cards on mobile
    if( div.classList.contains('swiper-slide-active') || div.classList.contains('swiper-slide-prev') || div.classList.contains('swiper-slide-next')){
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
    if(!isMobileFullScreen){
        var currentHeight = window.innerHeight;
        
        if(windowHeight < currentHeight){
            document.querySelector('.mobile-cards').style.height = currentHeight + 'px';
            var slides = document.querySelectorAll('.swiper-slide');
            for(var s = 0; s< slides.length; s++){
                slides[s].style.height = currentHeight + 'px';
            }
        }
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
        }, 250)
    );

    window.addEventListener(
        'resize', 
        detect.debounce(function(){
            scanCardsDesktop(el);
        }, 250)
    );

}

function scanCardsDesktop(el){
    
    var slides = el.querySelectorAll('.gv-slide'),
        wTop = (window.pageYOffset || document.documentElement.scrollTop)  - (document.documentElement.clientTop || 0),
        wHeight = window.innerHeight;

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
        if(rect.top < 0){
            var chapterColor = div.parentElement.getAttribute('data-chapter-color');
            console.log(chapterColor)
            //console.log(currentChapter);
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
        nearViewport: ( Math.abs(rect.top) < wHeight * 2.5 ) ? true : false,
        inMiddle: midPoint > wTop + wHeight * .3 && midPoint < wTop + wHeight * .7
    }
}



module.exports = { boot: boot };
