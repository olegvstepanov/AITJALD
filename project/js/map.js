var wkt = new Wkt.Wkt(); // Wicket library for WKT geometries

var map = L.map('map').setView([51.9609808, 7.62416839], 13);

var defaults = {
    icon: new L.Icon({
        iconUrl: 'red_dot.png',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        shadowUrl: 'dot_shadow.png',
        shadowSize: [16, 16],
        shadowAnchor: [8, 8]
    }),
    editable: true,
    color: '#AA0000',
    weight: 3,
    opacity: 1.0,
    fillColor: '#AA0000',
    fillOpacity: 1
};

L.tileLayer('http://tile.stamen.com/toner-lite/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.'
}).addTo(map);
map.invalidateSize();

var featureGroup = L.featureGroup().addTo(map);

$('#map_tab').on('click', function(){
    showMap();
    hideDocumentation();
});

var currentYear = 2011;

var info = L.control(),
    legend = L.control();

// set some default variables
// by default load single house hold total count from 2011 
var showThis = {
    area: "Stadtteil",
    year: 2011,
    dataset: "SingleHouseholdTotalCount",
    gender: "female",
    agegroup: "AgeRange_20_29"
}

map.on('zoomend', function () {
    //console.log(map.getZoom());
    try {
        info.removeFrom(map);
    } catch(e){
    }

    if (map.getZoom() >= 12){
        if(showThis.area == "Stadtbezirk") {
            showThis.area = "Stadtteil";
            mapData(currentYear);
        }
    } else {
        if(showThis.area == "Stadtteil") {
            showThis.area = "Stadtbezirk";
            mapData(currentYear);
        }
    }
});

function mapData(y) {
	   var qry = "PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#> "
			+ "PREFIX fn: <http://www.w3.org/2005/xpath-functions#> "
			+ "PREFIX geo: <http://www.opengis.net/ont/geosparql#> "
			+ "PREFIX geof: <http://www.opengis.net/def/function/geosparql/> "
			+ "PREFIX gml: <http://www.opengis.net/ont/gml#> "
			+ "PREFIX owl: <http://www.w3.org/2002/07/owl#> "
			+ "PREFIX par: <http://parliament.semwebcentral.org/parliament#> "
			+ "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> "
			+ "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
			+ "PREFIX sf: <http://www.opengis.net/ont/sf#> "
			+ "PREFIX time: <http://www.w3.org/2006/time#> "
			+ "PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> "
			+ "PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> "
			+ "PREFIX lodcom: <http://vocab.lodcom.de/> "
			+ "SELECT ?id ?name ?n ?wkt "
			+ "WHERE { "
			+ "GRAPH <http://course.introlinkeddata.org/G4> "
				+ "{"
					+ "?bezirk rdf:type lodcom:"+showThis.area+" . "
					+ "?bezirk <http://www.w3.org/2000/01/rdf-schema#label> ?name . "
					+ "?id <http://www.w3.org/2000/01/rdf-schema#label> ?name . "
					+ "?obs <http://purl.org/linked-data/cube#dataSet> lodcom:"+showThis.dataset+" . "
					+ "?obs <http://vocab.lodcom.de/numberOfHouseholds> ?num . "
					+ "?obs lodcom:refArea ?bezirk . "
					+ "?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+showThis.year+"-01-01T00:00:00/P1Y> . "
					+ "?obs <http://purl.org/linked-data/sdmx/2009/measure#obsValue> ?n . "
					+ "?bezirk geo:hasGeometry ?geometry . "
					+ "?geometry geo:asWKT ?wkt. "
					+ "FILTER(lang(?name) = 'en') "
				+ "}"
			+ "} ORDER BY ?n";
    $.post("http://giv-lodumdata.uni-muenster.de:8282/parliament/sparql", {
        query: qry,
        output: 'json'
    },
    function(data){
        //console.log(data);
        processBindings(data);
        //updateLegend();
    });
    currentYear = y;
}

/*
    Find the minimum and maximum data value (nr. of households) in a SPARQL result

    The property that is checked is "?n"
*/
function minmax(data) {
    var min = parseInt(data.results.bindings[0].n.value);
    var max = parseInt(data.results.bindings[0].n.value);
    for(var i in data.results.bindings) {
        if(parseInt(data.results.bindings[i].n.value) < min) {
            min = parseInt(data.results.bindings[i].n.value);
        }
        if(parseInt(data.results.bindings[i].n.value) > max) {
            max = parseInt(data.results.bindings[i].n.value);
        }
    }
    return [min, max];
}

