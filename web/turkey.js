TScatterplot = function() {
    this.init();
    this.getData();
};
TScatterplot.prototype.init = function() {
    this.queue = queue();
    this.color = d3.scale.category20();

    this.margin = {t:30, r:20, b:60, l:40 };
    this.w = 1200 - this.margin.l - this.margin.r;
    this.h = 2800 - this.margin.t - this.margin.b;

    this.svg = d3.select(".scatter-container").append("svg")
        .attr("width", this.w + this.margin.l + this.margin.r)
        .attr("height", this.h + this.margin.t + this.margin.b);

    this.x = d3.scale.linear().range([0, this.w]);
    this.y = d3.scale.linear().range([this.h - 60, 0]);
    this.x.domain([70, 110]);
    this.y.domain([-100, 105]);

    // group that will contain all of the plots
    this.groups = this.svg.append("g").attr("transform", "translate(" + this.margin.l + "," + this.margin.t + ")");

    //this.renderAxes();

};

TScatterplot.prototype.getData = function() {
    var self = this;
    $.getJSON('../data/cities.json', function(citiesResponse) {
        self.cities = citiesResponse;
        //self.cities = ['BURSA']

        self.promises = [];
        self.citiesData = {};

        var chartH = ((self.h - 60) / Math.ceil(self.cities.length / 3));
        var chartW = (self.w / 3);

        i = 0;
        _(self.cities).each(function(city) {
            //self.promises.push($.ajax('../data/city_results/' + city + '.json'))
            self.promises.push($.getJSON('../data/city_results/' + city + '.json', function(response) {
                var cityData = response;
                var size = {
                    h: chartH, w: chartW,
                    x: ((i % 3) * chartW),
                    y: (Math.floor(i / 3) * chartH)
                };
                i++;
                self.renderCity.call(self, cityData, cityData[0].il, size);
                self.citiesData[cityData[0].il] = cityData;
            }));
        });
        $.when.apply($, self.promises).done(function() {
            self.renderDigits();
            self.renderLegend();
        });
    });


};
TScatterplot.prototype.renderAxes = function(xScale, yScale, size) {
    // set axes, as well as details on their ticks
    var xScale = xScale || this.x,
        yScale = yScale || this.y,
        size = size || {
            w: this.w,
            h: this.h,
            x: 0,
            y: 0
        },
        xAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(5)
        .tickSubdivide(true)
        .tickSize(6, 3, 0)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(xScale)
        .ticks(5)
        .tickSubdivide(true)
        .tickSize(6, 3, 0)
        .orient("left");

    // draw axes and axis labels
//    this.svg.append("g")
//        .attr("class", "x axis")
//        .attr("transform", "translate(" + size.x + "," + (size.y) + ")")
//        .call(xAxis);
//
//    this.svg.append("g")
//        .attr("class", "y axis")
//        .attr("transform", "translate(" + size.x + "," + size.y + ")")
//        .call(yAxis);

    this.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "begin")
        .attr("x", size.x + 20)
        .attr("y", size.h)
        .text("% voter turnout");

    this.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("x", size.y - 40)
        .attr("y", size.x + 20)
        .attr("dy", ".75em")
        .attr("transform", "rotate(-90)")
        .text("% vote for AKP");



//    // draw axes and axis labels
//    this.svg.append("g")
//        .attr("class", "x axis")
//        .attr("transform", "translate(" + this.margin.l + "," + (this.h - 60 + this.margin.t) + ")")
//        .call(this.xAxis);
//
//    this.svg.append("g")
//        .attr("class", "y axis")
//        .attr("transform", "translate(" + this.margin.l + "," + this.margin.t + ")")
//        .call(this.yAxis);
//
//    this.svg.append("text")
//        .attr("class", "x label")
//        .attr("text-anchor", "end")
//        .attr("x", this.w + 50)
//        .attr("y", this.h - this.margin.t - 5)
//        .text("% voter turnout");
//
//    this.svg.append("text")
//        .attr("class", "y label")
//        .attr("text-anchor", "end")
//        .attr("x", -20)
//        .attr("y", 45)
//        .attr("dy", ".75em")
//        .attr("transform", "rotate(-90)")
//        .text("% vote for AKP");
};
TScatterplot.prototype.renderLegend = function() {
    // the legend color guide
    var self = this;
    var legend = this.svg.selectAll("rect")
        .data(this.cities)
        .enter().append("rect")
        .attr({
            x: function(d, i) {
                return ((40 + i*80) % self.w);
            },
            y: function(d, i) { return self.h + (Math.floor((40 + i*80) / self.w) * 18) ; } ,
            width: 25,
            height: 12
        })
        .style("fill", function(d) { return self.color(d); });


    // legend labels
    var legendLabels = this.svg.selectAll("text.legend-label")
        .data(this.cities)
        .enter().append("text")
        .attr('class', 'legend-label')
        .attr({
            x: function(d, i) { return (67 + i*80) % self.w; },
            y: function(d, i) { return self.h + 10 + (Math.floor((40 + i*80) / self.w) * 18); }
        })
        .text(function(d) { return d.charAt(0).toUpperCase() + d.slice(1).toLowerCase(); });
};

