// SFC State Topology — D3
// Available: container, data, theme, width, height, d3
//
// data = TDataFrame: fields[0].values[0] is JSON.stringify(TopologyDto)
// TopologyDto: { nodes[{id,name,x,y,category,value}], links[{source,target,label}], categories[{name,color}] }
// Node x/y come from the database — no auto-layout is applied.

const NW = 110; // node rect width
const NH = 36;  // node rect height
const R  = 4;   // border radius
const debugConsole = typeof window !== 'undefined' && window.console ? window.console : console;

function tryParseJson(value) {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractTopology(input) {
  if (!input) {
    return null;
  }

  if (Array.isArray(input)) {
    for (var i = 0; i < input.length; i += 1) {
      var nested = extractTopology(input[i]);
      if (nested) {
        return nested;
      }
    }
    return null;
  }

  if (Array.isArray(input.nodes)) {
    return input;
  }

  if (input.fields && input.fields[0] && input.fields[0].values && input.fields[0].values.length > 0) {
    return extractTopology(tryParseJson(input.fields[0].values[0]));
  }

  if (input.data) {
    return extractTopology(input.data);
  }

  return null;
}

const topo = extractTopology(data);

debugConsole.info('[SFC D3 Script] input', {
  hasData: !!data,
  inputType: Array.isArray(data) ? 'array' : typeof data,
  keys: data && typeof data === 'object' ? Object.keys(data).slice(0, 8) : undefined,
  topoFound: !!topo,
  nodeCount: topo && Array.isArray(topo.nodes) ? topo.nodes.length : 0,
});

if (!topo || !Array.isArray(topo.nodes) || topo.nodes.length === 0) {
  debugConsole.warn('[SFC D3 Script] No topology data after extraction', {
    hasData: !!data,
    keys: data && typeof data === 'object' ? Object.keys(data).slice(0, 8) : undefined,
  });
  d3.select(container)
    .append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('justify-content', 'center')
    .style('width', '100%')
    .style('height', '100%')
    .style('color', '#94A3B8')
    .style('font-size', '13px')
    .text('No topology data');
  return () => d3.select(container).selectAll('*').remove();
}

debugConsole.info('[SFC D3 Script] Rendering topology', {
  nodeCount: topo.nodes.length,
  linkCount: Array.isArray(topo.links) ? topo.links.length : 0,
  categoryCount: Array.isArray(topo.categories) ? topo.categories.length : 0,
});

const catColors = (topo.categories || []).map(function(c) { return c.color; });
const fallback  = ['#3B82F6', '#93C5FD', '#9CA3AF', '#D1D5DB'];
function getColor(cat) { return catColors[cat] || fallback[cat] || '#9CA3AF'; }

// Scale node coordinates to fill the container
const LEGEND_H = 28;
const padH = NW / 2 + 16;
const padV = NH / 2 + 20;

const xs = topo.nodes.map(function(n) { return n.x; });
const ys = topo.nodes.map(function(n) { return n.y; });
const xMin = Math.min.apply(null, xs), xMax = Math.max.apply(null, xs);
const yMin = Math.min.apply(null, ys), yMax = Math.max.apply(null, ys);

const scaleX = d3.scaleLinear()
  .domain([xMin, xMax === xMin ? xMin + 1 : xMax])
  .range([padH, width - padH]);
const scaleY = d3.scaleLinear()
  .domain([yMin, yMax === yMin ? yMin + 1 : yMax])
  .range([padV, height - padV - LEGEND_H]);

// id → scaled centre lookup
const nodeMap = {};
topo.nodes.forEach(function(n) {
  nodeMap[n.id] = Object.assign({}, n, { cx: scaleX(n.x), cy: scaleY(n.y) });
});

const rightmost = Math.max.apply(null, topo.nodes.map(function(n) { return nodeMap[n.id].cx; }));
const bypassX   = rightmost + NW / 2 + 32;

// Build SVG
const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('overflow', 'visible');

// Arrow marker
const defs = svg.append('defs');
defs.append('marker')
  .attr('id', 'sfc-arrow')
  .attr('viewBox', '0 0 8 8')
  .attr('refX', 7)
  .attr('refY', 4)
  .attr('markerWidth', 6)
  .attr('markerHeight', 6)
  .attr('orient', 'auto')
  .append('path')
  .attr('d', 'M 0 0 L 8 4 L 0 8 Z')
  .attr('fill', '#94A3B8');

// Edges
const edgeG = svg.append('g');
topo.links.forEach(function(link) {
  const s = nodeMap[link.source];
  const t = nodeMap[link.target];
  if (!s || !t) return;

  var pathD;
  if (s.cy < t.cy) {
    // Forward edge — elbow path: bottom-of-source → top-of-target
    var sx = s.cx, sy = s.cy + NH / 2;
    var tx = t.cx, ty = t.cy - NH / 2;
    var mid = (sy + ty) / 2;
    pathD = 'M ' + sx + ' ' + sy + ' L ' + sx + ' ' + mid + ' L ' + tx + ' ' + mid + ' L ' + tx + ' ' + ty;
  } else {
    // Back-edge — Bézier bypass on the right
    var sx = s.cx + NW / 2, sy = s.cy;
    var tx = t.cx + NW / 2, ty = t.cy;
    pathD = 'M ' + sx + ' ' + sy + ' C ' + bypassX + ' ' + sy + ' ' + bypassX + ' ' + ty + ' ' + tx + ' ' + ty;
  }

  edgeG.append('path')
    .attr('d', pathD)
    .attr('fill', 'none')
    .attr('stroke', '#94A3B8')
    .attr('stroke-width', 1.5)
    .attr('marker-end', 'url(#sfc-arrow)');

  if (link.label) {
    edgeG.append('text')
      .attr('x', (s.cx + t.cx) / 2)
      .attr('y', (s.cy + t.cy) / 2)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#94A3B8')
      .attr('font-size', 10)
      .attr('font-family', 'system-ui, sans-serif')
      .text(link.label);
  }
});

// Nodes
const nodeG = svg.append('g');
topo.nodes.forEach(function(n) {
  const nd = nodeMap[n.id];
  const g = nodeG.append('g')
    .attr('transform', 'translate(' + (nd.cx - NW / 2) + ',' + (nd.cy - NH / 2) + ')');

  g.append('rect')
    .attr('width', NW)
    .attr('height', NH)
    .attr('rx', R)
    .attr('ry', R)
    .attr('fill', getColor(n.category))
    .attr('stroke', 'rgba(255,255,255,0.25)')
    .attr('stroke-width', 1);

  g.append('text')
    .attr('x', NW / 2)
    .attr('y', NH / 2)
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#ffffff')
    .attr('font-size', 11)
    .attr('font-family', 'system-ui, sans-serif')
    .attr('pointer-events', 'none')
    .text(n.name);
});

// Legend
const legendG = svg.append('g')
  .attr('transform', 'translate(8,' + (height - LEGEND_H + 6) + ')');

const cats = topo.categories || fallback.map(function(c, i) { return { name: 'Cat ' + i, color: c }; });
var lx = 0;
cats.forEach(function(cat) {
  const g = legendG.append('g').attr('transform', 'translate(' + lx + ',0)');
  g.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', cat.color);
  g.append('text')
    .attr('x', 14).attr('y', 9)
    .attr('fill', '#64748B')
    .attr('font-size', 10)
    .attr('font-family', 'system-ui, sans-serif')
    .text(cat.name);
  lx += cat.name.length * 7 + 28;
});

return () => d3.select(container).selectAll('*').remove();