var colorScale;
var gjlayer;

/*
    After querying the SPARQL endpoint data further processing is done from here
    - update the geojson layer
    - calculate new colors for display
    - calculate new entries for legend
    - populate data sheet
    ...
*/
function processBindings(data) {
    // map.removeLayer(featureGroup);
    // featureGroup = L.featureGroup();
    if (gjlayer) map.removeLayer(gjlayer);
    
    var mm = minmax(data);    
    colorScale = chroma.scale(chroma.brewer.OrRd).domain(mm, 'log');
    updateLegend(mm);

    var collection = parseToGeoJSONFeatureCollection(data);
    
    gjlayer = L.geoJson(collection, {
        style: styleFeature,
        onEachFeature: function (feature, layer) {
            layer.on({
                click: function(e) {
                    var isChecked = $("#data_sheet_toggle").prop("checked");
                    console.log("checked: "+isChecked);
                    if (isChecked) {
                        queryDataSheet(feature.id);
                    }
                    
                }
            });
        }
    });
    addPopupToLayer();
    
    gjlayer.addTo(map);
}

function parseToGeoJSONFeatureCollection(data) {
    var geoJsonFeatureCollection = {
      "type": "FeatureCollection",
      "features": []  
    };
    for(var i in data.results.bindings) {
        var current = data.results.bindings[i];
        wkt.read(current.wkt.value);
        
        var geoJson = {
            "type": "Feature",
            "id": "",
            "properties": {},
            "geometry": {}
        };
        
        geoJson.geometry = wkt.toJson();
        geoJson.id = current.id.value;
        geoJson.properties.name = current.name.value;
        geoJson.properties.n = current.n.value;
        
        geoJsonFeatureCollection.features.push(geoJson);
    }
    return geoJsonFeatureCollection;
}

function styleFeature(feature) {
    return {
        color: colorScale(feature.properties.n),
        weight: 0,
        opacity: 0.9,
        fillOpacity: 0.6
    };
}

function addPopupToLayer() {
    gjlayer.eachLayer(function(layer) {
        var other = '<br><img src="dummygraph.jpg">';
        layer.bindPopup("<b>"+layer.feature.properties.name+"</b><br>"+layer.feature.properties.n+" households<br>"+other);
        bindMouseEvents(layer,layer.feature.properties.name);
    });
}

//TODO remove this part as is no longer used
function addWktToMap(wktstring, name, population, col) {
    //console.log(wktstring, name, population, col);
    //console.log(name);
    wkt.read(wktstring);
    //var rgb = "rgb("+Math.floor((Math.random()*255))+","+Math.floor((Math.random()*255))+","+Math.floor((Math.random()*255))+")"; // random colour
    //colourScale(Math.floor(Math.random()*255))
    var districtObj = wkt.toObject({
        fillColor: col,
        color: '#87421F',
        dashArray: '',
        weight: 0.5,
        opacity: 1,
        fillOpacity: 0.9
    });

    var other = '<br><img src="dummygraph.jpg">';

    // districtObj.bindPopup("<b>"+name+"</b><br>"+population+" households<br>"+other);

    bindMouseEvents(districtObj, name, population);
    return districtObj;
}

function bindMouseEvents(districtObj, name) {
    districtObj.on('mouseover', createMouseOverHandler(name));
    districtObj.on('mouseout', mouseOutHandler);
    districtObj.on('click', createNeighborsChart(name));
    districtObj.on('click', createDistrictAndParentChart(name));
}

function createMouseOverHandler(name) {
    return function (e) {
        var layer = e.target;
        layer.setStyle({
            weight: 5,
                //color: '#666',
            dashArray: '',
            fillOpacity: 0.4
        });
        if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
        }

            info.setPosition("topright").addTo(map);
            info.update(name);
    };
}

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (name) {
    if (name){
        this._div.innerHTML = '<h4>'+showThis.area+'</h4>' + '<b>' + name + '</b><br />';
    }
};

