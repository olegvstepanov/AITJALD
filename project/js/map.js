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


var featureGroup = L.featureGroup().addTo(map);

// queries/administrative-levels-0.txt
// "Stadtbezirk"
// var qry = "PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#> PREFIX fn: <http://www.w3.org/2005/xpath-functions#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX gml: <http://www.opengis.net/ont/gml#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX par: <http://parliament.semwebcentral.org/parliament#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX sf: <http://www.opengis.net/ont/sf#> PREFIX time: <http://www.w3.org/2006/time#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX lodcom: <http://vocab.lodcom.de/> SELECT ?name ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> {?bezirk rdf:type lodcom:Stadtbezirk . ?bezirk <http://www.w3.org/2000/01/rdf-schema#label> ?name . ?bezirk geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt }}";

// queries/administrative-levels-1.txt
// "Teilbereich"
//var qry = "PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#> PREFIX fn: <http://www.w3.org/2005/xpath-functions#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX gml: <http://www.opengis.net/ont/gml#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX par: <http://parliament.semwebcentral.org/parliament#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX sf: <http://www.opengis.net/ont/sf#> PREFIX time: <http://www.w3.org/2006/time#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX lodcom: <http://vocab.lodcom.de/> SELECT ?name ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> {?bezirk rdf:type lodcom:Teilbereich . ?bezirk <http://www.w3.org/2000/01/rdf-schema#label> ?name . ?bezirk geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt }}";

// queries/administrative-levels-2.txt
// "Stadtteil"
//var qry = "PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#> PREFIX fn: <http://www.w3.org/2005/xpath-functions#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX gml: <http://www.opengis.net/ont/gml#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX par: <http://parliament.semwebcentral.org/parliament#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX sf: <http://www.opengis.net/ont/sf#> PREFIX time: <http://www.w3.org/2006/time#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX lodcom: <http://vocab.lodcom.de/> SELECT ?name ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> {?bezirk rdf:type lodcom:Stadtteil . ?bezirk <http://www.w3.org/2000/01/rdf-schema#label> ?name . ?bezirk geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt }}";

// queries/min-max-one-person-adm2.txt
// query minimum and maximum for the above qry
//var qry2 = "PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#> PREFIX fn: <http://www.w3.org/2005/xpath-functions#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX gml: <http://www.opengis.net/ont/gml#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX par: <http://parliament.semwebcentral.org/parliament#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX sf: <http://www.opengis.net/ont/sf#> PREFIX time: <http://www.w3.org/2006/time#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX lodcom: <http://vocab.lodcom.de/> SELECT MIN(?n) MAX(?n) WHERE { GRAPH <http://course.introlinkeddata.org/G4> {?bezirk rdf:type lodcom:Stadtteil . ?bezirk <http://www.w3.org/2000/01/rdf-schema#label> ?name . ?obs <http://purl.org/linked-data/cube#dataSet> lodcom:SingleHouseholdTotalCount . ?obs <http://vocab.lodcom.de/numberOfHouseholds> ?num . ?obs lodcom:refArea ?bezirk . ?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/2013-01-01T00:00:00/P1Y> . ?obs <http://purl.org/linked-data/sdmx/2009/measure#obsValue> ?n }}";

$('#map_tab').on('click', function(){
    showMap();
    hideDocumentation();
});

$('#y2011').on('click', function(){
    year(2011);
});
$('#y2012').on('click', function(){
    year(2012);
});
$('#y2013').on('click', function(){
    year(2013);
});
$('#y2014').on('click', function(){
    year(2014);
});

var currentYear = 2011;

var showThis = "Stadtteil";
map.on('zoomend', function () {
    console.log(map.getZoom());
    if (map.getZoom() >= 12){
        if(showThis == "Stadtbezirk") {
            showThis = "Stadtteil";
            year(currentYear);
        }
    } else {
        if(showThis == "Stadtteil") {
            showThis = "Stadtbezirk";
            year(currentYear);
        }
    }
});

