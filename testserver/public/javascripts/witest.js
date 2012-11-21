//  $("#pick-image,#edit-image").hide();
var proxyurl, cameraurl;

$("button#discover").bind("click", function(){
  $("#discovered").html('<strong>discovering devices...</strong>')
  var intent = new WebKitIntent({
    action: 'chrome-extension://komasshu.info/dlnawrapper',
    type: 'text/url-list',
    data: 'proxyurl',
    service: 'chrome-extension://facphhlidnbehckiafllpiffdcekefak/_generated_background_page.html'
  });

  window.navigator.webkitStartActivity(intent, function(url){
    console.log("obtaining proxy for UPnP succeeded")
    proxyurl = url

    // get camera url
    $.getJSON(proxyurl+"/webintents/devices", function(e){
      if(!!e.location) {
        cameraurl = e.location+e['location.webintents.org'].replace(/^\//, '')
        $("#discovered").html("<button class='webintents pick' data-cameraurl='"+cameraurl+"'><strong>Pick Image w/</strong>"+e.server+"</button>")
      } else {
        $("#discovered").html("No camera device found")
      }

    })
  }, function(e){
      console.log("error happened while retrieving proxy url");
      throw(e);
  })
});

$(".addendum-intent .pick").live("click", function(e){
  var url = $(this).data('cameraurl')
  var intent = new WebKitIntent({
    action: "chrome-extension://komasshu.info/pick-proxy",
    type: "image/*",
    data: {"target": url},
    //service: 'chrome-extension://cnfkcadjeldlijebdoijgfgaegneifkm/_generated_background_page.html'
  })
  navigator.webkitStartActivity(intent, onSuccess, onError);
})


// generic intent
/////////////////////////////////////
$(".generic-intent .pick").on("click", function(e){
  var intent = new WebKitIntent({
    "action": "http://webintents.org/pick",
    "type": "image/*",
    "data": null
  })
  navigator.webkitStartActivity(intent, onSuccess, onError);
});
$(".generic-intent .edit").on("click", function(e){
  var intent = new WebKitIntent({
    "action": "http://webintents.org/edit",
    "type": "image/*",
    "data": $("output > img").attr("src")
  })
  navigator.webkitStartActivity(intent, onSuccess, onError);
});
$(".generic-intent .share").on("click", function(e){
  var intent = new WebKitIntent({
    "action": "http://webintents.org/share",
    "type": "image/*",
    "data": $("output > img").attr("src")
  })
  navigator.webkitStartActivity(intent, function(){}, onError);
});


// callbacks for intents
//////////////////////////////////////////
var onSuccess = function(e) {
  console.log("success")
  $("output .empty").empty();
  $("output > img").attr("src", e);
}
var onError = function(e) {
  console.log("error" + e)
}
