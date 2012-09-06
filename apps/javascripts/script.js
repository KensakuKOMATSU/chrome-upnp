
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
		var avcontrolurl = data.controlUrls['urn:schemas-upnp-org:service:AVTransport:1'];
		var renderingurl = data.controlUrls['urn:schemas-upnp-org:service:RenderingControl:1'];
		$("output .progress").empty();
		var str = "<dt><i class='icon-facetime-video icon-large'></i></dt>"
			+ "<dd><a class='control' data-avcontrolurl='"+avcontrolurl+"' data-renderingurl='"+renderingurl+"' href='#'>"+data.friendlyName+"</a></dd>"
		$("output .controller dl").append(str)
	})
}


var showController = function(name){
	var str = "<h3>"+name+"</h3>"
		+ "<div class='tv-controller'>"
		+ "<button class='play btn-large'><i class='icon-play icon-large'></i></button>"
		+ "<button class='pause btn-large'><i class='icon-pause icon-large'></i></button>"
		+ "<button class='stop btn-large'><i class='icon-stop icon-large'></i></button><br>"
		+ "<input type='range' min='0' max='100'>"
		+ "<span></span>"
		+ "</div>"
	$("output .controller").html(str);

	tvController.getVolume(function(doc){
		var volume = $(doc).find("CurrentVolume").text();
		$("output .controller input[type=range]").val(volume);
	});

	$("output .controller input[type=range]").bind("change", function(e){
		var dVolume = parseInt($(this).val());
		$("output .controller span").text(dVolume);
	}).bind("mouseup", function(e){
		var dVolume = parseInt($(this).val());
		tvController.setVolume(dVolume);
	})

	$("output .controller .play").click(function(){ tvController.play(); });
	$("output .controller .stop").click(function(){ tvController.stop(); });
	$("output .controller .pause").click(function(){ tvController.pause(); });

}


$("a.control").live('click', function(e){
	var avcontrolurl = $(this).data('avcontrolurl')
		, renderingurl = $(this).data('renderingurl')
		, friendly_name = $(this).text();

	showController(friendly_name);
	tvController.start(launchData.intent.data.url, avcontrolurl, renderingurl);
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