/*
    Takes the min/max values of the current data and adds 5 entries to the legend

    minmax must be an array, i.e. [minValue, maxValue]
*/
function updateLegend(minmax) {
    try { map.removeControl(legend); } catch(e) {}
    legend = L.control({position: 'bottomright'});

    var intermediateSteps = [];
    for(var i=0; i<=5; i++){
        var step = minmax[0]+Math.floor((minmax[1]-minmax[0])/5)*i;
        intermediateSteps.push(step);
    }
    // sort numbers in descending order
    intermediateSteps.sort(function(a, b){
        return b-a;
    });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend');
        var labels = [];
        intermediateSteps.forEach(function(dataValue, index, array){
            try{
                labels.push('<i style="background:' + colorScale(dataValue) + '"></i>' + dataValue);
            } catch(e) {
                // not a feature with 'n' (number of households) property
            }
        });
        div.innerHTML = labels.join('<br/>');
        return div;
    };
    legend.addTo(map);
}

function mouseOutHandler(e) {
    var layer = e.target;
    layer.setStyle({
            //color: '#87421F',
            dashArray: '',
            weight: 0.5,
        opacity: 1,
        fillOpacity: 0.9
    });
        try {
            info.removeFrom(map);
        } catch(e){
        }
}

function postQuery(qry, callback) {
    $.post("http://giv-lodumdata.uni-muenster.de:8282/parliament/sparql", {
        query: qry,
        output: 'json'
    },
    callback
    );
}

function createDistrictAndParentChart(name) {
    return function(e){
        var qryParent = "PREFIX lodcom: <http://vocab.lodcom.de/> "
            + "PREFIX geo: <http://www.opengis.net/ont/geosparql#> "
            + "PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#> "
            + "PREFIX qb: <http://purl.org/linked-data/cube#> "
            + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
            + "SELECT ?name ?n ?catname "
            + "WHERE { "
            + "GRAPH <http://course.introlinkeddata.org/G4> { "
                + "lodcom:"+name.toLowerCase()+" lodcom:upperAdministrativeLevel ?parent. "
                + "?parent rdfs:label ?name. "
                + "?obs lodcom:refArea ?parent . "
                + "?obs qb:dataSet ?category . "
                + "?category rdfs:label ?catname . "
                + "?obs lodcom:numberOfHouseholds ?n . "
                + "?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y> "
                + "FILTER (?category IN (lodcom:SingleHouseholdTotalCount,lodcom:TwoPersonsHouseholdCount,lodcom:ThreePersonsHouseholdCount,lodcom:FourPersonsHouseholdCount,lodcom:FivePersonsMoreHouseholdCount))"
                + "FILTER (lang(?name) = 'en' && lang(?catname) = 'en') "
                + "}} ORDER BY ASC(?catname)";
                            
        var qryDistrict = "PREFIX lodcom: <http://vocab.lodcom.de/> "
            + "PREFIX geo: <http://www.opengis.net/ont/geosparql#> "
            + "PREFIX qb: <http://purl.org/linked-data/cube#> "
            + "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
            + "SELECT ?n ?catname "
            + "WHERE { "
            + "GRAPH <http://course.introlinkeddata.org/G4> { "
                + "?obs lodcom:refArea lodcom:"+name.toLowerCase()+" . "
                + "?obs qb:dataSet ?category . "
                + "?category rdfs:label ?catname . "
                + "?obs lodcom:numberOfHouseholds ?n . "
                + "?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y>.  "
                + "FILTER (lang(?catname) = 'en') "
                + "FILTER (?category IN (lodcom:SingleHouseholdTotalCount,lodcom:TwoPersonsHouseholdCount,lodcom:ThreePersonsHouseholdCount,lodcom:FourPersonsHouseholdCount,lodcom:FivePersonsMoreHouseholdCount))"
                + "}}  ORDER BY ASC(?catname)";
        $("#parent_charts_body").append($("<div>",{id: "distr_chart"}).css("display","inline-block").css("height","300px").css("width","40%"));
        $("#parent_charts_body").append($("<div>",{id: "parent_chart"}).css("display","inline-block").css("height","300px").css("width","40%"));
        
        addDataToPieChart(name, qryDistrict, "distr_chart");
        addDataToPieChart(name, qryParent, "parent_chart");
    };
}

