/** 
 * @author Shinichi
 * this is script file for static graph.
 * based on 5.4.3.5 in ADD.
 */

var staticGraph = {

  // -function isOutOfDefault-
  // Checks if new time scope is out of default or not.
  isOutOfDefault : function (inputStartTime, inputEndTime, defaultStartTime, defaultEndTime) {
    // return false if either startTime or endTime is out of scope.
    if(inputStartTime < defaultStartTime || defaultEndTime < inputEndTime)
      return false;
    else
      return true;
  },
  
  // -function getData-
  // Gets data from database based on current selected tags and stores them to "taggedDatasets"
  getData : function (selectedTags, startTime, endTime) {
    var taggedDatasets = [];    // main array
    var newDate;
    var milliDate;              // Date has to be converted in format of milliseconds
    
    // class for taggedDatasets
    function taggedObject(tagName) {
      this.tagName = tagName;
      this.timeArray = new Array;
    }

    // we might have to get datasets for multiple tags
    for (var i = 0; i < selectedTags.length; i++) {     // can we get the number of tags with this???
      taggedDatasets[i] = new taggedObject(selectedTags[i]);


// test
      var parameters = "thresholds="+0.9+"&start_time="+ startTime +"&end_time="+ endTime+"&limit=1000";  
      var url = '../results/data?';
      url = url.concat(parameters);
      //alert(url);
      $.getJSON(url, function(data) {
   //     var tweets = JSON.parse(data);
   //     showtweets(tweets);
   //   });

      // send a HTTP GET request to the classifier server to get the data
    //  $.getJSON("../results/data?",
                  // address which includes data
     //   {thresholds: selectedTags[i], start_time: startTime / 1000, end_time: endTime / 1000},
     //   function (data) {

          for (var j = 0; j < data.length; j++) {            
            // convert date
            //var myDate = new Date("2012-02-10T13:19:11+0000");
            newDate = new Date(data.date_created);
            milliDate = newDate.getTime();
            
            //var offset = myDate.getTimezoneOffset() * 1000;
            //var withOffset = myDate.getTime();
            //var withoutOffset = withOffset - offset;
         
            taggedDatasets[i].timeArray.push(milliDate);
          }
        },
        "json");

    }

    return taggedDatasets;
  },
  
  
  // -function setPlotArray-
  // Separates current time scope to "seprateNumber" time scope, and in each time scope, the number
  // and the percentage of tweets in "taggedDatasets are calculated and stored to "plotArray"
  setPlotArray : function (datasets, totalTweet, separateNumber, startTime, endTime) {
    var currentNumber;  
    var plotArray = [];          // main array
    
    // separate time array
    var separatedTime = [];
    
    var interval = Math.round( (endTime - startTime) / separateNumber);
    
    // the number of elements of this array should be same as separateNumber + 1
    for (var i = 0; i < separateNumber; i++) {
      separatedTime.push (startTime + i * interval );
    }
    separatedTime.push(endTime);      // in order to avoid ignoring endTime because of rounding
    var dammyStart = startTime - interval;    // for the result of the first element
    
    // class for inside array
    function plotObject (tagName) {
      this.tagName = tagName;
      this.number = new Array;
      //this.percent = new Array;
    }
    
    //for (var a = 0; a < separatedTime.length; a++) alert(separatedTime[a]);
    
    for (var i = 0, i_len = datasets.length; i < i_len; i++) {      // for number of tags
      plotArray[i] = new plotObject(datasets[i].tagName);           // name of tag
        
      // j : for timeArray
      // k : for separatedTime
      var j_len = datasets[i].timeArray.length;
      
      // first check time before dammyStart
      for (var j = 0; j < j_len; j++) {
        if (dammyStart <= datasets[i].timeArray[j]) break;
      }
      
      for (var k = 0; j < j_len, k < separateNumber + 1; k++) {
        
        // initialization
        currentNumber = 0;
          
        if (datasets[i].timeArray[j] < separatedTime[k]) {
          currentNumber++;
          j++;
          //alert(currentNumber)
          if (j < j_len) {
            while (datasets[i].timeArray[j] < separatedTime[k]) {
              currentNumber++;
              j++;
              if (j_len <= j) break;
            }
          }
          plotArray[i].number.push([separatedTime[k], currentNumber]);        // number
          //plotArray[i].percent.push([separatedTime[k], currentNumber / 10000]);    // percent
        }
        else {
          plotArray[i].number.push([separatedTime[k], 0]);
        }

      }
      // if all separatedTime hasn't been considered
      while (k < separateNumber + 1) {
        plotArray[i].number.push([separatedTime[k], 0]);
        //plotArray[i].percent.push([separatedTime[k], 0]);
        k++;
      }
    }
//    for (var a = 0; a < plotArray[0].number.length; a++) alert(plotArray[0].number[a]);
    return plotArray;
  },
  
  
  // -function drawStaticGraph-
  // Draws data in "plotArray" onto the graph.
  drawStaticGraph : function (array) {
  //drawStaticGraph : function(array, isShowNum, isShowPercent) {
    $(function () {
      
      // first correct the timestamps - they are recorded as the daily
      // midnights in UTC+0100, but Flot always displays dates in UTC
      // so we have to add one hour to hit the midnights in the plot
      //for(var i = 0; i < d.length; ++i)
      //d[i][0] += 60 * 60 * 1000;
      // helper for returning the weekends in a period
      function weekendAreas (axes) {
        var markings = [];
        var d = new Date (axes.xaxis.min);
        // go to the first Saturday
        d.setUTCDate (d.getUTCDate() - ((d.getUTCDay() + 1) % 7));
        d.setUTCSeconds (0);
        d.setUTCMinutes (0);
        d.setUTCHours (0);
        var i = d.getTime ();
        do {
          // when we don't set yaxis, the rectangle automatically
          // extends to infinity upwards and downwards
          markings.push ({
            xaxis : {
              from : i,
              to : i + 2 * 24 * 60 * 60 * 1000
            }
          });
          i += 7 * 24 * 60 * 60 * 1000;
        } while (i < axes.xaxis.max);
         return markings;
      }
      // for first plot
      var options = {
        xaxis : {
          mode : "time",
          tickLength : 5
        },
        selection : {
          mode : "x"
        },
        yaxes : [ { min : 0 },
         {
          position: "right"
         }],
        grid : {
          markings : weekendAreas
        }
      };
      
      // convert for plot format
      var data = [];
      for (var m = 0; m < array.length; m++) {
      //  if (isShowNum) 
          data.push ({ data: array[m].number, label: array[m].tagName + ": Number"});
      //  if (isShowPercent)
      //    data.push({ data: array[m].percent, label: array[m].tagName + ": Percent", yaxis: 2} );
      }
      
      // plot
      var plot = $.plot ($("#placeholder"), data, options);
      
      // zooming
      $("#placeholder").bind("plotselected", function (event, ranges) {
        plot = $.plot ($("#placeholder"), data, $.extend (true, {}, options, {
          xaxis : {
            min : ranges.xaxis.from,
            max : ranges.xaxis.to
          }
        }));  
      });
    });  
  },
  
  // -function staticGraph-
  // main function for displaying static graph.

  displayStaticGraph : function() {

    // These parameters can be changed.------------------------------
    var defaultStartTime = 1326463600000;       // default start time
    var defaultEndTime =   1326863600000;         // default end time
    var separateNumber = 100;                    // interval of time
    //var isShowNum = true;
    //isShowPercent = true;
    //--------------------------------------------------------------
    
    var startTime = defaultStartTime;
    var endTime = defaultEndTime;
    var selectedTags;
    var plotArray, taggedDatasets;
    var totalTweetsArray = 100;         // now dammy
    
    // for test   
    taggedDatasets = [
      {"tagName": "Tsunami",
        "timeArray": [1326463600000, 1326463600000, 1326463600000, 1326763600000, 1326863600000,
          1326863610000, 1326863620000, 1326863630000, 1326863640000, 1326863650000,
          1326863660000, 1326863660001, 1326863660002, 1326863660003, 1326863660004,
          1326863660010, 1326863660020, 1326863660030, 1326863660040, 1326863660050,
          1326863660100, 1326863660200, 1326863660300, 1326863660400, 1326863660500,
          1326863661000, 1326863662000, 1326963660000, 1327063600000, 1327163600000]},
      {"tagName": "Fire",
        "timeArray": [1326463600000, 1326463600000, 1326463600000, 1326763600000, 1326863600000,
          1327063610000, 1327063620000, 1327063630000, 1327063640000, 1327063650000,
          1327063660000, 1327063660001, 1327063660002, 1327063660003, 1327063660004,
          1327063660010, 1327063660020, 1327063660030, 1327063660040, 1327063660050,
          1327063660100, 1327063660200, 1327063660300, 1327063660400, 1327063660500,
          1327063661000, 1327063662000, 1327163660000, 1327263600000, 1327363600000]}
    ];


    // maybe we will show the default data first?
    // taggedDatasets = this.getData(selectedTags, startTime, endTime);
    plotArray = this.setPlotArray(taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
    this.drawStaticGraph(plotArray);

    // when new tags are selected
    // Also, when this function is called first, first tags should be specified.
    $("#tagSelected-box").change(function() {           // if the tags are changed and entered
      selectedTags = ($("#tagSelected-box").val());
      if (selectedTags.match(/\S/g)) {     // space check with regular expression
        selectedTags = selectedTags.split(",");       // split with comma and store to array
        
        //taggedDatasets = staticGraph.getData(selectedTags, startTime, endTime);        // get new data
        plotArray = staticGraph.setPlotArray(taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
        staticGraph.drawStaticGraph(plotArray);
        //this.drawStaticGraph(plotArray, isShowNum, isShowPercent);
      }
    });

     // calendar setup
    var startCal = Calendar.setup({
      cont       : "start-calendar-container",
      inputField : "start-calendar-input",
      //trigger    : "start-calendar-trigger",
      showTime : true,
      //selection  : [20090527],      // initialize
      //min : // minimum date
      //max : // maximum date
      dateFormat : "%s",  // format of date
      //timePos :     // position of time
      //time :   // initial time        
      // event when date is changed
      onSelect   : function() {
                
        // get new startTime
        var tmp = this.selection.get();
        tmp = Calendar.intToDate(tmp);
        tmp = Calendar.printDate(tmp, "%s");
        startTime = tmp * 1000;
        
        // for displaying
        
        var date = this.selection.get();
        date = Calendar.intToDate(date);
        date = Calendar.printDate(date, "%A, %B %d, %Y");
        var ta = document.getElementById("start-calendar-input");
        ta.value = date; 
        
                 
        var tempEnd = ($("#end-calendar-input").val());   // get the value of input of end calendar
        if (tempEnd.match(/\S/g)) {                 // space check with regular expression
        
          if (!(startTime < endTime)) {
            alert ("Enter startTime < endTime");
          }
          else {
            // if new time scope is outside of default time scope
            if (staticGraph.isOutOfDefault (startTime, endTime, defaultStartTime, defaultEndTime) ) {
              //taggedDatasets = staticGraph.getData(selectedTags, startTime, endTime);
              defaultStartTime = startTime;
              defaultEndTime = endTime;
            }
            
            plotArray = staticGraph.setPlotArray (taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
            staticGraph.drawStaticGraph (plotArray);
            //this.drawStaticGraph(plotArray, isShowNum, isShowPercent);
          }
        }
      },
       // event when time is changed
      onTimeChange : function () {
        var hours = this.getHours();
        var minutes = this.getMinutes();
        
        // for displaying
        /*
        var time = hours + " : " + minutes;
        var tibx = document.getElementById("start-calendar-time");
        tibx.value = time;
        */
      }
    });
    
    var endCal = Calendar.setup({
      cont       : "end-calendar-container",
      inputField : "end-calendar-input",
      //trigger    : "end-calendar-trigger",
      //titleFormat : "End Time",
      showTime : true,
      //selection  : [20090527],      // initialize
      //min : // minimum date
      //max : // maximum date
      dateFormat : "%s",  // format of date
      //timePos :     // position of time
      //time :   // initial time        
      // event when date is changed
      onSelect   : function() {
                
        // get new startTime
        var tmp = this.selection.get();
        tmp = Calendar.intToDate(tmp);
        tmp = Calendar.printDate(tmp, "%s");
        endTime = tmp * 1000;
        
        // for displaying
        
        var date = this.selection.get();
        date = Calendar.intToDate(date);
        date = Calendar.printDate(date, "%A, %B %d, %Y");
        var ta = document.getElementById("end-calendar-input");
        ta.value = date; 
         
                 
        var tempStart = ($("#start-calendar-input").val());   // get the value of input of start calendar
        if (tempStart.match(/\S/g)) {                 // space check with regular expression
          if ( !(startTime < endTime) ) {
            alert ("Enter startTime < endTime");
          }
          else {
            // if new time scope is outside of default time scope
            if(staticGraph.isOutOfDefault(startTime, endTime, defaultStartTime, defaultEndTime)) {
              //taggedDatasets = staticGraph.getData(selectedTags, startTime, endTime);
              defaultStartTime = startTime;
              defaultEndTime = endTime;
            }
            
            plotArray = staticGraph.setPlotArray(taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
            staticGraph.drawStaticGraph(plotArray);
            //this.drawStaticGraph(plotArray, isShowNum, isShowPercent);
          }
        }
      },
       // event when time is changed
      onTimeChange : function () {
        
        var hours = this.getHours();
        var minutes = this.getMinutes();
        
        // for displaying
        /*
        var time = hours + " : " + minutes;
        var tibx = document.getElementById("end-calendar-time");
        tibx.value = time;
        */
      }
    });
  }
};

// implement
staticGraph.displayStaticGraph();
