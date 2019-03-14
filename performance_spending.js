/**
 * Call our functions on window load event
 */
window.onload = function(){
    setup();
};

/**
 * object to keep track of our magic numbers for margins
 * @type {{top: number, left: number, bottom: number, right: number}}
 */
const MARGINS = {top: 10, right: 10, bottom: 60, left: 60};

var mainVis = function(){

};

/**
 * Global variables
 */
var mainData;               // our visualization
/**
 * Function setup: sets up our visualization environment.
 * You can change the code to not have static paths and elementID's
 */
function createHexagons(size){

}
let svgCanvas;
let mainCircle;
let outerCircle;
function setupCanvas(){
    svgCanvas = d3.select("#vis")
        .attr("width", 1000)
        .attr("height", 1000);



    var mainCircle = svgCanvas.append("circle")
        .attr("id", "ball")
        .attr("cx", 575)
        .attr("cy", 375)
        .attr("r", 350)
        .attr("stroke", "#38003c")
        .attr("stroke-width", "10")
        .attr("fill", "#ffffff");

    outerCircle = svgCanvas.append("circle")
        .attr("id", "filter")
        .attr("cx", 575)
        .attr("cy", 375)
        .attr("r", 500)
        .attr("stroke", "#38003c")
        .attr("stroke-width", "2")
        .attr("stroke-dasharray","2")
        .attr("fill", "none");
}

//create scale for the radius of hexagons
var currentX = 10;
var currentY = 10;
function setupHexagons(data){

    let sizeScale = d3.scalePow()
        .exponent(2)
        .domain([0, d3.max(data, function(d) { return parseInt(d.averagepoints); })])
        .range([5, 100]);

    data.forEach(function(row){
        currentX += 25;
        currentY += 25;
        let height = (Math.sqrt(3)/2);
        let radius = sizeScale(row.averagepoints);
        let xPoint = currentX;
        let yPoint = currentY;
        hexData = [
            {"xval": radius+xPoint , "yval": yPoint },
            {"xval": radius/2+xPoint, "yval": radius*height+yPoint },
            {"xval": -radius/2+xPoint, "yval": radius*height+yPoint },
            {"xval": -radius+xPoint , "yval": yPoint },
            {"xval": -radius/2+xPoint, "yval": -radius*height+yPoint},
            {"xval": radius/2+xPoint, "yval": -radius*height+yPoint },
        ];
        // hexagons.push(data)
       let drawHexagon = d3.line().x(function(d) {return d.xval;}).y(function(d) {return d.yval;});

       let drawHexagonTest =
           svgCanvas.append("path")
               .attr("d", drawHexagon(hexData))

    });
}

function calculateScaledPoints(hex, sizeScale){
    console.log(hex.points);



    let height = (Math.sqrt(3)/2);
    let radius = sizeScale(hex.averagepoints);
    console.log(hex.averagepoints + "averagepoints of " + hex.name);
    let xPoint = hex.x +200 ;
    let yPoint = hex.y +90;
    console.log("radius", radius);

    hex.topleftx = radius/2+xPoint - radius;
    hex.toplefty = -radius*height+yPoint + radius/4 - height;

    let newPoint = "";
    newPoint += parseInt(radius+xPoint)+","+parseInt(yPoint);
    newPoint += " "+parseInt(radius/2+xPoint)+","+parseInt(radius*height+yPoint);
    newPoint += " "+parseInt(-radius/2+xPoint)+","+parseInt(radius*height+yPoint);
    newPoint += " "+parseInt(-radius+xPoint)+","+parseInt(yPoint);
    newPoint += " "+parseInt(-radius/2+xPoint)+","+parseInt(-radius*height+yPoint);
    newPoint += " "+parseInt(radius/2+xPoint)+","+parseInt(-radius*height+yPoint);

    console.log("hex points original", hex.points);
    console.log("new scaled", newPoint);
    hex.radius = radius;
    hex.points = newPoint;

}

function drawRectangles(hexjson){
    let teams = hexjson.hexes;
    //magic numbers of circle x and y
    let currentRotateX = 575;
    let currentRotateY = 375;

    for (let i in teams){
        //magic numbers: 49 = number of teams
        //magic numbers: 500 = radius of outer circle
        //width and height randomly set
        let angle = ((i/(49/2)) * Math.PI);
        let elementX= 575 + ((500)*Math.sin(angle));
        console.log(elementX);
        let elementY = 375 + ((500) * Math.cos(angle));
        svgCanvas.append("rect")
            .attr("x", elementX)
            .attr("y", elementY)
            .attr("width", 40)
            .attr("height", 20)
            .attr("stroke", "#38003c")
            .attr("stroke-width", "2")
            .attr("fill", "green")

        currentRotateY += 10;
        currentRotateX += 100;
    }
}


function setup(){
    //read in the soccer plater csv data
    d3.csv("stats_and_expenses.csv").then(function(data){
        //console.log(data);
        //setup a main parent which will wrap all this data, in order to use stratify for a flat pack layout

        //push into the hierarchy



        setupCanvas();
        //
        // setupHexagons(data);
        d3.json("test2.hexjson").then(function(hexjson){
            console.log(hexjson);
            console.log(data);
            // Set the size and margins of the svg
            var margin = {top: 10, right: 10, bottom: 10, left: 10},
                width = 750 - margin.left - margin.right,
                height = 750 - margin.top - margin.bottom;
            // Create the svg element
            var svg = d3
                .select("#vis")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .attr("overflow", "visible")
                .append("g");




            // Render the hexes
            var hexes = d3.renderHexJSON(hexjson, width, height);

            // Bind the hexes to g elements of the svg and position them
            var hexmap = svg
                .selectAll("g")
                .data(hexes)
                .enter()
                .append("g")
                .attr("transform", function(hex) {
                    return "translate(" + 0 + "," + 20 + ")";
                });

            let sizeScale = d3.scalePow()
                .exponent(2)
                .domain([0, d3.max(data, function(d) { return parseInt(d.averagepoints); })])
                .range([3, 60]);

            //color scale code modified from Tutorial 5 sample template
            let colorScale = d3.scaleQuantize()
                .domain([0, d3.max(data, function(d) { return parseInt(d.averagepoints); })])
                .range(["#e90052", "#EAFF04",  "#00ff85" ]);

            // Draw the polygons around each hex's centre
            hexmap
                .append("polygon")
                .attr("points", function(hex) {calculateScaledPoints(hex, sizeScale); return hex.points;})
                .attr("stroke", "#38003c")
                .attr("stroke-width", "2")
                .attr("fill", function(hex) {return colorScale(hex.averagepoints);})
                .attr("fill-opacity", 0.9);




            hexmap.append("svg:image")
                .attr("width",function(hex) {return hex.radius})
                // .attr("height",200)
                .attr('x', function(hex) {return hex.topleftx})
                .attr('y', function(hex) {return hex.toplefty})
                .attr("xlink:href", function(hex) {
                    return "./images/" + hex.name + ".svg";
                });


            drawRectangles(hexjson);

        });
    });

}