function addDataToPieChart(name, qry, id) {
        postQuery(qry, function(data) {
                var currentName =name;
                if (data.results.bindings[0].name) {
                    var currentName = data.results.bindings[0].name.value;
                }
                var chartData = data.results.bindings.filter(
                    function(binding){
                        return binding.catname.value.split(" ").length > 5;
                    }).map(function(binding) {
                        return {
                            y : parseInt(binding.n.value),
                            name: binding.catname.value
                        };
                 });
            //addChartDiv("#sidebar-container", id);
            createPieChart(currentName, chartData, id);
        });
}

    function createPieChart(name, chartData, id, title) {
        var chart = new CanvasJS.Chart(id,{
        title:{
            text: "Households distribution in "+name,
            fontFamily: "arial black"
        },
        animationEnabled: true,
        legend: {
            verticalAlign: "bottom",
            horizontalAlign: "center"
        },
        theme: "theme1",
        data: [
        {        
            type: "pie",
                indexLabelFontFamily: "Lucida Sans Unicode",       
                indexLabelFontSize: 12,
            indexLabelFontWeight: "bold",
            startAngle:0,
            indexLabelFontColor: "MistyRose",       
            indexLabelLineColor: "darkgrey", 
            indexLabelPlacement: "inside", 
            toolTipContent: "{name}: {y} households",
            showInLegend: true,
            indexLabel: "#percent%", 
            dataPoints: chartData
        }
        ]
    });
    chart.render();
}

function addChartDiv(whereId, whatId) {
        $(whereId).append('<div id='+whatId+'></div></br>')
}

function createNeighborsChart(name) {
    return function(e) {
        var qryNeighborAllCateg = "PREFIX lodcom: <http://vocab.lodcom.de/> "
			+ "PREFIX geo: <http://www.opengis.net/ont/geosparql#> "
			+ "PREFIX qb: <http://purl.org/linked-data/cube#> "
			+ "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> "
			+ "SELECT ?name ?n ?catname "
			+ "WHERE { "
			+ "GRAPH <http://course.introlinkeddata.org/G4> {"
				+ "{"
						+ "lodcom:"+name.toLowerCase()+" lodcom:touches ?neighbor. "
						+ "?neighbor rdfs:label ?name. "
						+ "?obs lodcom:refArea ?neighbor . "
						+ "?obs qb:dataSet ?category . "
						+ "?category rdfs:label ?catname . "
						+ "?obs lodcom:numberOfHouseholds ?n . "
						+ "?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y> . "
						+ "FILTER (lang(?name) = 'en' && lang(?catname) = 'en')"
				+ "} UNION {"
						+ "lodcom:"+name.toLowerCase()+" rdfs:label ?name. "
						+ "?obs lodcom:refArea lodcom:"+name.toLowerCase()+" . "
						+ "?obs qb:dataSet ?category . "
						+ "?category rdfs:label ?catname . "
						+ "?obs lodcom:numberOfHouseholds ?n . "
						+ "?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y> . "
						+ "FILTER (lang(?name) = 'en' && lang(?catname) = 'en')"
				+ "}"
			+ "}} ORDER BY ASC(?catname)";
                    
        postQuery(qryNeighborAllCateg, function(data) {
                console.log(data.results.bindings);
            var chartData = {};
            for (var i in data.results.bindings) {
                var categ = data.results.bindings[i].catname.value;
                var popul = parseInt(data.results.bindings[i].n.value);
                    var distr = data.results.bindings[i].name.value;
                    if (categ.split(" ").length>5){
                        if (!(categ in chartData)){
                            chartData[categ] = [{y : popul, label: distr}]
                        }
                        else {
                            chartData[categ].push({y : popul, label: distr})
                        }
                    }
                }
            var chartContent = [];
            for (var category in chartData) {
                var oneCategWithLegend = {
                    type: "stackedBar",
                    showInLegend: true,
                    name: category,
                    axisYType: "secondary",
                    dataPoints: chartData[category]
                };
                chartContent.push(oneCategWithLegend);
            }
            //addChartDiv("#content-container", "neighbor-container");
            createBarChart(chartContent);
        });
    };
}

function createBarChart(chartContent) {
    $("#neighbor_charts_body").append($("<div>",{id:"neigh_chart"}).css("height","300px").css("width","70%"));
    
    var chart = new CanvasJS.Chart("neigh_chart", {
        title:{
            text:"Neighbor districts households in " + currentYear
        },
        animationEnabled: true,
        axisX:{
            interval: 1,
            gridThickness: 0,
            labelFontSize: 10,
            labelFontStyle: "normal",
            labelFontWeight: "normal",
            labelFontFamily: "Lucida Sans Unicode"
        },
        axisY2:{
                        // interlacedColor: "rgba(1,77,101,.2)",
            gridColor: "rgba(1,77,101,.1)"
        },
        toolTip: {
            shared: true
        },
        legend:{
                        verticalAlign: "bottom",
            horizontalAlign: "center"
        },
        data: chartContent
    });
    chart.render();
}

mapData(2011);

