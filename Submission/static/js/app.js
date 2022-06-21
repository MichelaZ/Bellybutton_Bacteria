function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("static/data/samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("static/data/samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("static/data/samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var sampleData = samples.filter(sampleNum => sampleNum.id == sample)
    //  5. Create a variable that holds the first sample in the array.
    sampleData = sampleData[0]

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = sampleData.otu_ids;
    var otu_labels = sampleData.otu_labels;
    var sample_values = sampleData.sample_values;

    var colorArray = ["#fbc3bc", "#fcd5ce", "#fae1dd", "#F7E6DA", "#ECE4DB", "#D4E5E3", "#C4DBD9", "#CAE0E4", "#C8C7D6", "#D7BED2"];
    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    var yticks = otu_ids.slice(0, 10).map(otu_id => `OTU ${otu_id}`).reverse();

    // 8. Create the trace for the bar chart. 
    var trace = {
    x: sample_values.slice(0, 10).reverse(),
    y: yticks,
          hovertext: otu_labels.slice(0, 10).reverse(),
          name: 'Top Bacteria',
          orientation: "h",
          marker: {
              color: colorArray
          },
          type: 'bar'
        }
    var barData = [trace];
    // 9. Create the layout for the bar chart. 
    var barLayout = { 
      plot_bgcolor:"rgba(0,0,0,0)",
      paper_bgcolor:"rgba(0,0,0,0)",
      title: "<b>Top Bacteria Bar Chart</b>"
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot('bar', barData, barLayout);

    // 1. Create the trace for the bubble chart.
    var trace2 =  {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: "markers",
      marker: {
        color: otu_ids,
        size:  sample_values,
        }
    }
    var bubbleData = [trace2];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      plot_bgcolor:"rgba(0,0,0,0)",
      paper_bgcolor:"rgba(0,0,0,0)",
      title: {
        text:'<b>Bacteria Cultures Per Sample</b>',
        font: {
          size: 24
        }},
      
      xaxis: { title: "<b>OTU ID</b>"},
      hovermode: "closest",
      };
  //get wash frequency data
  var objects = data.metadata;
  var matchedObject = objects.filter(sampleData => 
      sampleData["id"] === parseInt(sample));
      
     gaugeChart(matchedObject[0]);
         function gaugeChart(data) {
    // Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout, {responsive: true}); 
      
          if(data.wfreq === null){
            data.wfreq = 0;
          }
          // I referenced the website below to make a guage out of a doughnut chart:
         //https://code.tutsplus.com/tutorials/create-interactive-charts-using-plotlyjs-pie-and-gauge-charts--cms-29216       
          var degree = parseInt(data.wfreq) * (180/10);

          // calculate meter point
          var degrees = 180 - degree;
          var radius = .5;
          var radians = degrees * Math.PI / 180;
          var x = radius * Math.cos(radians);
          var y = radius * Math.sin(radians);
        
          var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
              pathX = String(x),
              space = ' ',
              pathY = String(y),
              pathEnd = ' Z';
         var path = mainPath.concat(pathX, space, pathY, pathEnd);
       // create trace
        var trace3 = [{ type: 'scatter',
         x: [0], y:[0],
          marker: {size: 50, color:'001219', text: data.wfreq, textfont: {color: "white"}},
          showlegend: false,
          name: 'WASH FREQUENCY',
          text: data.wfreq,
          font:{color: "white"},
          hoverinfo: 'text+name'},
        { values: [1, 1, 1, 1, 1, 1, 1, 1, 1, 9],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
        textinfo: 'text',
        textposition:'inside',
        textfont:{
          size : 14,
          },
        marker: {colors:["#fbc3bc", "#fae1dd", "#F7E6DA", "#ECE4DB", "#D4E5E3", "#C4DBD9", "#CAE0E4", "#C8C7D6", "#D7BED2", "rgba(0,0,0,0)"]},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '2-1', '0-1', ''],
        hoverinfo: 'text',
        hole: .7,
        type: 'pie',
        showlegend: false
      }];
      //format layout
      let guageLayout = {
        
        plot_bgcolor:"rgba(0,0,0,0)",
        paper_bgcolor:"rgba(0,0,0,0)",
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '#001219',
            line: {
              color: '#001219'
            },
 
          }],
    
        title: '<b>Belly Button Washing Frequency</b> <br> <i>Scrub(s) Per Week: </i><b>' + data.wfreq + '</b>',
        height: 550,
        width: 550,
        xaxis: {zeroline:false, showticklabels:false,
                   showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                   showgrid: false, range: [-1, 1]},
      };
      var config = {responsive: true}
    //add plot
  Plotly.newPlot('gauge', trace3, guageLayout, config);
    }
  }
)};




