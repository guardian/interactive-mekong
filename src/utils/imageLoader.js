
function loadImage(el, cardData, isMobile){

	if(isMobile){
		//load image for mobile
		el.querySelector('.photo-bg-container').style.backgroundImage = 'url(' + cardData.photo_url + ')';
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