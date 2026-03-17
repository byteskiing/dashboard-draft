// graph-circular-layout - customScript
var nodes = (data && data.series) ? data.series[0].data : (data && data.nodes) ? data.nodes : [];
var links = (data && data.links) ? data.links : [];
var edges = (data && data.edges) ? data.edges : [];
var cats  = (data && data.categories) ? data.categories : [];
var seriesUpdate = { data: nodes };
if (links.length) seriesUpdate.links = links;
if (edges.length) seriesUpdate.edges = edges;
if (cats.length) seriesUpdate.categories = cats;
chart.setOption({ series: [seriesUpdate] }, {notMerge:false});