function year(y) {
    var qry = "PREFIX afn: <http://jena.hpl.hp.com/ARQ/function#> PREFIX fn: <http://www.w3.org/2005/xpath-functions#> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX geof: <http://www.opengis.net/def/function/geosparql/> PREFIX gml: <http://www.opengis.net/ont/gml#> PREFIX owl: <http://www.w3.org/2002/07/owl#> PREFIX par: <http://parliament.semwebcentral.org/parliament#> PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> PREFIX sf: <http://www.opengis.net/ont/sf#> PREFIX time: <http://www.w3.org/2006/time#> PREFIX units: <http://www.opengis.net/def/uom/OGC/1.0/> PREFIX xsd: <http://www.w3.org/2001/XMLSchema#> PREFIX lodcom: <http://vocab.lodcom.de/> SELECT ?name ?n ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> {?bezirk rdf:type lodcom:"+showThis+" . ?bezirk <http://www.w3.org/2000/01/rdf-schema#label> ?name . ?obs <http://purl.org/linked-data/cube#dataSet> lodcom:SingleHouseholdTotalCount . ?obs <http://vocab.lodcom.de/numberOfHouseholds> ?num . ?obs lodcom:refArea ?bezirk . ?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+y+"-01-01T00:00:00/P1Y> . ?obs <http://purl.org/linked-data/sdmx/2009/measure#obsValue> ?n . ?bezirk geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt }}";
    $.post("http://giv-lodumdata.uni-muenster.de:8282/parliament/sparql", {
        query: qry,
        output: 'json'
    },
    function(data){
        // console.log(data);
        processBindings(data);
    });
    currentYear = y;
}

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

function processBindings(data) {
    map.removeLayer(featureGroup);
    featureGroup = L.featureGroup();
    var mm = minmax(data);    
    var colorScale = chroma.scale(chroma.brewer.OrRd).domain(mm, 'log');
    for(var i in data.results.bindings) {
        var colorcode = colorScale( parseInt(data.results.bindings[i].n.value) ).hex();
        var poly = addWktToMap(data.results.bindings[i].wkt.value, data.results.bindings[i].name.value, data.results.bindings[i].n.value, colorcode);
        // console.log(data.results.bindings[i].name.value)
        featureGroup.addLayer(poly);
    }
    featureGroup.addTo(map);
    addHeaderToSideBar();
}

function addWktToMap(wktstring, name, population, col) {
    //console.log(wktstring, name, population, col);
    //console.log(name);
    wkt.read(wktstring);
    //var rgb = "rgb("+Math.floor((Math.random()*255))+","+Math.floor((Math.random()*255))+","+Math.floor((Math.random()*255))+")"; // random colour
    //colourScale(Math.floor(Math.random()*255))
    var districtObj = wkt.toObject({
        color: col,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.9
    });

    var other = '<br><img src="dummygraph.jpg">';

    // districtObj.bindPopup("<b>"+name+"</b><br>"+population+" households<br>"+other);

    bindMouseEvents(districtObj, name, population);


    return districtObj;
}

function addHeaderToSideBar() {
    $("#stat").append('<p>Statistics</p>')
}

