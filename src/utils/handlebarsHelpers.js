
function init(Handlebars){

    Handlebars.registerPartial({
        'layoutMobile': require('./../html/layout-mobile.html'),
        'layoutDesktop': require('./../html/layout-desktop.html'),
        'card': require('./../html/cards/card-base.html'),
        'photoCard': require('./../html/cards/card-photo.html'),
        'quoteCard': require('./../html/cards/card-quote.html'),
        'audioCard': require('./../html/cards/card-audio.html'),
        'paragraphCard': require('./../html/cards/card-paragraph.html'),
        'videoCard': require('./../html/cards/card-video.html'),
        'titleCard': require('./../html/cards/card-title.html')
    });


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

}


module.exports = {
    init: init
}