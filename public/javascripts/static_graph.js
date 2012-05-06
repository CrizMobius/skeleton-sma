/**
 * @author Shinichi
 * this is script file for static graph.
 * based on 5.4.3.4 in ADD.
 */

// -function isOutOfDefault-
// Checks if new time scope is out of default or not.
var isOutOfDefault = function (inputStartTime, inputEndTime, defaultStartTime, defaultEndTime) 
{
  // return false if either startTime or endTime is out of scope.
  if (inputStartTime < defaultStartTime || defaultEndTime < inputEndTime)
    return true;
  else
    return false;
};

// -function setPlotArray-
// Separates current time scope to "seprateNumber" time scope, and in each time scope, the number
// and the percentage of tweets in "taggedDatasets are calculated and stored to "plotArray"
var setPlotArray = function (separateNumber, startTime, endTime) 
{
  var currentNumber;
  var plotArray = [];
  plotArray.length = 0;
  var separatedTime = [];
  separatedTime.length = 0;
  var interval = Math.round ((endTime - startTime) / separateNumber);

  // the number of elements of this array should be same as separateNumber + 1
  for (var i = 0; i < separateNumber; i++) 
  { 
    separatedTime.push(startTime + i * interval);
  }
  separatedTime.push (endTime);
  // in order to avoid ignoring endTime because of rounding
  var dammyStart = startTime - interval;
  // for the result of the first element

  // class for inside array
  function plotObject (tagName) 
  {
    this.tagName = tagName;
    this.number = new Array;
  }
/*
alert ("start: " + startTime + " end: " + endTime + " dammy: " + dammyStart + " data: " + taggedDatasets[0].timeArray[0]
+ " interval: " + interval);
*/
  for (var i = 0, i_len = taggedDatasets.length; i < i_len; i++)// for number of tags
  {
    plotArray[i] = new plotObject (taggedDatasets[i].tagName);
    // name of tag

    // j : for timeArray
    // k : for separatedTime
    var j_len = taggedDatasets[i].timeArray.length;

    // first check time before dammyStart
    for (var j = 0; j < j_len; j++) 
    {
      if (dammyStart <= taggedDatasets[i].timeArray[j])
        break;
    }

    for (var k = 0; j < j_len, k < separateNumber + 1; k++) 
    {
      // initialization
      currentNumber = 0;
      if (taggedDatasets[i].timeArray[j] < separatedTime[k]) 
      {
        currentNumber++;
        j++;
        if (j < j_len) 
        {
          while (taggedDatasets[i].timeArray[j] < separatedTime[k]) 
          {
            currentNumber++;
            j++;
            if (j_len <= j)
              break;
          }
        }
        plotArray[i].number.push ([separatedTime[k], currentNumber]);
      } else {
        plotArray[i].number.push ([separatedTime[k], 0]);
      }
    }
    // if all separatedTime hasn't been considered
    while (k < separateNumber + 1) 
    {
      plotArray[i].number.push ([separatedTime[k], 0]);
      k++;
    }
  }
  return plotArray;
};

