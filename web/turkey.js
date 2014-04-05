TScatterplot = function(url) {
    this.__url = url;
    this.init();
};
TScatterplot.prototype.init = function(url) {

};
TScatterplot.prototype.onData = function(cb) {
    if (this.__data) { cb(); return; }
    var self = this;
    d3.csv(self.__url, function(data) {
        self.__data = data;
        cb();
    });
};
TScatterplot.prototype.render = function() {
    var self = this;

    var container = d3.select('body').append('div')
        .attr('class', 'scatter-container');
    var control = container.append('div')
        .attr('class', 'scatter-matrix-control');
    var svg = container.append('div')
        .attr('class', 'scatter-matrix-svg')
        .html('<em>Loading data...</em>');

    this.onData(function() {
        var data = self.__data;

        console.log(data);
//        var x_axis = d3.svg.axis();
//        var y_axis = d3.svg.axis();
//
//        // Draw X-axis
//        svg.selectAll("g.x.axis")
//            .data(x_variables)
//            .enter().append("svg:g")
//            .attr("class", "x axis")
//            .attr("transform", function(d, i) { return "translate(" + i * size + ",0)"; })
//            .each(function(d) { d3.select(this).call(x_axis.scale(x[d]).orient("bottom")); });
//
//        // Draw Y-axis
//        svg.selectAll("g.y.axis")
//            .data(y_variables)
//            .enter().append("svg:g")
//            .attr("class", "y axis")
//            .attr("transform", function(d, i) { return "translate(0," + i * size + ")"; })
//            .each(function(d) { d3.select(this).call(y_axis.scale(y[d]).orient("right")); });
//
//        // Draw scatter plot
//        var cell = svg.selectAll("g.cell")
//            .data(cross(x_variables, y_variables))
//            .enter().append("svg:g")
//            .attr("class", "cell")
//            .attr("transform", function(d) { return "translate(" + d.i * size + "," + d.j * size + ")"; })
//            .each(plot);
    });
};
