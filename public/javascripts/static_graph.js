/**
 * @author Shinichi
 * this is script file for static graph.
 * based on 5.4.3.4 in ADD.
 */

$(document).ready(function(){

// -- Main Class --
//
// Arguments:
//  separateNumber: Number by which time array separated.
var StaticDisplayClass = function (sepNumber)
{
  // private
  var separateNumber = sepNumber;
  var separatedTime = [];                 // Time array separated by 'separateNumber'
  var taggedDatasets = [];                // Original data obtained from server

  this.countOfStoredTags = 0;             // Number of tags already stored into array
  this.selectedTags = [];                 // Specified tags
  this.plotArray = [];                    // Data Array just before plot
  this.alreadySet = false;
  this.inCalendar = false;
  this.usersInChangingBox = false;        // Bool for user is changing tag box now or not.
  this.inRecursiveGet = false;
  
  // class for taggedDatasets
  function taggedObject (tagName) 
  {
    this.tagName = tagName;
    this.timeArray = new Array;
  }
  
  // class for plotArray
  function plotObject (tagName) 
  {
    this.tagName = tagName;
    this.number = new Array;
  }

  // -function startGetData-
  // Function for initialization and calling 'recursiveGet'
  // Called when start getting data.
  this.startGetData = function (startTime, endTime)
  {
    this.countOfStoredTags = 0;
    if (taggedDatasets.length !== 0) taggedDatasets.length = 0;
    this.recursiveGet (startTime, endTime);
  }  

  // -function recursiveGet-  
  // Main function for getting data
  // Has to calculate recursively
  this.recursiveGet = function (startTime, endTime)
  {
    var filters = "%7B" + "%22" + this.selectedTags[this.countOfStoredTags] + "%22:0.9" + "%7D";
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
      context : this,      
      success : function (data) 
      {
        //this.countOfStoredTags++;
        this.storeDataToArray (data);
        this.inRecursiveGet = false;
      },
      error : function (dammy, text) 
      {
        alert (text);
      }
    });
  }
  
  // -function storeDataToArray-
  // Function for storing data obtained from server to 'taggedDatasets'
  this.storeDataToArray = function (data)
  {
    taggedDatasets.push (new taggedObject (this.selectedTags[this.countOfStoredTags]));
    for (var j = 0; j < data.length; j++) 
    { 
      // convert date
      var milliDate = Date.parse (data[j].created_at);
      taggedDatasets[this.countOfStoredTags].timeArray.push (milliDate);
    }
    taggedDatasets[this.countOfStoredTags].timeArray.sort (function (a, b) {return a-b;});   // Currently we need sort!
    this.countOfStoredTags++;
  }
  
  // -function setPlotArray-
  // Separates current time scope to "seprateNumber" time scope, and in each time scope, the number
  // and the percentage of tweets in "taggedDatasets are calculated and stored to "plotArray"
  this.setPlotArray = function (startTime, endTime) 
  {
    this.alreadySet = true;
    // initialization
    var currentNumber;
    var interval = Math.round ((endTime - startTime) / separateNumber);
    separatedTime.length = 0;
    this.plotArray.length = 0;
  
    // the number of elements of this array should be same as separateNumber + 1
    for (var i = 0; i < separateNumber; i++) 
    { 
      separatedTime.push (startTime + i * interval);
    }
    separatedTime.push (endTime);
    // in order to avoid ignoring endTime because of rounding
    var dammyStart = startTime - interval;
    // for the result of the first element

    for (var i = 0, i_len = taggedDatasets.length; i < i_len; i++)// for number of tags
    {
      this.plotArray[i] = new plotObject (taggedDatasets[i].tagName);
      // j : for timeArray
      // k : for separatedTime
      // first check time before dammyStart
      for (var j = 0, j_len = taggedDatasets[i].timeArray.length; j < j_len; j++) 
      {
        if (dammyStart <= taggedDatasets[i].timeArray[j]) break;
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
              if (j_len <= j) break;
            }
          }
          this.plotArray[i].number.push ([separatedTime[k], currentNumber]);
        } else {
          this.plotArray[i].number.push ([separatedTime[k], 0]);
        }
      }
      // if all separatedTime hasn't been considered
      while (k < separateNumber + 1) 
      {
        this.plotArray[i].number.push ([separatedTime[k], 0]);
        k++;
      }
    }
  }
  
  // -function returnLengthOfTaggedDatasets-
  // Get the length of 'taggedDatasets'
  this.returnLengthOfTaggedDatasets = function ()
  {
    return taggedDatasets.length;
  }
}