// -function drawStaticGraph-
// Draws data in "plotArray" onto the graph.
var drawStaticGraph = function (array) 
{
  //alert (array.length);
  $(function () 
  {
    // first correct the timestamps - they are recorded as the daily
    // midnights in UTC+0100, but Flot always displays dates in UTC
    // so we have to add one hour to hit the midnights in the plot
    //for(var i = 0; i < d.length; ++i)
    //d[i][0] += 60 * 60 * 1000;
    // helper for returning the weekends in a period
    function weekendAreas (axes) 
    {
      var markings = [];
      //marking.length = 0;
      var d = new Date (axes.xaxis.min);
      // go to the first Saturday
      d.setUTCDate (d.getUTCDate () - ((d.getUTCDay () + 1) % 7));
      d.setUTCSeconds (0);
      d.setUTCMinutes (0);
      d.setUTCHours (0);
      var i = d.getTime ();
      do 
      {
        // when we don't set yaxis, the rectangle automatically
        // extends to infinity upwards and downwards
        markings.push(
        {
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
      yaxes : [{
        min : 0
      }, {
        position : "right"
      }],
      grid : {
        markings : weekendAreas
      }
    };
    // convert for plot format
    var data = [];
    data.length = 0;
    for (var m = 0; m < array.length; m++) 
    {
      data.push (
      {
        data : array[m].number,
        label : array[m].tagName
      });
    }

    // plot
    var plot = $.plot ($("#placeholder"), data, options);

    // zooming
    $("#placeholder").bind ("plotselected", function (event, ranges) 
    {      
      // rearrange so that detailed will be shown
      array.length = 0;
      var newArray = [];
      newArray.length = 0;
      newArray = setPlotArray (100, Math.round (ranges.xaxis.from), Math.round (ranges.xaxis.to))
      data.length = 0;
      for (var m = 0; m < newArray.length; m++)
      {
        data.push (
        {
          data : newArray[m].number,
          label : newArray[m].tagName
        });
      } 
      // replot      
      plot = $.plot ($("#placeholder"), data, $.extend (true, {}, options, 
      {
        xaxis : {
          min : ranges.xaxis.from,
          max : ranges.xaxis.to
        }
      }));
    });
  });
};


// class for taggedDatasets
function taggedObject (tagName) 
{
  this.tagName = tagName;
  this.timeArray = new Array;
} 

// parameters for function 'storeDataToArray'
var countOfStoredTags = 0;   // Number of tags already stored into array
var taggedDatasets = [];        // main array
var selectedTags = [];
//selectedTags.length = 0;

var storeDataToArray = function (data)
{
  taggedDatasets.push (new taggedObject (selectedTags[countOfStoredTags]));
  for (var j = 0; j < data.length; j++) 
  { 
    // convert date
    var milliDate = Date.parse (data[j].created_at);
    //var offset = myDate.getTimezoneOffset() * 1000;
    //var withOffset = myDate.getTime();
    //var withoutOffset = withOffset - offset;
    taggedDatasets[countOfStoredTags].timeArray.push (milliDate);
  }
  taggedDatasets[countOfStoredTags].timeArray.sort (function (a, b) {return a-b;});   // now we need sort!
  countOfStoredTags++;  
}



// main function for getting data
// has to calculate recursively
var recursiveGet = function (startTime, endTime, separateNumber, plotArray, recursiveCount)
{
  var filters = "%7B" + "%22" + selectedTags[recursiveCount] + "%22:0.9" + "%7D";
  var parameters = "thresholds=" + filters + "&start_time=" + parseInt (startTime / 1000) 
      + "&end_time=" + parseInt (endTime / 1000) + "&limit=10000";
  var url = "../results/data?";
  url = url.concat (parameters);

  // send a HTTP GET request to the classifier server to get the data
  $.ajax (
  {
    type : "GET",
    url : url,
    dataType : "json",
    success : function (data) 
    {
      storeDataToArray (data);
    },
    error : function (dammy, text) 
    {
      alert(text);
    }
  });
  
  // if ajax connection competed, go to next step
  $(document).ajaxComplete (function () 
  { 
    // data of all tags should be stored
    if (countOfStoredTags < selectedTags.length) {
      recursiveGet (startTime, endTime, separateNumber, plotArray, countOfStoredTags);      
    } 
    else if (countOfStoredTags === selectedTags.length) 
    {
      plotArray = setPlotArray (separateNumber, startTime, endTime);
      drawStaticGraph (plotArray);
    }
  });  
}

// -function getData-
// Gets data from database based on current selected tags and stores them to "taggedDatasets"
var getData = function (startTime, endTime, separateNumber, plotArray) 
{
  // initialization
  countOfStoredTags = 0;
  currentNumber = 0; 
  if (taggedDatasets.length !== 0) taggedDatasets.length = 0;
  recursiveGet (startTime, endTime, separateNumber, plotArray, 0);
};

// calculate separateNumber depending on startTime and endTime
// currently isn't used. Number is just set as 100.
var calcSeparateNumber = function (startTime, endTime)
{
  return Math.round ((endTime - startTime) / 10000000);
}

// for getting the length of 'taggedDatasets'
var returnLengthOfTaggedDatasets = function ()
{
  return taggedDatasets.length;
}

// -function displayStaticGraph-
// main function for displaying static graph.
var displayStaticGraph = function () {

  // These parameters can be changed.------------------------------

  // time is in millisecond
  // default start time and end time
  var dateDammy1 = new Date();
  var dateDammy2 = dateDammy1.getTime();
  var defaultStartTime = dateDammy2 - 7 * 24 * 3600 * 1000;
  var defaultEndTime = dateDammy2;
  var separateNumber = 100;
  //--------------------------------------------------------------

  var startTime = defaultStartTime;
  var endTime = defaultEndTime;
  var plotArray;
  
  //var startHour = 0, startMinute = 0, endHour = 0, endMinute = 0;

  // initial time for calendar
  var initialStartYear = new Date();
  var initialStartMonth = new Date();
  var initialStartDate = new Date();
  initialStartYear.getYear();
  initialStartMonth.getMonth();
  initialStartDate.getDate();
  var initialEndYear = new Date();
  var initialEndMonth = new Date();
  var initialEndDate = new Date();
  initialEndYear.getYear();
  initialEndMonth.getMonth();
  initialEndDate.getDate();

  var calendarInitialStartTime = parseInt (String (initialStartYear) 
      + String (initialStartMonth) + String (initialStartDate));
  var calendarInitialEndTime = parseInt (String (initialEndYear) 
      + String (initialEndMonth) + String (initialEndDate));

  // when new tags are selected
  // Also, when this function is called first, first tags should be specified.
  $("#tagSelected-box").change (function ()   // if the tags are changed and entered
  {
    selectedTags.length = 0;
    selectedTags = ($("#tagSelected-box").val ());
    if (selectedTags.match (/\S/g))           // space check by regular expression
    {      
      selectedTags = selectedTags.split (",");       // split with comma and store to array
      getData (startTime, endTime, 100, plotArray);
    }
  });
  
  // calendar setup
  var startCal = Calendar.setup (
  {
    cont : "start-calendar-container",
    inputField : "start-calendar-input",
    showTime : false,
    selection : [calendarInitialStartTime], // initialize
    time : 0000,
    min : 20060101, // minimum date
    max : 20201231, // maximum date
    dateFormat : "%s", // format of date

    // event when date is changed
    onSelect : function () 
    {
      // get new startTime
      var tmp = this.selection.get ();
      tmp = Calendar.intToDate (tmp);
      tmp = Calendar.printDate (tmp, "%s");
      startTime = tmp * 1000;

      // for displaying
      var date = this.selection.get ();
      date = Calendar.intToDate (date);
      date = Calendar.printDate (date, "%A, %B %d, %Y");
      var ta = document.getElementById ("start-calendar-input");
      ta.value = date;
      var tempEnd = ($("#end-calendar-input").val ()); // get the value of input of end calendar
      
      if (selectedTags.length !== 0 && tempEnd !== "")
      {
        if (!(startTime < endTime)) 
        {
          alert ("Enter startTime < endTime");
        } else if (returnLengthOfTaggedDatasets !== 0) {

           // if new time scope is outside of default time scope
          if (isOutOfDefault (startTime, endTime, defaultStartTime, defaultEndTime)) 
          {
            getData (startTime, endTime, separateNumber, plotArray);
            defaultStartTime = startTime;
            defaultEndTime = endTime;
          } else {
            plotArray = setPlotArray (separateNumber, startTime, endTime);
            drawStaticGraph (plotArray);
          }
        }
      }
    }
    
    /*
    // event when time is changed
    onTimeChange : function () 
    {
      startHour = this.getHours ();
      startMinute = this.getMinutes ();
      //alert (hours); 
    }
    */
  });

  var endCal = Calendar.setup (
  {
    cont : "end-calendar-container",
    inputField : "end-calendar-input",
    showTime : false,
    selection : [calendarInitialEndTime], // initialize
    time : 0000,
    min : 20060101, // minimum date
    max : 20201231, // maximum date
    dateFormat : "%s", // format of date

    // event when date is changed
    onSelect : function () 
    {
      // get new startTime
      var tmp = this.selection.get ();
      tmp = Calendar.intToDate (tmp);
      tmp = Calendar.printDate (tmp, "%s");
      endTime = tmp * 1000;

      // for displaying
      var date = this.selection.get ();
      date = Calendar.intToDate (date);
      date = Calendar.printDate (date, "%A, %B %d, %Y");
      var ta = document.getElementById ("end-calendar-input");
      ta.value = date;
      var tempStart = ($("#start-calendar-input").val ());
      
      // get the value of input of start calendar
      if (selectedTags.length !== 0 && tempStart !== "") 
      {
        if (!(startTime < endTime)) 
        {
          alert ("Enter startTime < endTime");
        } else if (returnLengthOfTaggedDatasets !== 0) {  // if there is already some input

          // if new time scope is outside of default time scope
          if (isOutOfDefault(startTime, endTime, defaultStartTime, defaultEndTime)) 
          {
            getData (startTime, endTime, separateNumber, plotArray);
            defaultStartTime = startTime;
            defaultEndTime = endTime;
          } else {
          plotArray = setPlotArray (separateNumber, startTime, endTime);
          drawStaticGraph (plotArray);
          }
        }
      }
    }

    // event when time is changed
    /*
    onTimeChange : function () 
    {
      endHour = this.getHours ();
      endMinute = this.getMinutes ();
    }
    */
  });
  
  /* 
  // when time-apply button is clicked  
  // doesn't work correctly
  
  $("#time-apply").click (function () 
  {
    // we need new variables
    var currentStartTime = startTime + startHour * 60 * 60 * 1000 + startMinute * 60 * 1000;
    var currentEndTime = endTime + endHour * 60 * 60 * 1000 + endMinute * 60 * 1000;

    if (selectedTags.length !== 0)
    {
      if (!(currentStartTime < currentEndTime)) 
      {
        alert ("Enter start time < end time");
      } else if (returnLengthOfTaggedDatasets !== 0) {
         // if new time scope is outside of default time scope
      if (isOutOfDefault (currentStartTime, currentEndTime, defaultStartTime, defaultEndTime)) 
        {
          getData (currentStartTime, ecurrentEdTime, separateNumber, plotArray);
          defaultStartTime = currentStartTime;
          defaultEndTime = currentEndTime;
        } else {
          plotArray = setPlotArray (separateNumber, currentStartTime, currentEndTime);
          drawStaticGraph (plotArray);
        }
      }
    }
  })
  */  
};

// implement
$('#start-calendar-input').val("");
$('#end-calendar-input').val("");
displayStaticGraph ();
