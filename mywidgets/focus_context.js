// Inspired by https://gist.github.com/917479

function focus_context (options) {

    options = options || {};
    
    var x = options.x = options.x || 0;
    var y = options.y = options.y || 0;
    var width  = options.width  = options.width || 400;
    var height = options.height = options.height || 300;

    var gap = options.gap = options.gap || 10;
    var limit = options.limit = options.limit || 10;

    var foptions = options.foptions = options.foptions || {};
    var coptions = options.coptions = options.coptions || {};
    var soptions = options.soptions = options.soptions || {};

    var fratio = foptions.ratio;
    var cratio = coptions.ratio;
    if (fratio && !cratio) cratio = 1.0 - fratio;
    if (!fratio && cratio) fratio = 1.0 - cratio;
    if (!fratio && !cratio) { cratio = 0.3; fratio = 0.7; }
    foptions.height = (height - gap - limit) * fratio;
    coptions.height = (height - gap - limit) * cratio;
    foptions.width  = coptions.width  = width;
    coptions.y = height - coptions.height - limit;

    var data = options.data = foptions.data = coptions.data = options.data || {};

    var klass = options.klass = options.klass || "diagram";

    var diagram = make_svg_container(options, klass);

    foptions.parent = foptions.parent || diagram;
    coptions.parent = coptions.parent || diagram;
    soptions.parent = soptions.parent || diagram;

    foptions.left   = coptions.left   = options.left   || 20;
    foptions.right  = coptions.right  = options.right  ||  0;
    foptions.top    = coptions.top    = options.top    ||  0;
    foptions.bottom = coptions.bottom = options.bottom || 20;

    var callback = options.callback = options.callback || nop;

    var focus = make_plot(foptions);
    focus.update(data);

    var context = make_plot(coptions);
    context.update(data);

    soptions.limit = limit;
    soptions.x = coptions.left;
    soptions.y = coptions.y + coptions.top;
    soptions.width  = coptions.width - coptions.right - coptions.left;
    soptions.height = coptions.height - coptions.top;

    soptions.callback = function(left, right) {
        var selected = data.filter(function (d) {
            return left <= d.x && d.x <= right;
        });
        focus.update(selected);
        callback(left, right);
    }

    var selector = make_selector(soptions);

}

function make_plot(options) {

    var x = options.x = options.x || 0;
    var y = options.y = options.y || 0;

    var width  = options.width  = options.width  || 400;
    var height = options.height = options.height || 300;

    var left   = options.left   = options.left   || 20;
    var right  = options.right  = options.right  ||  0;
    var top    = options.top    = options.top    ||  0;
    var bottom = options.bottom = options.bottom || 20;

    var xaxis  = options.xaxis = options.xaxis || {};
    var yaxis  = options.yaxis = options.yaxis || {};

    var xticks = xaxis.ticks = xaxis.ticks || 5;
    var yticks = yaxis.ticks = yaxis.ticks || 5;

    var xticklength = xaxis.ticklength = xaxis.ticklength || 5;
    var yticklength = yaxis.ticklength = yaxis.ticklength || 5;

    var xlabel = xaxis.label;
    var ylabel = yaxis.label;

    var klass = options.klass = options.klass || "plot";

    var plot = make_svg_container(options)
        .append("g")
        .attr("transform", "translate(" + (left) + ", " + (height - bottom) + " ) scale(1, -1)  ");

    plot.append("line")
        .attr("class", "axis")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width - left)
        .attr("y2", 0);

    plot.append("line")
        .attr("class", "axis")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height - bottom);

    plot.append("path")
        .attr("class", "plot");

    function update_xticks(xscale) {
        var ticks = plot.selectAll(".xtick")
            .data(xscale.ticks(xticks));

        ticks.enter().append("line")
            .attr("class", "xtick")
            .attr("x1", xscale)
            .attr("y1", 0)
            .attr("x2", xscale)
            .attr("y2", -xticklength);

        ticks.attr("x1", xscale)
            .attr("x2", xscale);

        ticks.exit().remove();
    }

    function update_yticks(yscale) {
        var ticks = plot.selectAll(".ytick")
            .data(yscale.ticks(yticks));

        ticks.enter().append("line")
            .attr("class", "ytick")
            .attr("x1", 0)
            .attr("y1", yscale)
            .attr("x2", -yticklength)
            .attr("y2", yscale);

        ticks.attr("y1", yscale)
            .attr("y2", yscale);

        ticks.exit().remove();
    }

    function update_xlabels(xscale) {
        var xlabels = plot.selectAll(".xlabel")
            .data(xscale.ticks(xticks));

        xlabels.enter().append("text")
            .attr("class", "xlabel")
            .text(xlabel)
            .attr("x", xscale)
            .attr("y", xticklength+2)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "text-before-edge")
            .attr("transform", "scale(1, -1)");

        xlabels.text(xlabel)
            .attr("x", xscale);

        xlabels.exit().remove();
    }

    function update_ylabels(yscale) {
        var ylabels = plot.selectAll(".ylabel")
            .data(yscale.ticks(yticks));

        ylabels.enter().append("text")
            .attr("class", "ylabel")
            .text(ylabel)
            .attr("x", -(yticklength+2))
            .attr("y", negate(yscale))
            .attr("text-anchor", "end")
            .attr("dominant-baseline", "central")
            .attr("transform", "scale(1, -1)");

        ylabels.text(ylabel)
            .attr("y", function (d) { return -yscale(d); });

        ylabels.exit().remove();
    }

    function update(data) {

        var x_scale = d3.scale.linear()
            .domain(d3.extent(data, getter("x")))
            .range([0, width - left - right]);

        var y_scale = d3.scale.linear()
            .domain(d3.extent(data, getter("y")))
            .range([0, height - top - bottom]);

        var line = d3.svg.line()
            .x(distribute(getter("x"), x_scale))
            .y(distribute(getter("y"), y_scale));

        var path = plot.select("path")
            .attr("d", line(data));

        if (xlabel) {
            update_xticks(x_scale);
            update_xlabels(x_scale);
        }
        if (ylabel) {
            update_yticks(y_scale);
            update_ylabels(y_scale);
        }
    }

    return {
        update: update,
        node: plot
    };
}

