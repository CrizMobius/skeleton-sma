function initialize() {
  	
	// Create a new map with some default settings
	var limit = 100;
	
    var myLatlng = new google.maps.LatLng(25,25);
    var myOptions = {
      zoom: 3,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
		
	// Initialize Fluster and give it a existing map
	var fluster = new Fluster2(map);
	
	for(var i = 0; i < limit; i++)
	{
		var pos = [
			50 * Math.random(),
			50 * Math.random()
		];
		
		// Create a new marker. Don't add it to the map!
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pos[0], pos[1]),
			title: 'Marker ' + i
		});
		
		// Add the marker to the Fluster
		fluster.addMarker(marker);
	}
	
	// Set styles
	// These are the same styles as default.
	fluster.styles = {
		// This style will be used for clusters with more than 0 markers
		0: {
			image: 'http://gmaps-utility-library.googlecode.com/svn/trunk/markerclusterer/1.0/images/m1.png',
			textColor: '#FFFFFF',
			width: 53,
			height: 52
		},
		// This style will be used for clusters with more than 10 markers
		10: {
			image: 'http://gmaps-utility-library.googlecode.com/svn/trunk/markerclusterer/1.0/images/m2.png',
			textColor: '#FFFFFF',
			width: 56,
			height: 55
		},
		20: {
			image: 'http://gmaps-utility-library.googlecode.com/svn/trunk/markerclusterer/1.0/images/m3.png',
			textColor: '#FFFFFF',
			width: 66,
			height: 65
		}
	};
	
	// Initialize Fluster
	// This will set event handlers on the map and calculate clusters the first time.
	fluster.initialize();
	
}

function showtweets(tweets) {
	var minlat = 1000;//80;
	var minlon = 1000;//40;
	var maxlat = -1000;//50;
	var maxlon = -1000;//0;
	//rakna ut min, max pa riktigt
	for (var tweet in tweets) {
		if (tweets[tweet].location.latitude < minlat) {
			minlat = tweets[tweet].location.latitude;
		}
		if (tweets[tweet].location.longitude < minlon) {
			minlon = tweets[tweet].location.longitude;
		}
		if (tweets[tweet].location.latitude > maxlat) {
			maxlat = tweets[tweet].location.latitude;
		}
		if (tweets[tweet].location.longitude > maxlon) {
			maxlon = tweets[tweet].location.longitude;
		}
	}
	
	var myLatlng = new google.maps.LatLng((minlat + maxlat)/2,(minlon + maxlon)/2);
    var myOptions = {
      zoom: 3,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
	var fluster = new Fluster2(map);
	for (var tweet in tweets) {
		var pos = [
			tweets[tweet].location.latitude,
			tweets[tweet].location.longitude
		];
		
		// Create a new marker. Don't add it to the map!
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(pos[0], pos[1]),
			title: tweets[tweet].text
		});
		
		// Add the marker to the Fluster
		fluster.addMarker(marker);
		
		fluster.styles = {
		// This style will be used for clusters with more than 0 markers
		0: {
			image: 'http://gmaps-utility-library.googlecode.com/svn/trunk/markerclusterer/1.0/images/m1.png',
			textColor: '#FFFFFF',
			width: 53,
			height: 52
		},
		// This style will be used for clusters with more than 10 markers
		10: {
			image: 'http://gmaps-utility-library.googlecode.com/svn/trunk/markerclusterer/1.0/images/m2.png',
			textColor: '#FFFFFF',
			width: 56,
			height: 55
		},
		20: {
			image: 'http://gmaps-utility-library.googlecode.com/svn/trunk/markerclusterer/1.0/images/m3.png',
			textColor: '#FFFFFF',
			width: 66,
			height: 65
		}
	};
	
	// Initialize Fluster
	// This will set event handlers on the map and calculate clusters the first time.
	fluster.initialize();
	}
}

function testshow() {	
	$.getJSON('http://nosy.pspace.se:7777/classify?thresholds=%7B%22english%22:0.9%7D&start_time=1332667503&end_time=1332685496&limit=1', function(data) {
		var items = [];
		var contacts = JSON.parse();
		alert('inne');
		alert(JSON.stringify(contacts));
	}); 

	var json = eval('[{"tags": {"urgent": 0.771315707632916, "aliens": 0.5649242852530021, "apocalypse": 0.5664557596363734, "earthquake": 0.8894778638330588, "english": 1.0}, "text": "Males dah", "created_at": "Sun Mar 25 14:16:40 +0000 2012", "author": "Cipunggg", "stemmed_keywords": ["male", "dah"], "source": "twitter", "last_modified": "2012-03-25T14:16:55.499000", "location": {"latitude": 59.61659112799895, "longitude": 18.229280821069082}, "keywords": ["males", "dah"], "new": false, "_id": 2616}, {"tags": {"earthquake": 0.4322820439952907, "apocalypse": 0.8451985361175953, "zombies": 0.15264410983766685, "wtf": 0.23642706753627074, "english": 1.0}, "text": "morning", "created_at": "Sun Mar 25 14:16:39 +0000 2012", "author": "karooolcardoso", "stemmed_keywords": ["morn"], "source": "twitter", "last_modified": "2012-03-25T14:16:54.659000", "location": {"latitude": 59.713494515346774, "longitude": 18.217634745270942}, "keywords": ["morning"], "new": false, "_id": 2615}]');
	showtweets(json);
}

function createXHR(){
	if (typeof XMLHttpRequest != "undefined"){
		return new XMLHttpRequest();
	} else if (typeof ActiveXObject != "undefined"){
		if (typeof arguments.callee.activeXString != "string"){
			var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp"];
			for (var i=0,len=versions.length; i < len; i++){
				try {
					new ActiveXObject(versions[i]);
					arguments.callee.activeXString = versions[i];
					break;
				} catch (ex){
					//skip
				}
			}
		}
		return new ActiveXObject(arguments.callee.activeXString);
	} else {
		throw new Error("No XHR object available.");
	}
}

function getstartdate() {
	var datefield = document.getElementById('f_date1');
	if (datefield.value != "") {
		var date = new Date(datefield.value);
		return date/1000;
	} else {
		return new Date() / 1000;
	}
}

function getenddate() {
	var datefield = document.getElementById('f_date2');
	if (datefield.value != "") {
		var date = new Date(datefield.value);
		return date/1000;
	} else {
		return new Date() / 1000;
	}
}

function loaddata() {
	var tags = document.getElementById('tags').value;
	var tagarray = tags.split(" ");
	var filters = "%7B";
	for (var i in tagarray) {
		filters = filters + "%22" + tagarray[i] + "%22:0.9";
	}
	filters = filters + "%7D";
	
	var url = "thresholds="+filters+"&start_time="+ parseInt(getstartdate()) +"&end_time="+ parseInt(getenddate())+"&limit=1000";
	
	$.getJSON('localhost/result/data?path=' + url, function(data) {
		var tweets = JSON.parse(data);
		showtweets(tweets);
	});
}