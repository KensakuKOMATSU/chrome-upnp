// description, thumbnail_url, title, url

var data = (window.webkitIntent && window.webkitIntent.data) || null;
var proxyurl;

if(!!data) {
  $("img").attr("src",data.thumbnail_url);
  $("h2").text(data.title);
  $("p.description").text(data.description);
  $(".youtubeurl").val(data.url);
}


$("#discovery").click(function(){
  var intent = new WebKitIntent({
    action: 'chrome-extension://komasshu.info/dlnawrapper',
    type: 'text/url-list',
    data: 'proxyurl',
    service: 'chrome-extension://facphhlidnbehckiafllpiffdcekefak/_generated_background_page.html'
  });
  window.navigator.webkitStartActivity(
    intent,
    function(res){
      console.dir(res);
      proxyurl = res;
      $("#proxyurl").html("<div class='alert'>"+proxyurl+"</div>");
      $.getJSON(proxyurl+"/upnpdevices", function(e) {
        console.dir(e);
        var html = [
          "<li><pre><a class='device' href='#' data-avcontrolurl='{{avcontrol_url}}' data-renderingurl='{{rendering_url}}'>",
          "<img src='{{iconUrl}}'>&nbsp;",
          "{{friendlyName}}",
          "</a></pre></li>"
        ]
        html = html.join("");
        $("#devices p").html("<span class='label label-success'>Choose device</span><br><ul class='unstyled'>");
        e.forEach(function(dev){
          $("#devices p").append(html.replace("{{avcontrol_url}}", dev.controlUrls['urn:schemas-upnp-org:service:AVTransport:1']).replace("{{rendering_url}}", dev.controlUrls['urn:schemas-upnp-org:service:RenderingControl:1']).replace("{{iconUrl}}", dev.iconUrl).replace("{{friendlyName}}", dev.friendlyName));
        });
        $("#devices p").append("</ul>");
      });
    },
    function(err){
      alert('you need to install DLNA controller')
      console.log(err);
    }
  );
});



// choose device
$("a.device").live("click", function(){
  var avcontrol_url = $(this).data("avcontrolurl").replace(" ", "")
    , rendering_url = $(this).data("renderingurl").replace(" ", "")
    , video_url = $(".youtubeurl").val()

  if(!!video_url === false) {
    alert("URL doesn't set");
    return;
  }

  var html = $(this).html();
  $("#devices p").html("<span class='label label-success'>Selected device</span><ul class='unstyled'><li><pre>"+html+"</pre></li></ul>");
  $("#buttons button,input").attr("disabled", false);

  $.get(proxyurl+"/set", {"video_url": video_url, "avcontrol_url": avcontrol_url, "rendering_url": rendering_url}, function(e){
    console.log("set finished");
    $.get(proxyurl+"/getVolume", function(e){
      $("#buttons input[type=range]").val(e);
      $("#volume").text(e);
    }) 
  });
  ;
});

// Play, Pause, Stop
$("section#buttons button").click(function(e){
  var op = $(this).data('op'); // op means operation to TV, such as "Play", "Pause", "Stop"
  $.get(proxyurl+"/"+op, function(e){
    console.log(e);
  });
});

// set volume
$("section#buttons input[type=range]").bind("change", function(e){
  var level = $(this).val();
  $("#volume").text(level);
}).bind("mouseup", function(e){
  var level = parseInt($(this).val());
  $("#volume").text(level);
  console.log(level);
  $.get(proxyurl+"/setVolume", {"level": level}, function(e){
    console.log(e);
  });
});