TScatterplot.prototype.renderCity = function(cityData, cityName, size) {
    // style the circles, set their locations based on data
    var self = this;
    var xScale = d3.scale.linear().range([size.x, size.x + size.w]);
    var yScale = d3.scale.linear().range([size.y, size.y + size.h]);
    xScale.domain([50, 120]);
    yScale.domain([-100, 100]);

    var circles = this.groups.selectAll("circle.circles"+cityData[0].il)
        .data(cityData)
        .enter().append("circle")
        .attr("class", "circles-"+cityData[0].il)
        .attr({
            //cx: function(d) { return x(d.kullanilan_toplam_oy / d.kayitli_secmen); },
            cx: function(d) {
                var x = xScale((d.oy_kullanan_kayitli_secmen / d.kayitli_secmen) * 100);
                if(_(x).isNaN() || !_(x).isFinite()) { return 0; }
                return x;
            },
            //cx: function(d) { return self.x((d.gecersiz_oy / d.kayitli_secmen) * 100); },
            //cx: function(d) { return self.x((d.kullanilan_toplam_oy / d.kayitli_secmen) * 100); },
            //cx: function(d) { return self.x((d.mhp_oy / d.kayitli_secmen) * 100); },
            //cy: function(d) { return self.y((d.akp_oy / d.kayitli_secmen) * 100); },
            cy: function(d) {
                var y = yScale((((d.akp_oy / d.kullanilan_toplam_oy) - (d.chp_oy / d.kullanilan_toplam_oy)) * 100));
                if(_(y).isNaN() || !_(y).isFinite()) { return 0; }
                return y;
            },
            //r: function(d) { return Math.max(d.gecersiz_oy / 10, 1); },
            r: function(d) { return (d.kayitli_secmen / 170) },
            //r: 2,
            opacity: 0.5,
            id: function(d) { return d.alan; }
        })
        .style("fill", function(d) { return self.color(d.il); });

    this.svg.append("text")
        .attr('class', 'city-label')
        .attr({
            x: size.x + 50,
            y: size.y + 60
        })
        .text(function(d) { return cityName.charAt(0).toUpperCase() + cityName.slice(1).toLowerCase(); });

    this.renderAxes(xScale, yScale, size);
};

TScatterplot.prototype.renderDigits = function() {
    var w = 1200,
        h = (this.cities.length * 10) + 20,
        firstSvg = d3.select(".digit-first").append("svg").attr({ width: w, height: h}),
        lastSvg = d3.select(".digit-last").append("svg").attr({ width: w, height: h}),
        last2Svg = d3.select(".digit-last-2").append("svg").attr({ width: w, height: h}),
        self = this;

    var citiesDigitCounts = [],
        i = 0;
    _(this.citiesData).each(function(cityData,cityName) {
        var maxFirstDigitCount = 0,
            maxLastDigitCount = 0,
            maxLast2DigitCount = 0,
            hundredZeros = _(_.range(0,100)).map(function() { return 0; }),
            cityDigitCounts = {
                city: cityName,
                firstDigitCounts: _(cityData).reduce(function(counts, d) {
                    //if(d.akp_oy == 0) { return counts; }
                    if(d.akp_oy < 2) { return counts; }
                    counts[(parseInt((d.akp_oy + '').slice(0,1)))] += 1;
                    maxFirstDigitCount = Math.max(maxFirstDigitCount, counts[(parseInt((d.akp_oy + '').slice(0)) % 10)]);
                    return counts;
                }, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),

                lastDigitCounts: _(cityData).reduce(function(counts, d) {
                    if(d.akp_oy == 0) { return counts; }
                    //if(d.akp_oy < 10) { return counts; }
                    counts[(parseInt((d.akp_oy + '').slice(-1)))] += 1;
                    maxLastDigitCount = Math.max(maxLastDigitCount, counts[(parseInt((d.akp_oy + '').slice(-1)))]);
                    return counts;
                }, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),

                last2DigitCounts: _(cityData).reduce(function(counts, d) {
                    if(d.akp_oy == 0) { return counts; }
                    //if(d.akp_oy < 10) { return counts; }
                    counts[(parseInt((d.akp_oy + '').slice(-2)))] += 1;
                    maxLast2DigitCount = Math.max(maxLast2DigitCount, counts[(parseInt((d.akp_oy + '').slice(-2)))]);
                    return counts;
                }, hundredZeros)
            };

        var interpolator = d3.interpolateLab('#ffffff', self.color(cityName)),
            firstDigitScale = d3.scale.linear().range([0, 1]).domain([0, maxFirstDigitCount]),
            lastDigitScale = d3.scale.linear().range([0, 1]).domain([0, maxLastDigitCount]),
            last2DigitScale = d3.scale.linear().range([0, 1]).domain([0, maxLast2DigitCount]);

        firstSvg.selectAll('rect.first-digits-' + cityName)
            .data(cityDigitCounts.firstDigitCounts)
            .enter().append('rect')
            .attr('class', 'first-digits-' + cityName)
            .attr({
                x: function(d, j) { return j * 30; },
                y: i * 10,
                width: 30,
                height: 10
            })
            .style('fill', function(d) { return interpolator(firstDigitScale(d)); });

        lastSvg.selectAll('rect.last-digits-' + cityName)
            .data(cityDigitCounts.lastDigitCounts)
            .enter().append('rect')
            .attr('class', 'last-digits-' + cityName)
            .attr({
                x: function(d, j) { return j * 30; },
                y: i * 10,
                width: 30,
                height: 10
            })
            .style('fill', function(d) { return interpolator(lastDigitScale(d)); });

        last2Svg.selectAll('rect.last-2-digits-' + cityName)
            .data(cityDigitCounts.last2DigitCounts)
            .enter().append('rect')
            .attr('class', 'last-2-digits-' + cityName)
            .attr({
                x: function(d, j) { return j * 10; },
                y: (i * 10),
                width: 10,
                height: 10
            })
            .style('fill', function(d) { return interpolator(last2DigitScale(d)); });

        i++;
    });
};