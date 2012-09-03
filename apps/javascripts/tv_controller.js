var tvController;

(function(){
	function mesg_(mesg){
		$("output .progress").text(mesg);
	}

	function set_url(url, control_url){

	 	var data = "<?xml version=\"1.0\"?>"
	        + "<SOAP-ENV:Envelope xmlns:SOAP-ENV=\"http://schemas.xmlsoap.org/soap/envelope/\" SOAP-ENV:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\">"
	        + "<SOAP-ENV:Body>"
	        + "<m:SetAVTransportURI xmlns:m=\"urn:schemas-upnp-org:service:AVTransport:1\">"
	        + "<InstanceID xmlns:dt=\"urn:schemas-microsoft-com:datatypes\" dt:dt=\"ui4\">0</InstanceID>"
	        + "<CurrentURI xmlns:dt=\"urn:schemas-microsoft-com:datatypes\" dt:dt=\"string\">"
	        + url 
	        + "</CurrentURI>"
	        + "<CurrentURIMetaData xmlns:dt=\"urn:schemas-microsoft-com:datatypes\" dt:dt=\"string\">"
	        + "</CurrentURIMetaData>"
	        + "</m:SetAVTransportURI>"
	        + "</SOAP-ENV:Body>"
	        + "</SOAP-ENV:Envelope>"


		$.ajax({
			type: "POST",
			url: control_url,
			headers: {
			  SOAPACTION: "\"urn:schemas-upnp-org:service:AVTransport:1#SetAVTransportURI\""
			},
			contentType: 'text/xml ; charset="utf-8"',
			data: data,
			success: function(msg){
				mesg_(url+"のセットが完了しました")
				console.log(msg)
			},
			error: function(e) {
				mesg_(url+"のセットに失敗しました")
				console.log(e);
			}
		})
	}
	tvController = {
		url: null,
		control_url: null,
		xmlHeader: "<?xml version=\"1.0\" encoding=\"utf-8\"?><s:Envelope s:encodingStyle=\"http://schemas.xmlsoap.org/soap/encoding/\" xmlns:s=\"http://schemas.xmlsoap.org/soap/envelope/\"><s:Body>",
		xmlFooter: "</s:Body></s:Envelope>",
		defaultSettings : {
			InstanceID: 0,
			Speed: 1,
			Unit: 0,
			Target: "",
			NewPlayMode: 0,
			CurrentURI: "",
			CurrentURIMetaData: "" ,
			Channel: "Master",
			ConnectionID: 0, //ConnectionManager
			PresetName: "FactoryDefaults",
			DesiredVolume: 0,
			ObjectID: 0,        //Content Directry
			BrowseFlag: 0,      //Content Directry - Browse
			Filter: 0,          //Content Directry
			StartingIndex: 0,   //Content Directry
			RequestedCount: 0,  //Content Directry
			SortCriteria: 0,    //Content Directry
			ContainerID: 0,     //Content Directry - Search
			SearchCriteria: 0,   //Content Directry - Search
			CurrentTagValue: 0,  //Content Directry - UpdateObject
			NewTagValue: 0,  //Content Directry - UpdateObject
			DeviceID: 0, //X_MS_MediaReceiverRegistrar
			RegistrationReqMsg: 0, //X_MS_MediaReceiverRegistrar - RegisterDevice
		},
		PLAY: 10,
		PAUSE: 20,
		STOP: 30,
		VOLUMEUP: 101,
		VOLUMEDOWN: 102,
		sendSoap_: function(data, actionName, serviceType, callback){
		  $.ajax({
		    type: "POST",
		    url: this.control_url,
		    headers: {
		      SOAPACTION: "\"urn:schemas-upnp-org:service:" + serviceType + ":1#" + actionName +"\""
		    },
		    contentType: 'text/xml ; charset="utf-8"',
		    data: data,
		    success: function(msg){
		    	if(typeof(callback) === "function"){
		    		callback(msg);
		    		console.log(msg);
		    	}
		    }, 
		    error: function(msg){
		    	if(typeof(callback) === "function"){
		    		callback(msg);
		    		console.log(msg);
		    	}
		    }
		  })
		},
		getXml_: function(args, actionName, serviceType, settings){
		  var data = this.xmlHeader, settings = settings || {};
		  data += '<u:' + actionName + ' xmlns:u="urn:schemas-upnp-org:service:'+ serviceType + ':1">'

		  for(var k=0; k<args.length; k++){
		    if(args[k].direction == "in"){
		      if(settings.hasOwnProperty(args[k].name)){
		        data += '<' + args[k].name + '>' + settings[args[k].name] + '</' + args[k].name + '>'
		      } else {
		        data += '<' + args[k].name + '>' + this.defaultSettings[args[k].name] + '</' + args[k].name + '>'
		      }
		    }
		  }

		  data +='</u:'+ actionName +'>'
		  data += this.xmlFooter

		  return(data)

		},
		control_ : function(action, callback) {
			var args = [
				{"name": "InstanceID", "direction": "in"}, 
				{"name": "Speed", "direction": "in"} 
			],
			serviceType = "AVTransport";

			var xml = this.getXml_(args, action, serviceType);
			this.sendSoap_(xml, action, serviceType, callback);
		},
		play: function(callback){
			this.control_("Play", callback);
		},
		stop: function(callback){
			this.control_("Stop", callback);
		},
		pause: function(callback){
			this.control_("Pause", callback);
		}, 
		start: function(url, control_url) {
			this.url = url;
			this.control_url = control_url;
			this.stop(function(mesg){
				set_url(url, control_url)
			})
		}
	}

}())