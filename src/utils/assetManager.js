
//video requirements
var MediaPlayer = require('./mediaPlayer');
var assetLoader = require('./assetLoader');
var bandwidth = require('./bandwidth');
var videoBitRate;

//manage assets currently playing
var queue = [];		
var currentlyPlaying;
var isMobile = true;
var assetList = {};
var cardLookup;
var isMuted = true;

function init(mobile, data){
	isMobile = mobile;
	cardLookup = data;
	//determine bitrate

	if(!isMobile){
		videoBitRate = "4M";
	} else {
		videoBitRate = '768k';
	}

	setTimeout(function() {
        bandwidth.getSpeed(setVideoBitrate);
    }, 2000);
}

function setVideoBitrate(bitrate) {
	var kbps = bitrate / 1024;

	if (kbps >= 4068) { videoBitRate = '4M'; }
	if (kbps < 4068) { videoBitRate  = '2M'; }
	if (kbps < 2048) { videoBitRate  = '768k'; }
	if (kbps < 1024) { videoBitRate  = '488k'; }
	if (kbps < 512)  { videoBitRate  = '220k'; }

}

function initAsset(cardId, el){

	//check to see if assets have been loaded
	//if not, load them

	if(!(cardId in assetList)){
		var cardData = cardLookup[cardId];
		//if the player has not been created, create it
		if(cardData){
			assetList[cardId] = {
				loaded : true,
				card: cardData['card'],
				data: cardData
			}

			//initialize media element
			if(cardData.card === 'video' || cardData.card === 'audio'){
				assetList[cardId].playerComponent = new MediaPlayer(el, cardData, isMobile);
				if(isMobile){
					assetLoader.loadImage(el, cardData, isMobile);
				}
			} else if(cardData.card === 'title'){
				if(isMobile){
					assetLoader.loadImage(el, cardData, isMobile);
				} else {
					assetList[cardId].playerComponent = new MediaPlayer(el, cardData, isMobile);
				}
			} else if(cardData.card === 'photo'){
				assetLoader.loadImage(el, cardData, isMobile);
			} else if(cardData.card === 'iframe'){
				assetLoader.loadIframe(el.querySelector('.iframe-container'), cardData.source);
			}

		}
	}

	//load the source of of the media player
	if( assetList[cardId].card === 'audio' || assetList[cardId].card === 'video' ){
		assetList[cardId].playerComponent.isReady(true);
	} else if( assetList[cardId].card === 'title' && !isMobile){
		assetList[cardId].playerComponent.isReady(true);
	}

	
}

function disableAsset(cardId){

	//see if the card has been created
	if(cardId in assetList){

		//unload the source of of the media player
		if( assetList[cardId].card === 'audio' || assetList[cardId].card === 'video' || assetList[cardId].card === 'title'){
			assetList[cardId].playerComponent.isReady(false);
		}

	}

}

function autoPlay(cardId, isPlaying){
	if(assetList[cardId].card === 'video'){
		assetList[cardId].playerComponent.autoPlay(isPlaying);
	} else if( assetList[cardId].card === 'title' && !isMobile){
		assetList[cardId].playerComponent.autoPlay(isPlaying);
	}

}

function registerPlaying(player){
	if(currentlyPlaying != player){
		if(currentlyPlaying){

			currentlyPlaying.pause();
		}
		currentlyPlaying = player;
	} 	
}

function stopPlaying(){
	if(currentlyPlaying){
		currentlyPlaying.pause();
		currentlyPlaying = null;
	}
}

function unMute(){
	isMuted = false;
}

function getMuteStatus(){
	return isMuted
}

function getBitRate(){
	return videoBitRate
}



module.exports = {
	init: init,
	initAsset: initAsset,
	disableAsset: disableAsset,
	registerPlaying: registerPlaying,
	stopPlaying: stopPlaying,
	autoPlay: autoPlay,
	unMute: unMute,
	getMuteStatus: getMuteStatus,
	getBitRate: getBitRate
};