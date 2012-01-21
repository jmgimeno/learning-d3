var w   = 960 // bl.ocks.org viewport width
    , h   = 500 // bl.ocks.org viewport height
    , cw  = 8 // cellWidth
    , ch  = 8 // cellHeight
    , m   = false // toggle mode on mousedown/mouseup
    , ccx = w/cw // cell count x
    , ccy = h/ch // cell count y
    , del = 100  // ms between generations
    , xs  = d3.scale.linear().domain([0, ccx]).rangeRound([0, ccx * cw])
    , ys  = d3.scale.linear().domain([0, ccy]).rangeRound([0, ccy * ch])
    , states = []
    ;

d3.range(ccx * ccy).forEach(function(c) {
    states[c] = Math.random() > .8;
});

var vis = d3.select('body').append('svg')
    .attr('width', w)
    .attr('height', h);

vis.selectAll('rect')
    .data(states)
    .enter().append('rect')
    .attr('width', cw)
    .attr('height', ch)
    .attr('x', function(d, i) { return xs(i % ccx); })
    .attr('y', function(d, i) { return ys(i / ccx | 0); })
    .on('mouseup', function() { m = false; })
    .on('mousedown', function() { m = true; })
    .on('mousemove', function(d, i) { if (m) states[i] = !states[i]; })
    .classed('life', function(d) { return d; });

function createNewGeneration() {
    var c, x, y, t, r, b, l, n, nextState = [];
    for (x = 0; x < ccx; x++) {
        l = x - 1;
        r = x + 1;
        for (y = 0; y < ccy; y++) {
            t = y - 1;
            b = y + 1;
            n = states[coord(l,t)] + states[coord(x,t)] + states[coord(r,t)]
                + states[coord(l,y)] +                      states[coord(r,y)]
                + states[coord(l,b)] + states[coord(x,b)] + states[coord(r,b)];

            nextState[c = coord(x,y)] = states[c] ? n == 2 || n == 3 : n == 3;
        }
    }
    return nextState;
}

function coord(x, y) {
    return coord[x +','+ y] ||
        (coord[x +','+ y] = ccx * ((ccy + y) % ccy) + ((ccx + x) % ccx));
}

function animate() {
    d3.selectAll('rect')
        .data(states = createNewGeneration())
        .classed('life', function(d) { return d; });
}

//setInterval(animate, del);

d3.timer(animate);