
//show tweets on map
function showtweets(tweets) {
	var minlat = 1000;//80;
	var minlon = 1000;//40;
	var maxlat = -1000;//50;
	var maxlon = -1000;//0;
	//calculate min, max for real
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
	
	//setup map
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

showtweets(eval('[]'));

//test method to show tweets on map
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


//get start/end - date as seconds since 1970-01-01
function getstartdate() {
	var datefield = document.getElementById('startdate');
	if (datefield.value != "") {
		//var date = new Date(datefield.value.substring(0, 10));
		//date.setHours(datefield.value.substring(11, 13));
		//date.setMinutes(datefield.value.substring(14, 16));
		//var ampm = datefield.value.substring(17);
		//if (ampm == "PM") {
		//	date.setHours(date.getHours() + 12);
		//}
		var date = new Date(datefield.value);
		return date/1000;
	} else {
		return new Date() / 1000;
	}
}

function getenddate() {
	var datefield = document.getElementById('enddate');
	if (datefield.value != "") {
		//var date = new Date(datefield.value.substring(0, 10));
		//date.setHours(datefield.value.substring(11, 13));
		//date.setMinutes(datefield.value.substring(14, 16));
		//var ampm = datefield.value.substring(17);
		//if (ampm == "PM") {
		//	date.setHours(date.getHours() + 12);
		//}
		var date = new Date(datefield.value);
		return date/1000;
	} else {
		return new Date() / 1000;
	}
}

//load tweets from server
function loaddata() {
	var tags = document.getElementById('tags').value;
	// old stuff
	//var tagarray = tags.split(" ");
	//var filters = "%7B";
	//for (var i in tagarray) {
	//	filters = filters + "%22" + tagarray[i] + "%22:0.9";
	//}
	//filters = filters + "%7D";
	var filters = getFilters(tags);
	var parameters = "thresholds="+filters+"&start_time="+ parseInt(getstartdate()) +"&end_time="+ parseInt(getenddate())+"&limit=1000";

	var url = "../results/data?";
	url = url.concat(parameters);

	$.ajax({
		type: "GET",
		url: url,
		datatype: "json",
		success: function(data){
			alert("success");
			showtweets(data);
		},
		error: function(){ alert("Error when loading data");}
	});
	//$.getJSON(url, function(data) {
	//	var tweets = data;
	//	alert(tweets);
	//	showtweets(tweets);
	//});
}

function getFilters(input) {
	var ar = input.match(/[A-z]+(\:\s?(1|(0(\.[0-9]+)?)))?/g);
	var filter = "%7B";
	for (var i in ar) {
		var tmp = ar[i].split(":", 2);
		if (tmp.length == 2) {
			filter = filter.concat("%22");
			filter = filter.concat($.trim(tmp[0]));
			filter = filter.concat("%22:");
			var num = new Number($.trim(tmp[1]))
			if (num != "NaN") {
				filter = filter.concat(num.toString());
			} else {
				filter = filter.concat("0");
			}
		} else {
			filter = filter.concat("%22");
			filter = filter.concat(tmp[0]);
			filter = filter.concat("%22:0");
		}
	}
	filter = filter.concat("%7D");
	return filter;
}

//update date
function updateStart(cal) {
	var date = cal.selection.get();
	if (date) {
		date = Calendar.intToDate(date);
		document.getElementById("startdate").value = Calendar.printDate(date, "%A, %B %d, %Y");
	}
};

function updateEnd(cal) {
	var date = cal.selection.get();
	if (date) {
		date = Calendar.intToDate(date);
		document.getElementById("enddate").value = Calendar.printDate(date, "%A, %B %d, %Y");
	}
};

//create calenders
var cal1 = Calendar.setup({
	inputField : "startdate",
	cont: "startcontainer",
	showTime   : false,
	onSelect     : updateStart
});

var cal2 = Calendar.setup({
	inputField : "enddate",
	cont: "endcontainer",
	showTime   : false,
	onSelect     : updateEnd
});

//refresh by hitting enter key in textbox for tags
$("#tags").keyup(function(event){
    if(event.keyCode == 13){
        loaddata();
    }
});

//default date
var today = new Date();
cal1.selection.set(today);
cal2.selection.set(today);
var date = Calendar.intToDate(cal1.selection.get());
date.setDate(date.getDate() - 7);
cal1.selection.set(date);
