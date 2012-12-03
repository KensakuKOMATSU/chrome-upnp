var Discovery;

(function(){
	Array.prototype.has = function(str) {
		for(var i = 0, l = this.length; i < l; i++) {
			if(this[i] === str) return true;
		}
		return false;
	}

	// check same Location is already included in the object.
	function check_overlapped(o, list){
	  for(i=0; i<list.length; i++){
	    if (o.location == list[i].location){
	      return true;
	    }
	  }
	  return false;
	}

	// generate object literal from SSDP message.
	var parse = function(data, address) {
	  var arr = data.replace(/\r\n|\r/g, "\n").split("\n"), ret = {};

	  for(var i = 0, l = arr.length; i < l; i++ ) {
	    var a = arr[i].split(":");
	    var k = a[0].toLowerCase();
	    var v = a.slice(1).join(":").replace(/^\s*/, "");

	    if(k === "location")
	    	v = v.replace("::1%1", address)

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

		parse_: function(recv, callback, cancel_flag){
			var o = parse(recv.data, recv.address)
				, origin = o.location.split("/").slice(0,3).join("/")+ "/";
			if(!!cancel_flag) {
				callback(o);
			}

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

			        if(self.serviceTypes.has(type) ){
				        var control_url = origin + $(this).find("controlURL").text()

				        control_urls[type] = control_url;
				    }
			    })

		        var ret = {
		        	"friendlyName" : friendly_name,
		        	"iconUrl" : icon_url,
		        	"serviceType" : self.serviceTypes,
		        	"controlUrls" : control_urls // [TODO] only including searviceTypes indicated in self.serviceTypes.
		        }
		        callback(ret);
			})
		},

		start: function(callback, st, flag /* cancel checking description.xml or not */){
			var upnp = new UPnP();
			var self = this;
			var sent = false;
			st = !!st === false ? this.serviceTypes[0] : st;

			// [FIXME] written below make no sense.
			setTimeout(function(){
				if(!!sent === false) {
					sent = true;
					callback({});
				}
			}, 10000)


			// after UDP socket has created below callback will be invoked.
			upnp.onready = function(){
				this.listen(function(recv){
					if(!!sent === false) {
						sent = true;
						console.log(recv);
						self.parse_(recv, callback, flag);
					}
				});
				this.search(st);
			} 
		}
	}

}())
