var Discovery;

(function(){
	function check_overlapped(o, list){
	  for(i=0; i<list.length; i++){
	    if (o.location == list[i].location){
	      return true;
	    }
	  }
	  return false;
	}
	var parse = function(data) {
	  var arr = data.replace(/\r\n|\r/g, "\n").split("\n"), ret = {};

	  for(var i = 0, l = arr.length; i < l; i++ ) {
	    var a = arr[i].split(":");
	    var k = a[0].toLowerCase();
	    var v = a.slice(1).join(":");

	    if(!!v) {
	      ret[k] = v;
	    }
	  }
	  return ret;
	}




	Discovery = {
		lists: [],
		serviceType: "urn:schemas-upnp-org:service:AVTransport:1",

		parse_: function(recv, callback){
			var o = parse(recv.data)
				, origin = o.location.split("/").slice(0,3).join("/")+ "/";

			if(check_overlapped(o,this.lists)) return;

			this.lists.push(o);

			var self = this;
			$.get(o.location, function(data){
			    var friendly_name = $(data).find("device > friendlyName").text();
			    var icon_url = origin + $(data).find("device > iconList > icon").eq(0).find("url").text();
			    var service_type = $(data).find("service > serviceType")
			    var services = $(data).find("serviceList > service")

			    services.each(function(e){
			      var service = $(this)

			      if(service.find("serviceType").text() == self.serviceType){
			        var control_url = origin + service.find("controlURL").text()

			        var ret = {
			        	"friendlyName" : friendly_name,
			        	"iconUrl" : icon_url,
			        	"serviceType" : self.serviceType,
			        	"controlUrl" : control_url
			        }
			        callback(ret);
			      }
			    })
			})
		},

		start: function(callback){
			var upnp = new UPnP();
			var self = this;

			upnp.onready = function(){
				this.listen(function(recv){
					self.parse_(recv, callback);
				});
				this.search(self.serviceType);
			} 
		}
	}

}())
