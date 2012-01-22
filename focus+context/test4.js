function create_time_series(ystart) {
    var start = new Date(1990, 0, 1);
    var year = 1000 * 60 * 60 * 24 * 365;
    var data = d3.range(0, 20, .02).map(function(x) {
        return {
            x: new Date(start.getTime() + year * x),
            y: (ystart + .1 * (Math.sin(x * 2 * Math.PI))
                + Math.random() * .1) * Math.pow(1.18, x)
                + Math.random() * .1};
    });
    var end = data[data.length - 1].x;
    return data;
}
var s1 = create_time_series(1);
var s2 = create_time_series(2);
var s3 = create_time_series(3);

opts = {
    data: [s1, s2],
    height: 300,
    width: 600,
    x: 30, y: 20,
    base_el: '#graph2',
    context: {
        height: 0.2,
        margin: {bottom: 20},
        xaxis: {label: function f(d) {return d3.time.format("%Y")(new Date(d))}},
        yaxis: {show_labels: false}
    },
    focus: {
        margin: {bottom: 20},
        ymin : 0,
        xaxis: {ticks: 5,
            label: function f(d) {return d3.time.format("%m/%y")(new Date(d))}},
    }
};

var graph2 = new OML.focusContext(opts);
function on_line2_2() {
    graph2.update([s1, s2]);
}
function on_line3_2() {
    graph2.update([s1, s2, s3]);
}
