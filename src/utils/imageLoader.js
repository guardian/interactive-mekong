var windowWidth,
	imageSize,
	imageSizes = [380, 450, 600];

function init(){
	windowWidth = window.innerWidth;

	for(var s = 0; s < imageSizes.length; s ++){
		if(imageSizes[s] >= windowWidth){
			imageSize = imageSizes[s];
			break;
		} else if( s == imageSizes.length - 1){
			imageSize = imageSize[s];
		}
	}

}

function loadImage(el, cardData, isMobile){

	if(!imageSize){
		init();
	}

	if(isMobile){
		//load image for mobile
		var url = cardData.mobile_url;
		url = url.slice( 0, url.lastIndexOf(".")) + '_' + imageSize + url.slice( url.lastIndexOf(".") , url.length);
		el.querySelector('.photo-bg-container').style.backgroundImage = 'url(' + url + ')';
	} else {
		//load image for desktop
		var url = cardData.photo_url;
		url = url.slice( 0, url.lastIndexOf(".")) + '_' + cardData.size + url.slice( url.lastIndexOf(".") , url.length);
		el.querySelector('.photo-bg').src = url;
	}
}


module.exports = {
	loadImage: loadImage
}