function bindMouseEvents(districtObj, name, population) {
    districtObj.on('mouseover', createMouseOverHandler(name, population));
    districtObj.on('mouseout', mouseOutHandler);
    districtObj.on('click', createClickHandler(name, population));
    districtObj.on('click', findParent(name));

    function createMouseOverHandler(name, population) {
        return function (e) {
            var layer = e.target;
            layer.setStyle({
                weight: 5,
                dashArray: '',
                fillOpacity: 0.7
            });
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
            // info.update(name, population);
        }
    }

    function mouseOutHandler(e) {
        var layer = e.target;
        layer.setStyle({
            weight: 0.2,
            opacity: 1,
            fillOpacity: 0.9
        });
        // info.update();
    }

    // function findParent(name) {
    //     return function(e) {
    //         var qryParent = "PREFIX lodcom: <http://vocab.lodcom.de/> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#> PREFIX qb:    <http://purl.org/linked-data/cube#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?name ?n ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> { lodcom:"+name.toLowerCase()+" lodcom:upperAdministrativeLevel ?parent. ?parent rdfs:label ?name. ?obs lodcom:refArea ?parent . ?obs qb:dataSet lodcom:SingleHouseholdTotalCount . ?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y> . ?obs sdmx-measure:obsValue ?n . ?parent geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt.}}";
    //         $.post("http://giv-lodumdata.uni-muenster.de:8282/parliament/sparql", {
    //             query: qryParent,
    //             output: 'json'
    //         },
    //         function(data){
    //             console.log(data.results.bindings)
    //         });
    //     }
    // }

    function findParent(name) {
        var qryParent = "PREFIX lodcom: <http://vocab.lodcom.de/> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#> PREFIX qb:    <http://purl.org/linked-data/cube#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?name ?n ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> { lodcom:"+name.toLowerCase()+" lodcom:upperAdministrativeLevel ?parent. ?parent rdfs:label ?name. ?obs lodcom:refArea ?parent . ?obs qb:dataSet lodcom:SingleHouseholdTotalCount . ?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y> . ?obs sdmx-measure:obsValue ?n . ?parent geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt.}}";
        function func(data) {
            console.log(data.results.bindings)
        }
        postQuerry(qryParent, func)
    }
    
    // var qry = "PREFIX lodcom: <http://vocab.lodcom.de/> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#> PREFIX qb:    <http://purl.org/linked-data/cube#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?name ?n ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> { lodcom:"+name.toLowerCase()+" lodcom:touches ?neighbor. ?neighbor rdfs:label ?name. ?obs lodcom:refArea ?neighbor . ?obs qb:dataSet lodcom:"+category+" . ?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y> . ?obs sdmx-measure:obsValue ?n . ?neighbor geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt.}}";
    
    function createClickHandler(name, population) {
        return function(e) {
            var qryNeighbor = "PREFIX lodcom: <http://vocab.lodcom.de/> PREFIX geo: <http://www.opengis.net/ont/geosparql#> PREFIX sdmx-measure: <http://purl.org/linked-data/sdmx/2009/measure#> PREFIX qb: <http://purl.org/linked-data/cube#> PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> SELECT ?name ?n ?wkt WHERE { GRAPH <http://course.introlinkeddata.org/G4> { lodcom:"+name.toLowerCase()+" lodcom:touches ?neighbor. ?neighbor rdfs:label ?name. ?obs lodcom:refArea ?neighbor . ?obs qb:dataSet lodcom:SingleHouseholdTotalCount . ?obs lodcom:refPeriod <http://reference.data.gov.uk/id/gregorian-interval/"+currentYear+"-01-01T00:00:00/P1Y> . ?obs sdmx-measure:obsValue ?n . ?neighbor geo:hasGeometry ?geometry . ?geometry geo:asWKT ?wkt.}}";
            $.post("http://giv-lodumdata.uni-muenster.de:8282/parliament/sparql", {
                query: qryNeighbor,
                output: 'json'
            },
            function(data){
                var chartLegend = [];
                chartLegend.push({y:parseInt(population), label:name})
                for(var i in data.results.bindings) {
                    var barChart = {};
                    // info.stat();
                    addChartDiv();
                    barChart.y = parseInt(data.results.bindings[i].n.value);
                    barChart.label = data.results.bindings[i].name.value
                    chartLegend.push(barChart);
                }
                createChart(chartLegend);
            });
            // findParent(name);

            function addChartDiv() {
                $("#stat").append('<div id="chartContainer"></div>')
            }

            function createChart(chartLegend) {
                var chart = new CanvasJS.Chart("chartContainer", {
                    title:{
                        text:"Neighbor districts households " + currentYear
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
                        interlacedColor: "rgba(1,77,101,.2)",
                        gridColor: "rgba(1,77,101,.1)"
                    },
                    data: [
                    {     
                        type: "bar",
                        name: "households",
                        axisYType: "secondary",
                        color: "#014D65",               
                        dataPoints: chartLegend
                    }]
                });
                chart.render();
            }
        }
    }
}

year(2011);


    function postQuerry(qry, func) {
        return function(e) {
            $.post("http://giv-lodumdata.uni-muenster.de:8282/parliament/sparql", {
                query: qry,
                output: 'json'
            },
            function(data){
                func;
            });
        }
    }

// var info = L.control();
// var stat = document.getElementById("stat");

// info.onAdd = function (map) {
//     this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
//     this.update();
//     return this._div;
// };

// info.update = function (name, pop) {
//     if (name){
//         this._div.innerHTML = '<h4>Households</h4>' + '<b>' + name + '</b><br />' + pop + ' households';
//     }
//     else {
//         this._div.innerHTML = '<h4>Households</h4>' + 'Hover over a polygon to see number of households.'+'<br />'+'Click to see stats for neighbors.';
//     }
// };

// info.stat = function () {
//         this._div.innerHTML = this._div.innerHTML + '<div id="chartContainer"></div>' //add chart to div
// };



// info.addTo(map);














