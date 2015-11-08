
function loadImage(el, cardData, isMobile){
	console.log('loading image')
	if(isMobile){
		//load image for mobile
		el.querySelector('.photo-bg-container').style.backgroundImage = 'url(' + cardData.photo_url + ')';
	} else {
		//load image for desktop
		el.querySelector('.photo-bg').src = cardData.photo_url;
	}
}


module.exports = {
	loadImage: loadImage
}