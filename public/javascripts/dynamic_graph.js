/**
 * @author Shinichi
 * this is script file for dynamic graph.
 */

var selectedTags = [];
var data = [];

//var getPreviousData


var getData = function ()
{  
  var calculate = function (gotData)
  {
    for (var i = 0; i < ; i++)
    {
      
    }
  }
  
  var jug = new Juggernaut(
  {
    secure: ('https:' == document.location.protocol),
    host: document.location.hostname,
    port: 8080
  });
  
  jug.subscribe ("nosy", function (gotData)
  {
    calculate (gotData);
    data.push (
    {
      
    });
  });
}



var drawDynamicGraph = function ()
{
  $(function () 
  {
    // we use an inline data source in the example, usually data would
    // be fetched from a server
    var updateInterval = 2000;
    
    // setup plot
    var options = 
    {
      series: { shadowSize: 0 }, // drawing is faster without shadows
      yaxis: { min: 0, max: 100 },
      xaxis: { show: false }
    };
    var plot; //= $.plot($("#placeholder"), [ getRandomData() ], options);
    function updateData () 
    {
      plot.setData([ getData() ]);
      // since the axes don't change, we don't need to call plot.setupGrid()
      plot.draw();        
      setTimeout(update, updateInterval);
    }
    updateData();
  });
}



// -function displayDynamicGraph-
// main function for displaying dynamic graph.
var displayDynamicGraph = function () {

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
      //separateNumber = calcSeparateNumber (startTime, endTime);
      //countOfStoredTags = 0;
      //taggedDatasets.length = 0;
      //getPreviousData (startTime, endTime, data);
      
      drawDynamicGraph ();
      
    }
  });
};


