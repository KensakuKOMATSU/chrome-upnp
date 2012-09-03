
console.log("start")


var showVideoMeta = function(){
	var name = launchData.intent.data.name;
	var thumbnail_url = launchData.intent.data.thumbnailUrl;
	var url = launchData.intent.data.url;
	console.log(name, thumbnail_url)

	$("#video-meta dt").html("<img src='"+thumbnail_url+"'>")
	$("#video-meta dd").html("<h3>"+name+"</h3><p>"+url+"</p>")
}

var startDiscovery = function(){
	$("output .progress").html("TV の探索を開始しました...");
	$("output .controller").html("<dl></dl>")
	Discovery.start(function(data){
		console.log(data);
		$("output .progress").empty();
		var str = "<dt><i class='icon-facetime-video icon-large'></i></dt>"
			+ "<dd><a class='control' href='"+data.controlUrl+"'>"+data.friendlyName+"</a></dd>"
		$("output .controller dl").append(str)
	})
}


var showController = function(name){
	var str = "<h3>"+name+"</h3>"
		+ "<div class='tv-controller'>"
		+ "<button class='play btn-large'><i class='icon-play icon-large'></i></button>"
		+ "<button class='pause btn-large'><i class='icon-pause icon-large'></i></button>"
		+ "<button class='stop btn-large'><i class='icon-stop icon-large'></i></button>"
		+ "</div>"
	$("output .controller").html(str);

	$("output .controller .play").click(function(){ tvController.play(); });
	$("output .controller .stop").click(function(){ tvController.stop(); });
	$("output .controller .pause").click(function(){ tvController.pause(); });

}


$("a.control").live('click', function(e){
	var control_url = $(this).attr('href')
		, friendly_name = $(this).text();

	showController(friendly_name);
	tvController.start(launchData.intent.data.url, control_url);
	e.preventDefault();
})


function main(){
	console.log("main")
	showVideoMeta();
	startDiscovery();
}

if (typeof(launchData) === "undefined") {
	$("output").text("このアプリはWebIntents経由でないと動きません")
} else {
	main();
}
