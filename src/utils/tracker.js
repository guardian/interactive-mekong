var cardsTracked = {};

function track(cardId){
	
	if(!(cardId in cardsTracked)){
		//track card
		cardsTracked[cardId] = true;
		//console.log(cardId)

	}

}




module.exports = {
	track: track
}