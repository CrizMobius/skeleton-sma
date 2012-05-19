/**
 * @author Shinichi
 * this is script file for dynamic graph.
 */

var selectedTags = [];
var data = [];

var getData = function ()
{  
  var calculate = function (gotData)
  {
    for (var i = 0; i < gotData.length; i++)
    {
      data.push (
      {
        data : array[i].number,
        label : array[i].tagName
      });
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
/*    for (var i = 0, i_len = gotData.length; i < i_len; i++)
    {
      data.push (
      {
        data : array[i].number,
        label : array[i].tagName
      });
    }*/
  });
  return data;
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
      yaxis: { min: 0 },
      xaxis : {
        mode : "time",
        tickLength : 5
      },
      grid : {markings : weekendAreas }
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

  // when new tags are selected
  // Also, when this function is called first, first tags should be specified.
  $("#tagSelected-box").change (function ()   // if the tags are changed and entered
  {
    selectedTags.length = 0;
    selectedTags = ($("#tagSelected-box").val ());
    if (selectedTags.match (/\S/g))           // space check by regular expression
    {      
      selectedTags = selectedTags.split (",");       // split with comma and store to array
      //getPreviousData (startTime, endTime, data);
      
      drawDynamicGraph ();      
    }
  });
};

// implementation
displayDynamicGraph ();
