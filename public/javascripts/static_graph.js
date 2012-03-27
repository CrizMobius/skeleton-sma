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
      
      taggedDatasets[i] = new taggedObjects(selectedTags[i]);
      
      // send a HTTP GET request to the classifier server to get the data
      $.get(".html",            // address which includes data
        {thresholds: selectedTags[i], start_time: startTime / 1000, end_time: endTime / 1000},
        function (data) {

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
    
    // separate time stamp
    var separatedTime = [];
    
    // for test
    //var separatedTime = [1196463600000, 1196563600000, 1196663600000, 1196763600000, 1196863600000,
    //  1196963600000, 1197063600000, 1197163600000, 1197263600000, 1197363600000];
    
    // the number of elements of this array should be same as separateNumber + 1
    for (var i = 0; i < separateNumber; i++) {
      separatedTime.push (startTime + i * Math.round( (endTime - startTime) / separateNumber) );
    }
    separatedTime.push(endTime);      // in order to avoid ignoring endTime because of rounding
    
    
    // class for inside array
    function plotObject (tagName) {
      this.tagName = tagName;
      this.number = new Array;
      //this.percent = new Array;
    }
    
    for (var i = 0, i_len = datasets.length; i < i_len; i++) {      // for number of tags
      plotArray[i] = new plotObject(datasets[i].tagName);           // name of tag
        
      // j : for timeArray
      // k : for separatedTime
      for (var j = 0, k = 0, j_len = datasets[i].timeArray.length; j < j_len; j++, k++) {
        
        // initialization
        currentNumber = 0;
          
        while (datasets[i].timeArray[j] < separatedTime[k]) {
          currentNumber++;
          j++;
          if (j_len <= j) break;
        }     

        plotArray[i].number.push([separatedTime[k], currentNumber]);        // number
        //plotArray[i].percent.push([separatedTime[k], currentNumber / 10000]);    // percent
      }
      // if all separatedTime hasn't been considered
      while (k < separateNumber + 1) {
        plotArray[i].number.push([separatedTime[k], 0]);
        //plotArray[i].percent.push([separatedTime[k], 0]);
        k++;
      }
    }
    
    return plotArray;
  },
  
  
  // -function drawStaticGraph-
  // Draws data in "plotArray" onto the graph.
  drawStaticGraph : function(array) {
  //drawStaticGraph : function(array, isShowNum, isShowPercent) {
      $(function() {
        
        // first correct the timestamps - they are recorded as the daily
        // midnights in UTC+0100, but Flot always displays dates in UTC
        // so we have to add one hour to hit the midnights in the plot
        //for(var i = 0; i < d.length; ++i)
        //d[i][0] += 60 * 60 * 1000;

        // helper for returning the weekends in a period
        function weekendAreas(axes) {
          var markings = [];
          var d = new Date(axes.xaxis.min);
          // go to the first Saturday
          d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7));
          d.setUTCSeconds(0);
          d.setUTCMinutes(0);
          d.setUTCHours(0);
          var i = d.getTime();
          do {
            // when we don't set yaxis, the rectangle automatically
            // extends to infinity upwards and downwards
            markings.push({
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
          yaxes : [ {min : 0 },
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
            data.push({ data: array[m].number, label: array[m].tagName + ": Number"});
        //  if (isShowPercent)
        //    data.push({ data: array[m].percent, label: array[m].tagName + ": Percent", yaxis: 2} );
        }
        
        // plot
        var plot = $.plot($("#placeholder"), data, options);
        
        // zooming
        $("#placeholder").bind("plotselected", function(event, ranges) {
          plot = $.plot($("#placeholder"), data, $.extend(true, {}, options, {
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
    var defaultStartTime = 1196463600000;       // default start time
    var defaultEndTime = 1196863600000;         // default end time
    var separateNumber = 10;                    // interval of time
    //var isShowNum = true;
    //isShowPercent = true;
    //--------------------------------------------------------------
    
    var startTime = defaultStartTime;
    var endTime = defaultEndTime;

    var plotArray, taggedDatasets;
    var totalTweetsArray = 100;
    
    // for test
    taggedDatasets = [
      {"tagName": "Tsunami",
        "timeArray": [1196463600000, 1196463600000, 1196463600000, 1196763600000, 1196863600000,
          1196863610000, 1196863620000, 1196863630000, 1196863640000, 1196863650000,
          1196863660000, 1196863660001, 1196863660002, 1196863660003, 1196863660004,
          1196863660010, 1196863660020, 1196863660030, 1196863660040, 1196863660050,
          1196863660100, 1196863660200, 1196863660300, 1196863660400, 1196863660500,
          1196863661000, 1196863662000, 1196963660000, 1197063600000, 1197163600000]},
      {"tagName": "Fire",
        "timeArray": [1196463600000, 1196463600000, 1196463600000, 1196763600000, 1196863600000,
          1197063610000, 1197063620000, 1197063630000, 1197063640000, 1197063650000,
          1197063660000, 1197063660001, 1197063660002, 1197063660003, 1197063660004,
          1197063660010, 1197063660020, 1197063660030, 1197063660040, 1197063660050,
          1197063660100, 1197063660200, 1197063660300, 1197063660400, 1197063660500,
          1197063661000, 1197063662000, 1197163660000, 1197263600000, 1197363600000]}
    ];


    // maybe we will show the default data first?
    // taggedDatasets = this.getData(selectedTags, startTime, endTime);
    plotArray = this.setPlotArray(taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
    this.drawStaticGraph(plotArray);

    // when new tags are selected
    // Also, when this function is called first, first tags should be specified.
    $("#tagSelected-box").change(function() {           // if the tags are changed and entered
      var tempTags = ($("#tagSelected-box").val());
      if (tempTags.match(/\S/g)) {     // space check with regular expression
        selectedTags = tempTags;
        //taggedDatasets = this.getData(selectedTags, startTime, endTime);        // get new data
        plotArray = this.setPlotArray(taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
        this.drawStaticGraph(plotArray);
        //this.drawStaticGraph(plotArray, isShowNum, isShowPercent);
      }
    });

     // calendar setup
    var startCal = Calendar.setup({
      cont       : "start-calendar-container",
      inputField : "start-calendar",
      //trigger    : "start-calendar-trigger",
      //titleFormat : "Start Time",
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
        var ta = document.getElementById("start-calendar");
        ta.value = date; 
                 
        var tempEnd = ($("#end-calendar").val());   // get the value of input of end calendar
        if (tempEnd.match(/\S/g)) {                 // space check with regular expression
          
          // if new time scope is outside of default time scope
          if(staticGraph.isOutOfDefault(startTime, endTime, defaultStartTime, defaultEndTime)) {
            //taggedDatasets = this.getData(selectedTags, startTime, endTime);
            defaultStartTime = startTime;
            defaultEndTime = endTime;
          }
          
          plotArray = staticGraph.setPlotArray(taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
          staticGraph.drawStaticGraph(plotArray);
          //this.drawStaticGraph(plotArray, isShowNum, isShowPercent);
        }
      },
       // event when time is changed
      onTimeChange : function () {
        var hours = this.getHours();
        var minutes = this.getMinutes();
        var time = hours + " : " + minutes;
        var tibx = document.getElementById("start-calendar-time");
        tibx.value = time;
      }
    });
    
    var endCal = Calendar.setup({
      cont       : "end-calendar-container",
      inputField : "end-calendar",
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
        var ta = document.getElementById("end-calendar");
        ta.value = date; 
                 
        var tempStart = ($("#start-calendar").val());   // get the value of input of start calendar
        if (tempStart.match(/\S/g)) {                 // space check with regular expression
          
          // if new time scope is outside of default time scope
          if(staticGraph.isOutOfDefault(startTime, endTime, defaultStartTime, defaultEndTime)) {
            //taggedDatasets = this.getData(selectedTags, startTime, endTime);
            defaultStartTime = startTime;
            defaultEndTime = endTime;
          }
          
          plotArray = staticGraph.setPlotArray(taggedDatasets, totalTweetsArray, separateNumber, startTime, endTime);
          staticGraph.drawStaticGraph(plotArray);
          //this.drawStaticGraph(plotArray, isShowNum, isShowPercent);
        }
      },
       // event when time is changed
      onTimeChange : function () {
        var hours = this.getHours();
        var minutes = this.getMinutes();
        var time = hours + " : " + minutes;
        var tibx = document.getElementById("end-calendar-time");
        tibx.value = time;
      }
    });

  }
};

// implement
staticGraph.displayStaticGraph();