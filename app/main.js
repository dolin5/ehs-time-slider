var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/Map", "esri/views/MapView", "esri/layers/FeatureLayer", "esri/widgets/TimeSlider", "esri/tasks/support/Query", "esri/TimeExtent", "esri/widgets/Expand", "esri/widgets/Legend"], function (require, exports, Map_1, MapView_1, FeatureLayer_1, TimeSlider_1, Query_1, TimeExtent_1, Expand_1, Legend_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Map_1 = __importDefault(Map_1);
    MapView_1 = __importDefault(MapView_1);
    FeatureLayer_1 = __importDefault(FeatureLayer_1);
    TimeSlider_1 = __importDefault(TimeSlider_1);
    Query_1 = __importDefault(Query_1);
    TimeExtent_1 = __importDefault(TimeExtent_1);
    Expand_1 = __importDefault(Expand_1);
    Legend_1 = __importDefault(Legend_1);
    // const map = new EsriMap({
    //   basemap: "streets"
    // });
    // const view = new MapView({
    //   map: map,
    //   container: "viewDiv",
    //   center: [-118.244, 34.052],
    //   zoom: 12
    // });
    var layerView;
    var septicsLayer = new FeatureLayer_1.default({
        portalItem: {
            id: "17a725a913cc415195ac9263e12e22e7"
        }
    });
    var map = new Map_1.default({
        basemap: "dark-gray",
        layers: [septicsLayer]
    });
    var view = new MapView_1.default({
        map: map,
        container: "viewDiv",
        zoom: 12,
        center: [-111.1420268, 45.7]
    });
    // create a new time slider widget
    // set other properties when the layer view is loaded
    // by default timeSlider.mode is "time-window" - shows
    // data falls within time range
    var timeExtent = new TimeExtent_1.default({
        start: new Date(Date.UTC(1965, 0, 1)),
        end: new Date(Date.UTC(2020, 3, 0))
    });
    var timeSlider = new TimeSlider_1.default({
        container: "timeSlider",
        stops: {
            interval: {
                value: 1,
                unit: "years"
            }
        },
        playRate: 500,
        loop: false,
        mode: "cumulative-from-start",
        fullTimeExtent: timeExtent,
    });
    view.ui.add(timeSlider, "manual");
    // wait till the layer view is loaded
    view.whenLayerView(septicsLayer).then(function (lv) {
        layerView = lv;
        timeSlider.watch("timeExtent", function () {
            // only show earthquakes happened up until the end of
            // timeSlider's current time extent.
            //layer.definitionExpression = "ISSUEDATE <= " + timeSlider.timeExtent.end.getTime();
            // now gray out earthquakes that happened before the time slider's current
            // timeExtent... leaving footprint of earthquakes that already happened
            layerView.effect = {
                filter: {
                    where: "ISSUEDATE <= " + timeSlider.timeExtent.end.getTime() + " AND ISSUEDATE >= " + timeSlider.fullTimeExtent.start.getTime()
                },
                excludedEffect: "grayscale(80%) opacity(1%)"
            };
            // run statistics on earthquakes fall within the current time extent
            var statQuery = layerView.effect.filter.createQuery();
            var query = new Query_1.default({
                where: "ISSUEDATE <= '" + (timeSlider.timeExtent.end.getMonth() + 1) + "/" + timeSlider.timeExtent.end.getDate() + "/" + timeSlider.timeExtent.end.getFullYear() + "' " +
                    "AND ISSUEDATE >= '" + (timeSlider.fullTimeExtent.start.getMonth() + 1) + "/" + timeSlider.fullTimeExtent.start.getDate() + "/" + timeSlider.fullTimeExtent.start.getFullYear() + "'",
                outFields: ['ISSUEDATE'],
            });
            septicsLayer
                .queryFeatureCount({ where: "ISSUEDATE <= '" + (timeSlider.timeExtent.end.getMonth() + 1) + "/" + timeSlider.timeExtent.end.getDate() + "/" + timeSlider.timeExtent.end.getFullYear() + "' " +
                    "AND ISSUEDATE >= '" + (timeSlider.fullTimeExtent.start.getMonth() + 1) + "/" + timeSlider.fullTimeExtent.start.getDate() + "/" + timeSlider.fullTimeExtent.start.getFullYear() + "'",
                outFields: ['ISSUEDATE']
            })
                .then(function (result) {
                var htmls = [];
                statsDiv.innerHTML = "";
                if (result.error) {
                    return result.error;
                }
                else {
                    var yearHtml = "Septics issued between " +
                        timeSlider.fullTimeExtent.start.toLocaleDateString() +
                        " - " +
                        timeSlider.timeExtent.end.toLocaleDateString() +
                        "<br/>" + result;
                    statsDiv.innerHTML = yearHtml;
                }
            })
                .catch(function (error) {
                console.log(error);
            });
        });
    });
    // add a legend for the earthquakes layer
    var legendExpand = new Expand_1.default({
        collapsedIconClass: "esri-icon-collapse",
        expandIconClass: "esri-icon-expand",
        expandTooltip: "Legend",
        view: view,
        content: new Legend_1.default({
            view: view
        }),
        expanded: false
    });
    view.ui.add(legendExpand, "top-left");
    var statsDiv = document.getElementById("statsDiv");
    var infoDiv = document.getElementById("infoDiv");
    var infoDivExpand = new Expand_1.default({
        collapsedIconClass: "esri-icon-collapse",
        expandIconClass: "esri-icon-expand",
        expandTooltip: "Expand earthquakes info",
        view: view,
        content: infoDiv,
        expanded: true
    });
    view.ui.add(infoDivExpand, "top-right");
});
//# sourceMappingURL=main.js.map