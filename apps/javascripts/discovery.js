var Discovery;

(function(){
	Array.prototype.has = function(str) {
		for(var i = 0, l = this.length; i < l; i++) {
			if(this[i] === str) return true;
		}
		return false;
	}

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
		serviceTypes: [
			"urn:schemas-upnp-org:service:AVTransport:1",
			"urn:schemas-upnp-org:service:RenderingControl:1"
		],

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
			    var control_urls = {};


			    services.each(function(e){
			    	var type =  $(this).find("serviceType").text()

			    	console.log(self.serviceTypes);

			        if(self.serviceTypes.has(type) ){
				        var control_url = origin + $(this).find("controlURL").text()

				        control_urls[type] = control_url;
				    }
			    })

		        var ret = {
		        	"friendlyName" : friendly_name,
		        	"iconUrl" : icon_url,
		        	"serviceType" : self.serviceTypes,
		        	"controlUrls" : control_urls
		        }
		        callback(ret);
			})
		},

		start: function(callback){
			var upnp = new UPnP();
			var self = this;

			upnp.onready = function(){
				this.listen(function(recv){
					self.parse_(recv, callback);
				});
				this.search(self.serviceTypes[0]);
			} 
		}
	}

}())
