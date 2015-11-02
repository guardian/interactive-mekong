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
			playerComponent = new AudioPlayer(el,player,data);
		} else if(data.card === 'video'){
			playerComponent = new VideoPlayer(el,player,data);
		}

		player.addEventListener("play", function () {
			assetManager.registerPlaying(player);
		}, false);

		player.addEventListener("pause", function () {

		}, false);


		//play button event 
		el.getElementsByClassName('play-btn')[0].addEventListener('click', function(){

			if(!player.paused){
				pause();
			} else {
				play();
			}
		})

		//pause button event 
		el.getElementsByClassName('media-container')[0].addEventListener('click', function(){

			if(!player.paused){
				pause();
			} else {
				play();
			}
		})

		if( data.card === 'video'){
			el.getElementsByClassName('photo-placeholder-container')[0].addEventListener('click', function(){

				if(!player.paused){
					pause();
				} else {
					player.currentTime = 0;
					player.muted = false;
					play();
				}
			})

		}

		

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