// -function drawStaticGraph-
// Draws data in "plotArray" onto the graph.
var drawStaticGraph = function (ObjectStatic) 
{
  $(function () 
  {
    // first correct the timestamps - they are recorded as the daily
    // midnights in UTC+0100, but Flot always displays dates in UTC
    // so we have to add one hour to hit the midnights in the plot

    // helper for returning the weekends in a period
    function weekendAreas (axes) 
    {
      var markings = [];
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
      },
      lines: {show:true, fill:true}
    };
    // convert for plot format
    var data = [];
    data.length = 0;
    for (var m = 0, m_len = ObjectStatic.plotArray.length; m < m_len; m++) 
    {
      data.push (
      {
        data : ObjectStatic.plotArray[m].number,
        label : ObjectStatic.plotArray[m].tagName
      });
    }
    // plot
    var plot = $.plot ($("#placeholder"), data, options);

    // zooming
    $("#placeholder").bind ("plotselected", function (event, ranges) 
    {      
      // rearrange so that detailed will be shown
      ObjectStatic.alreadySet = false;
      ObjectStatic.plotArray.length = 0;
      ObjectStatic.setPlotArray (Math.round (ranges.xaxis.from), Math.round (ranges.xaxis.to))
      data.length = 0;
      for (var m = 0; m < ObjectStatic.plotArray.length; m++)
      {
        data.push (
        {
          data : ObjectStatic.plotArray[m].number,
          label : ObjectStatic.plotArray[m].tagName
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

// -function isOutOfDefault-
// Checks if new time scope is out of default or not.
var isOutOfDefault = function (inputStartTime, inputEndTime, defaultStartTime, defaultEndTime) 
{
  if (inputStartTime < defaultStartTime || defaultEndTime < inputEndTime)
    return true;
  else
    return false;
};

// -function displayStaticGraph-
// main function for displaying static graph.
var displayStaticGraph = function () {
  // These parameters can be changed.------------------------------
  // Time is in millisecond
  var dateDammy1 = new Date ();
  var dateDammy2 = dateDammy1.getTime ();
  var defaultStartTime = dateDammy2 - 7 * 24 * 3600 * 1000;
  var defaultEndTime = dateDammy2;
  var separateNumber = 100;
  //--------------------------------------------------------------

  var startTime = defaultStartTime;
  var endTime = defaultEndTime;

  // Create main object
  var Static = new StaticDisplayClass (separateNumber);
  
  // When new tags are entered
  // Also, when this function is called first, first tags should be specified.
  $("#tagSelected-box").change (function ()   // if the tags are changed and entered
  {
    Static.selectedTags.length = 0;
    Static.selectedTags = ($("#tagSelected-box").val ());    
    if (Static.selectedTags.match (/\S/g))           // space check by regular expression
    {      
      Static.selectedTags = Static.selectedTags.split (",");       // split with comma and store to array
      if (Static.selectedTags.length <= 3)
      {
        Static.usersInChangingBox = true;
        Static.startGetData (startTime, endTime);
        
        // After ajax completed
        $(document).ajaxComplete (function () 
        { 
          if (!Static.inCalendar && Static.usersInChangingBox) 
          {
            if (Static.countOfStoredTags < Static.selectedTags.length) 
            {
              Static.recursiveGet (startTime, endTime);      
            } else if (Static.countOfStoredTags === Static.selectedTags.length) {
              Static.alreadySet = false;
              Static.setPlotArray (startTime, endTime);
              drawStaticGraph (Static);
              Static.usersInChangingBox = false;
            }
          }
        });
      } else {
        alert ("Please set less than or equal to three tags.");
      }
    } else {
      alert ("Please separate tags with commas. And no space.");
    }
  });
  
  // Calendar for start date
  var startCal = Calendar.setup (
  {
    cont : "start-calendar-container",
    inputField : "start-calendar-input",
    showTime : false,
    min : 20060101, // minimum date
    max : 20201231, // maximum date
    dateFormat : "%s", // format of date

    // event when date is changed
    onSelect : function () 
    {
      var tempStartTime = startTime;
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
            
      if (tempEnd === "")
      {
        defaultStartTime = startTime;
      }
      else if (!(startTime < endTime)) 
      {
        alert ("Enter startTime < endTime");
        startTime = tempStartTime;
      }
      else if ($("#tagSelected-box").val ())
      {
        if (Static.returnLengthOfTaggedDatasets !== 0) 
        {
           // if new time scope is outside of default time scope
          if (isOutOfDefault (startTime, endTime, defaultStartTime, defaultEndTime)) 
          {
            defaultStartTime = startTime;
            defaultEndTime = endTime;
            Static.inCalendar = true;
            Static.alreadySet = false;
            Static.startGetData (startTime, endTime);
            // After ajax completed
            $(document).ajaxComplete (function () 
            { 
              if (Static.countOfStoredTags < Static.selectedTags.length) 
              {
                if (!Static.inRecursiveGet) 
                {
                  Static.inRecursiveGet = true;
                  Static.recursiveGet (startTime, endTime);
                }
              } 
              else if (Static.countOfStoredTags === Static.selectedTags.length) 
              {
                if (!Static.alreadySet)
                {
                  Static.plotArray.length = 0;
                  Static.setPlotArray (startTime, endTime);
                  drawStaticGraph (Static);
                  Static.inCalendar = false;
                }
              }
            });
          } else {                      // If not, we don't need to get new data.
            Static.alreadySet = false;
            Static.plotArray.length = 0;
            Static.setPlotArray (startTime, endTime);
            drawStaticGraph (Static);
          }
        }
      } else {
        defaultStartTime = startTime;
      }
    }
  });

  // Calendar for end date
  var endCal = Calendar.setup (
  {
    cont : "end-calendar-container",
    inputField : "end-calendar-input",
    showTime : false,
    min : 20060101, // minimum date
    max : 20201231, // maximum date
    dateFormat : "%s", // format of date

    // event when date is changed
    onSelect : function () 
    {
      var tempEndTime = endTime;
      // get new endTime
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
      if (tempStart === "")
      {
        defaultEndTime = endTime;
      }
      else if (!(startTime < endTime)) 
      {
        alert ("Enter startTime < endTime");
        endTime = tempEndTime;
      }
      else if ($("#tagSelected-box").val ())
      {
        if (Static.returnLengthOfTaggedDatasets !== 0)  // if there is already some input
        {
          // if new time scope is outside of default time scope
          if (isOutOfDefault (startTime, endTime, defaultStartTime, defaultEndTime)) 
          {
            defaultStartTime = startTime;
            defaultEndTime = endTime;
            Static.inCalendar = true;
            Static.alreadySet = false;
            Static.startGetData (startTime, endTime);
            // After ajax completed
            $(document).ajaxComplete (function () 
            { 
              if (!Static.alreadySet) 
              {
                if (Static.countOfStoredTags < Static.selectedTags.length) 
                {
                  if (!Static.inRecursiveGet) 
                  {
                    Static.inRecursiveGet = true;
                    Static.recursiveGet (startTime, endTime);
                  }      
                } else if (Static.countOfStoredTags === Static.selectedTags.length) 
                {
                  Static.plotArray.length = 0;
                  Static.setPlotArray (startTime, endTime);
                  drawStaticGraph (Static);
                  Static.inCalendar = false;
                }
              }
            });
          } else {
            Static.alreadySet = false;
            Static.plotArray.length = 0;
            Static.setPlotArray (startTime, endTime);
            drawStaticGraph (Static);
          }
        }
      } else {
        defaultEndTime = endTime;
      }
    }
  });  
};

// implement
$('#start-calendar-input').val("");
$('#end-calendar-input').val("");
displayStaticGraph ();

});
