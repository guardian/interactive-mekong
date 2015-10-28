function mediaPlayer(el, data){

	var utils = require('./detect');
	var assetManager = require('./assetManager');
	var AudioPlayer = require('./mediaPlayerAudio');
	var VideoPlayer = require('./mediaPlayerVideo');

	var player;
	var playerComponent;
	var sourceLoaded = false;

	function init(){
		
		player = el.querySelectorAll('audio,video')[0];
		if(data.card === 'audio'){
			//playerComponent = new AudioPlayer(el,player,data);
		} else if(data.card === 'video'){
			//playerComponent = new VideoPlayer(el,player,data);
		}

		player.addEventListener("play", function () {
			assetManager.registerPlaying(player);
		}, false);

		player.addEventListener("pause", function () {

		}, false);



		// el.getElementsByClassName('video-btn').addEventListener('click', function(){

		// 	if(!player.paused){
		// 		pause();
		// 	} else {
		// 		play();
		// 	}
		// })


	}

	function pause(){
		player.pause();
	}

	function play(){
		player.play();
	}

	function isReady(active){
		if(active){

			if(!sourceLoaded){
				sourceLoaded = true;
				playerComponent.loadSource();
			}

		} else {

			if(sourceLoaded){
				sourceLoaded = false;
				playerComponent.unloadSource();
			}

		}

	}

	function updateProgress(){

	}

	init();

	return {
		play: play,
		pause: pause,
		isReady: isReady
	};
}


module.exports = mediaPlayer;