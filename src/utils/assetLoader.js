var windowWidth,
	imageSize,
	imageSizes = [380, 450, 600];

var protocol = window.location.protocol === 'file:' ? 'https://' : '//';

function init(){
	windowWidth = window.innerWidth;

	for(var s = 0; s < imageSizes.length; s ++){
		if(imageSizes[s] >= windowWidth){
			imageSize = imageSizes[s];
			break;
		} else if( s == imageSizes.length - 1){
			imageSize = imageSizes[s];
		}
	}

}

function loadImage(el, cardData, isMobile){

	if(isMobile){

		if(!imageSize){
			init();
		}
		//load image for mobile
		var url = cardData.mobile_url.replace('http://', protocol);
		url = url.slice( 0, url.lastIndexOf(".")) + '_' + imageSize + url.slice( url.lastIndexOf(".") , url.length);
        var div;
        if( cardData.card ==='title'){
            div = el;
        } else if( cardData.card ==='video'){
            div = el.querySelector('.placeholder-background');
        }else {
            div = el.querySelector('.photo-bg-container');
        }
		div.style.backgroundImage = 'url(' + url + ')';
	} else {
		//load image for desktop
		var url = cardData.photo_url.replace('http://', protocol);
		url = url.slice( 0, url.lastIndexOf(".")) + '_' + cardData.size + url.slice( url.lastIndexOf(".") , url.length);
		el.querySelector('.photo-bg').src = url;
	}
}

function loadIframe(el, link){
    // Extract href of the first link in the content, if any
    var iframe;

    function _postMessage(message) {
        iframe.contentWindow.postMessage(JSON.stringify(message), '*');
    }

    if (link) {
        iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.border = 'none';
        iframe.height = '500'; // default height
        iframe.src = link;

        // Listen for requests from the window
        window.addEventListener('message', function(event) {
            if (event.source !== iframe.contentWindow) {
                return;
            }

            // IE 8 + 9 only support strings
            var message = JSON.parse(event.data);

            // Actions
            switch (message.type) {
                case 'set-height':
                    iframe.height = message.value;
                    break;
                case 'navigate':
                    document.location.href = message.value;
                    break;
                case 'scroll-to':
                    window.scrollTo(message.x, message.y);
                    break;
                case 'get-location':
                    _postMessage({
                        'id':       message.id,
                        'type':     message.type,
                        'hash':     window.location.hash,
                        'host':     window.location.host,
                        'hostname': window.location.hostname,
                        'href':     window.location.href,
                        'origin':   window.location.origin,
                        'pathname': window.location.pathname,
                        'port':     window.location.port,
                        'protocol': window.location.protocol,
                        'search':   window.location.search
                    }, message.id);
                    break;
                case 'get-position':
                    _postMessage({
                        'id':           message.id,
                        'type':         message.type,
                        'iframeTop':    iframe.getBoundingClientRect().top,
                        'innerHeight':  window.innerHeight,
                        'innerWidth':   window.innerWidth,
                        'pageYOffset':  window.pageYOffset
                    });
                    break;
                default:
                   console.error('Received unknown action from iframe: ', message);
            }
        }, false);

        // Replace link with iframe
        // Note: link is assumed to be a direct child
        el.appendChild(iframe);
    }
}




module.exports = {
	loadImage: loadImage,
	loadIframe: loadIframe
}