function mediaPlayer(el, data, isMobile){

	var utils = require('./detect');
	var assetManager = require('./assetManager');
	var AudioPlayer = require('./mediaPlayerAudio');
	var VideoPlayer = require('./mediaPlayerVideo');

	var player;
	var playerComponent;
	var sourceLoaded = false;
	var isAutoPlaying = false;
	var isMuted = assetManager.getMuteStatus();

	function init(){
		player = el.querySelectorAll('audio,video')[0];
		if(data.card === 'audio'){
			playerComponent = new AudioPlayer(el,player,data, isMobile);
		} else if(data.card === 'video' || data.card === 'title'){
			playerComponent = new VideoPlayer(el,player,data, isMobile);
		}

		player.addEventListener("play", function () {
			if(data.card !== 'title'){
				assetManager.registerPlaying(player);
			}
			
			el.classList.add("playing");
		}, false);
		player.addEventListener("pause", function () {
			el.classList.remove("playing");
		}, false);

		if( data.card === 'video'){
			el.getElementsByClassName('photo-placeholder-container')[0].addEventListener('click', function(){
				if(!player.paused){
					if(isMuted){
						player.muted = false;
						assetManager.unMute();
						isMuted = assetManager.getMuteStatus();
						el.getElementsByClassName('card-video')[0].classList.remove('video-muted');
					}else{
						pause();
					}
				} else {
					if(isMuted){
						player.muted = false;
						assetManager.unMute();
						el.getElementsByClassName('card-video')[0].classList.remove('video-muted');
					}
					play();
				}
			})
		}else if( data.card === 'audio'){
			el.getElementsByClassName('media-container')[0].addEventListener('click', function(){
				console.log('clicked media-container')
				if(!player.paused){
					pause();
				} else {
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

	function autoPlay(isPlaying){
		isMuted = assetManager.getMuteStatus();
		if(isAutoPlaying != isPlaying){

			if(isPlaying){
				//turn autplaying on
				isAutoPlaying = true;
				player.muted = isMuted;
				player.play();
				
				if(!isMuted){
					el.getElementsByClassName('card-video')[0].classList.remove('video-muted');
				}

			} else {
				//turn autplaying off
				//console.log('off')
				isAutoPlaying = false;
				player.pause();
			}

		} 

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
		isReady: isReady,
		autoPlay: autoPlay
	};
}


module.exports = mediaPlayer;