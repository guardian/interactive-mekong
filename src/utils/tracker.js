var cardsTracked = {};

function track(cardId){
	if(window.s_gi){
		//if tracking is available
		if(!(cardId in cardsTracked)){
			//track card
			cardsTracked[cardId] = true;
			var track_event = 'gv-card-' + cardId.replace('_', '-');

			var s=s_gi('guardiangu-network');
			s.linkTrackVars='eVar37,events';
			s.linkTrackEvents='event37';
			s.eVar37= track_event;
			s.events='event37';
			s.tl(true,'o', track_event);
			console.log('event fired', track_event);
		}

	}



}




module.exports = {
	track: track
}