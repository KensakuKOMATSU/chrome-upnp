var win_;

if(window.webkitIntent && window.webkitIntent.data && window.webkitIntent.data.target){
	var target = window.webkitIntent.data.target;
	target += "#webkitIntentProxy";

	// win_ = window.open(target)



	document.querySelector('button').onclick = function(){
		console.dir(win_)
		win_ = window.open(target)
		win_.postMessage('hoge', "*");
	}
}