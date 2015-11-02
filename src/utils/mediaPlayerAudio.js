function mediaDisplay(el,player,data){

	var utils = require('./detect');


	player.addEventListener("timeupdate", utils.debounce(function(){ updateProgress(); }, 250), false);

	function loadSource(){
		sourceLoaded = true;
		var sourceEl = document.createElement('source');
			sourceEl.setAttribute('type', 'audio/mpeg');
			sourceEl.setAttribute('src', "https://interactive.guim.co.uk/2015/11/mekong-assets/audio/" + data.audio_url + ".mp3");
			player.appendChild(sourceEl);
	}

	function unloadSource(){
		var sources = player.getElementsByTagName('source');
		while(sources.length > 0){
			sources[0].parentNode.removeChild(sources[0]);
		}
		sourceLoaded = false;
	}

	function updateProgress(){
		if(player.duration && player.currentTime){
			el.querySelector('.audio-time p').innerHTML = getTime( player.currentTime, player.duration );
		
		}
	}

	function getTime(currTime, duration){
	
		var time = Math.floor(duration - currTime);
		if(time == 0){
			time = Math.floor(duration);
		}

		var mins = ~~(time / 60);
		var secs = time % 60;

		// Output like "1:01" or "4:03:59" or "123:03:59"
		ret = "";

		ret += "" + mins + ":" + (secs < 10 ? "0" : "");
		ret += "" + secs;
		return ret;
	}

	return {
		loadSource: loadSource,
		unloadSource: unloadSource
	};
}


module.exports = mediaDisplay;