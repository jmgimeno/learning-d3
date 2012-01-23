function make_selector(parent, x, y, w, h, opts) {

    var b = opts["b"] || 10;
    var transform = function(t, f) { return function(l, r) { return f(t(l), t(r)); }} ;
    var convert = opts["range"]
                    ? d3.scale.linear().domain([x, x + w]).range(opts["range"])
                    : function(f) { return f; };

    var callback = transform(convert, opts["callback"] || function (l, r) {});

    var group = parent.append("g");

    var selection = make_selection(group, x, y, w, h,
        function(l, r) {
            left.move(left.node, l);
            right.move(right.node, r);
            callback(l, r);
        });

    var left = make_limit(group, x, y+h, b,
        function () {
            return x;
        },
        function () {
            var x = parseInt(selection.attr("x")),
                w = parseInt(selection.attr("width"));
            return x + w - b/2;
        },
        function (l, diff) {
            var w = parseInt(selection.attr("width"));
            selection.attr("x", l);
            selection.attr("width", w - diff);
            callback(l, l + w - diff);
        });

    var right = make_limit(group, x+w, y+h, b,
        function () {
            var x = parseInt(selection.attr("x"));
            return x + b/2;
        },
        function () {
            return x + w;
        },
        function (r, diff) {
            var x = parseInt(selection.attr("x")),
                w = parseInt(selection.attr("width"));
            selection.attr("width", w + diff);
            callback(x, x + w);
        });

    callback(x, x + w);

    return group;
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

function make_limit(parent, x, y, b, minf, maxf, callback) {

    function make_triangle_points() {
        return [x,y, x-b/2,y+b, x+b/2,y+b].join(" ");
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