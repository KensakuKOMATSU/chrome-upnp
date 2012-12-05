console.log("start")

// Belows functions are executed when call as packaged apps.
// I guess those weren't checked for a long time, so I strongly believe
// that they don't work properly.
//
// As a background process, they aren't used.


var showVideoMeta = function(){
  var name = window.webkitIntent.data.name;
  var thumbnail_url = window.webkitIntent.data.thumbnailUrl;
  var url = window.webkitIntent.data.url;
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
  //tvController.start(window.webkitIntent.data.url, avcontrolurl, renderingurl);
  tvController.start(proxyurl+"/video.mp4", avcontrolurl, renderingurl);
  e.preventDefault();
})

$("button#root").bind("click", function(e){
  Discovery.start(function(data){
    console.log(data);
  }, "upnp:rootdevice");
})
$("button#webintents").bind("click", function(e){
  Discovery.start(function(data){
    console.log(data);
    $("output.debug").text(data)
  }, "urn:schemas-webintents-org:service:WebIntents:1");
})

function main(){
  var url = window.webkitIntent.data.url;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", window.proxyurl+"/set?url="+encodeURIComponent(url));
  xhr.onload = function(e){
    console.log("set url completed");
    showVideoMeta();
    startDiscovery();
  }
  xhr.send();
}

if (typeof(window.webkitIntent) === "undefined") {
  $("output.console").text("このアプリはWebIntents経由でないと動きません")
} else {
  main();
}
