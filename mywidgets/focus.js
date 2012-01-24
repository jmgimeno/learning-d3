function make_focus(parent, x, y, w, h, opts) {

    var l = opts["left"] || 20;
    var r = opts["right"] || 20;
    var t = opts["top"] || 20;
    var b = opts["bottom"] || 20;

    var group = parent.append("g")
        .attr("class", "focus")
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

    group.append("path").attr("class", "plot");

    function date_format(d) {
        return d3.time.format("%m-%y")(new Date(d));
    }

    function update_xticks(xscale) {
        var xticks = group.selectAll(".xtick")
                          .data(xscale.ticks(5));

        xticks.enter().append("line")
            .attr("class", "xtick")
            .attr("x1", xscale)
            .attr("y1", 0)
            .attr("x2", xscale)
            .attr("y2", -5);

        xticks.attr("x1", xscale)
              .attr("x2", xscale);

        xticks.exit().remove();
    }

    function update_yticks(yscale) {
        var yticks = group.selectAll(".ytick")
            .data(yscale.ticks(5));

        yticks.enter().append("line")
            .attr("class", "ytick")
            .attr("x1", 0)
            .attr("y1", yscale)
            .attr("x2", -5)
            .attr("y2", yscale);

        yticks.attr("y1", yscale)
            .attr("y2", yscale);

        yticks.exit().remove();
    }

    function update_xlabels(xscale) {
        var xlabels = group.selectAll(".xlabel")
                           .data(xscale.ticks(5));

        xlabels.enter().append("text")
            .attr("class", "xlabel")
            .text(date_format)
            .attr("x", xscale)
            .attr("y", 7)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "text-before-edge")
            .attr("transform", "scale(1, -1)");

        xlabels.text(date_format)
               .attr("x", xscale);

        xlabels.exit().remove();

    }

    function update_ylabels(yscale) {
        var ylabels = group.selectAll(".ylabel")
            .data(yscale.ticks(5));

        ylabels.enter().append("text")
            .attr("class", "ylabel")
            .text(String)
            .attr("x", -7)
            .attr("y", function (d) { return -yscale(d); })
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "central")
            .attr("transform", "scale(1, -1)");

        ylabels.text(String)
            .attr("y", function (d) { return -yscale(d); });

        ylabels.exit().remove();

    }

    function update(data) {

        var x_scale = d3.scale.linear()
                        .domain(d3.extent(data, function (d) { return d.x; }))
                        .range([0, w-l-r]);

        var y_scale = d3.scale.linear()
                        .domain(d3.extent(data, function (d) { return d.y; }))
                        .range([0, h-t-b]);

        var line = d3.svg.line()
                        .x(function (d) { return x_scale(d.x); })
                        .y(function (d) { return y_scale(d.y); });

        var path = group.select("path")
                        .attr("d", line(data));

        update_xticks(x_scale);
        update_xlabels(x_scale);
        update_yticks(y_scale);
        update_ylabels(y_scale);
    }

    return {
        update: update,
        node: group
    };
}
