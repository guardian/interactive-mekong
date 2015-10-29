
//video requirements
var MediaPlayer = require('./mediaPlayer');
var bandwidth = require('./bandwidth');
var DEFAULT_BITRATE = '488k';
var videoBitRate = DEFAULT_BITRATE;

//manage assets currently playing
var queue = [];		
var currentlyPlaying;
var isMobile = true;

function init(mobile){
	isMobile = mobile;

	//determine bitrate
	setTimeout(function() {
        bandwidth.getSpeed(setVideoBitrate);
    }, 2000);
}

function setVideoBitrate(bitrate) {
	var kbps = bitrate / 1024;
	console.log(kbps)
	if (kbps >= 4068) { videoBitRate = '4M'; }
	if (kbps < 4068) { videoBitRate  = '2M'; }
	if (kbps < 2048) { videoBitRate  = '768k'; }
	if (kbps < 1024) { videoBitRate  = '488k'; }
	if (kbps < 512)  { videoBitRate  = '220k'; }
}

function registerAsset(el, data){
	console.log('herehere', el, data)
	var player = new MediaPlayer(el, data);
	queue.push(player);
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


module.exports = {
	init: init,
	registerAsset: registerAsset,
	registerPlaying: registerPlaying,
	stopPlaying: stopPlaying
};