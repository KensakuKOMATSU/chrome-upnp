
console.log("start")

function handleIntent(intent) {
	$("output").append(intent.data+"<br>")

	// echo
	intent.postResult(intent.data);
}


onload = function(){
	if(launchData) {
		if(launchData.intent) {
			handleIntent(launchData.intent)
		}
	}
	delete launchData;
}



