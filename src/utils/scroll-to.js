const interval = 15, total = 300;

function getOffset(el) {
    return el ? el.offsetTop + getOffset(el.offsetParent) : 0;
}

module.exports = {
	scrollTo: function (el) {
	    var start = window.pageYOffset;
	    var end = getOffset(el);
	    var distance = end - start;
	    var elapsed = 0;

	    window.requestAnimationFrame(function scrollHandler() {
	        var t = elapsed / total;
	        window.scrollTo(0, Math.floor(start + distance * t * (2 - t)));
	        if (elapsed < total) {
	            elapsed += interval;
	            window.requestAnimationFrame(scrollHandler);
	        } else if( elapsed == total){
	        	el.style.position = 'fixed'
	        }
	    });

	    return end;
	}
}