function make_selector(options) {

    var x = options.x = options.x || 0;
    var y = options.y = options.y || 0;

    var width  = options.width  = options.width  || 400;
    var height = options.height = options.height || 300;

    var limit = options.limit = options.limit || 10;

    var klass = options.klass = options.klass || "selector";

    var convert = options.range
        ? d3.scale.linear().domain([x, x + width]).range(options.range)
        : identity;

    var callback = distribute(convert, options.callback || nop);

    var parent = options.parent
                ? d3.select(options.parent)
                : make_svg_container(options);

    var selector = parent.append("g")
        .attr("x", x)
        .attr("width", width)
        .attr("class", klass);

    var selection = make_selection(selector, x, y, width, height,
        function(l, r) {
            left.move(left.node, l);
            right.move(right.node, r);
            callback(l, r);
        });

    var left = make_limit(selector, x, y+height, limit,
        function () {
            return x;
        },
        function () {
            var x = parseInt(selection.attr("x")),
                w = parseInt(selection.attr("width"));
            return x + w - limit/2;
        },
        function (l, diff) {
            var w = parseInt(selection.attr("width"));
            selection.attr("x", l);
            selection.attr("width", w - diff);
            callback(l, l + w - diff);
        });

    var right = make_limit(selector, x+width, y+height, limit,
        function () {
            var x = parseInt(selection.attr("x"));
            return x + limit/2;
        },
        function () {
            return x + width;
        },
        function (r, diff) {
            var x = parseInt(selection.attr("x")),
                w = parseInt(selection.attr("width"));
            selection.attr("width", w + diff);
            callback(x, x + w);
        });

    callback(x, x + width);

    return selector;
}

function make_selection(parent, x, y, w, h, callback) {

    function dragmove() {
        var newx = parseInt(d3.select(this).attr("x")) + d3.event.dx,
            neww = parseInt(d3.select(this).attr("width"));
        if ( x <= newx && (newx + neww) <=  (x + w)) {
            d3.select(this).attr("x", newx);
            callback(newx, newx + neww);
        }
    }

    return parent.append("rect")
        .attr("class", "selection")
        .attr("x", x)
        .attr("y", y)
        .attr("width", w)
        .attr("height", h)
        .attr("pointer-events", "all")
        .call(d3.behavior.drag().on("drag", dragmove));
}

function make_limit(parent, x, y, limit, minf, maxf, callback) {

    function make_triangle_points() {
        return [x,y, x-limit/2,y+limit, x+limit/2,y+limit].join(" ");
    }

    function dragmove() {
        var newx = x + d3.event.dx;
        var minx = minf();
        var maxx = maxf();
        if ( minx <= newx && newx <= maxx ) {
            move(d3.select(this), newx);
            if (callback) { callback(newx, d3.event.dx); }
        }
    }

    function move(element, newx) {
        x = newx;
        element.attr("points", make_triangle_points());
    }

    return {
        move: move,
        node: parent.append("polygon")
            .attr("class", "limit")
            .attr("points", make_triangle_points())
            .attr("pointer-events", "all")
            .call(d3.behavior.drag().on("drag", dragmove))
    };
}


function make_svg_container(options) {
    var parent = options.parent || "body";

    if (typeof(parent) === "string") {
        parent = d3.select(parent);
    }

    var container = parent.append("svg")
        .attr("width", options.width)
        .attr("height", options.height)
        .attr("x", options.x)
        .style("margin-left", options.x + "px")
        .attr("y", options.y)
        .style("margin-top", options.y + "px");

    if (options.id) {
        container.attr("id", options.id);
    }

    if (options.klass) {
        container.attr("class", options.klass);
    }

    return container;
}

// Functional helpers

function distribute(innerf, outerf) {
    return function () {
        var args = Array.prototype.slice.call(arguments);
        return outerf.apply(null, args.map(innerf));
    };
}

function nop() { }

function identity(d) { return d; }

function negate(f) {
    return function() {
        var args = Array.prototype.slice.call(arguments);
        return -f.apply(null,args);
    }
}

function getter(prop) {
    return function (d) {
        return d[prop];
    }
}