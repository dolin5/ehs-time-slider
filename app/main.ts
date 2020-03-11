import Map from "esri/Map";
import MapView from "esri/views/MapView";
import GeoJSONLayer from "esri/layers/GeoJSONLayer";
import FeatureLayer from "esri/layers/FeatureLayer";
import TimeSlider from "esri/widgets/TimeSlider";
import TimeExtent from "esri/TimeExtent";
import Expand from "esri/widgets/Expand";
import Legend from "esri/widgets/Legend";

// const map = new EsriMap({
//   basemap: "streets"
// });

// const view = new MapView({
//   map: map,
//   container: "viewDiv",
//   center: [-118.244, 34.052],
//   zoom: 12
// });


let layerView:__esri.FeatureLayerView;

const septicsLayer = new FeatureLayer({
  portalItem:{
    id:"17a725a913cc415195ac9263e12e22e7"
  }
})

const map = new Map({
  basemap: "dark-gray",
  layers: [septicsLayer]
});

var view = new MapView({
  map: map,
  container: "viewDiv",
  zoom: 12,
  center: [-111.1420268, 45.7]
});

// create a new time slider widget
// set other properties when the layer view is loaded
// by default timeSlider.mode is "time-window" - shows
// data falls within time range
const timeExtent = new TimeExtent({
  start: new Date(Date.UTC(1965, 0, 1)),
  end: new Date(Date.UTC(2020, 3, 0))
});
const timeSlider = new TimeSlider({
  container: "timeSlider",
  stops: {
    interval: {
      value: 1,
      unit: "years"
    }
  },
  playRate:500,
  loop:false,
  mode:"cumulative-from-start",
  fullTimeExtent: timeExtent,
});
view.ui.add(timeSlider, "manual");

// wait till the layer view is loaded
view.whenLayerView(septicsLayer).then(function(lv) {
  layerView = lv;
  timeSlider.watch("timeExtent", function() {
    // only show earthquakes happened up until the end of
    // timeSlider's current time extent.
    //layer.definitionExpression = "ISSUEDATE <= " + timeSlider.timeExtent.end.getTime();
  
    // now gray out earthquakes that happened before the time slider's current
    // timeExtent... leaving footprint of earthquakes that already happened
    layerView.effect = {
      filter: {
        where:  "ISSUEDATE <= " + timeSlider.timeExtent.end.getTime() + " AND ISSUEDATE >= "+ timeSlider.fullTimeExtent.start.getTime()
      },
      excludedEffect: "grayscale(80%) opacity(1%)"
    };
  
    // run statistics on earthquakes fall within the current time extent
    const statQuery = layerView.effect.filter.createQuery();
    
  
    septicsLayer
      .queryFeatures({where:  "ISSUEDATE <= '" + (timeSlider.timeExtent.end.getMonth()+1)+"/"+timeSlider.timeExtent.end.getDate()+"/"+timeSlider.timeExtent.end.getFullYear() + "' "+
       "AND ISSUEDATE >= '"+(timeSlider.fullTimeExtent.start.getMonth()+1)+"/"+timeSlider.fullTimeExtent.start.getDate()+"/"+timeSlider.fullTimeExtent.start.getFullYear()+"'",
       outFields:['ISSUEDATE']
      })
      .then(function(result) {
        let htmls = [];
        statsDiv.innerHTML = "";
        if (result.error) {
          return result.error;
        } else {
          if (result.features.length >= 1) {
            var yearHtml =
              "Septics issued between " +
              timeSlider.fullTimeExtent.start.toLocaleDateString() +
              " - " +
              timeSlider.timeExtent.end.toLocaleDateString() +
              "<br/>" + result.features.length;
              statsDiv.innerHTML = yearHtml;
          }
        }
      })
      .catch(function(error) {
        console.log(error);
      });
  });

  
});

// watch for time slider timeExtent change



// add a legend for the earthquakes layer
const legendExpand = new Expand({
  collapsedIconClass: "esri-icon-collapse",
  expandIconClass: "esri-icon-expand",
  expandTooltip: "Legend",
  view: view,
  content: new Legend({
    view: view
  }),
  expanded: false
});
view.ui.add(legendExpand, "top-left");

const statsDiv = document.getElementById("statsDiv");
const infoDiv = document.getElementById("infoDiv");
const infoDivExpand = new Expand({
  collapsedIconClass: "esri-icon-collapse",
  expandIconClass: "esri-icon-expand",
  expandTooltip: "Expand earthquakes info",
  view: view,
  content: infoDiv,
  expanded: true
});
view.ui.add(infoDivExpand, "top-right");