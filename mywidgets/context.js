function make_context(parent, x, y, w, h, opts) {

    var l = opts["left"] || 20;
    var r = opts["right"] || 20;
    var t = opts["top"] || 20;
    var b = opts["bottom"] || 20;

    var data = opts["data"] || {};

    var group = parent.append("g")
                      .attr("class", "context")
                      .attr("transform", "translate(" + (x+l) + ", " + (y+h-b) + " ) scale(1, -1)");

    var xaxis = group.append("line")
                      .attr("class", "axis")
                      .attr("x1", 0)
                      .attr("y1", 0)
                      .attr("x2", w-l)
                      .attr("y2", 0);

    var yaxis = group.append("line")
                      .attr("class", "axis")
                      .attr("x1", 0)
                      .attr("y1", 0)
                      .attr("x2", 0)
                      .attr("y2", h-b );

    var x_scale = d3.scale.linear()
                    .domain(d3.extent(data, function (d) { return d.x; }))
                    .range([0, w-l-r]);

    var y_scale = d3.scale.linear()
                    .domain(d3.extent(data, function (d) { return d.y; }))
                    .range([0, h-t-b]);

    var line = d3.svg.line()
                .x(function (d) { return x_scale(d.x); })
                .y(function (d) { return y_scale(d.y); });

    var path = group.append("path")
                    .attr("class", "plot")
                    .attr("d", line(data));

    return group;
}
