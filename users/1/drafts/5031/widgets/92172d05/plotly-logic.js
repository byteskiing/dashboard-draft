const trace1 = {
  x: [1, 2, 3, 4],
  y: [10, 15, 13, 17],
  type: 'scatter',
  mode: 'lines+markers',
  name: 'Series A',
  line: {
    color: theme === 'dark' ? '#00e5ff' : '#0066cc',
    width: 3
  },
  marker: {
    size: 10,
    color: theme === 'dark' ? '#00e5ff' : '#0066cc'
  }
};

const trace2 = {
  x: [1, 2, 3, 4],
  y: [16, 5, 11, 9],
  type: 'scatter',
  mode: 'lines+markers',
  name: 'Series B',
  line: {
    color: theme === 'dark' ? '#ff4081' : '#d81b60',
    width: 3
  },
  marker: {
    size: 10,
    color: theme === 'dark' ? '#ff4081' : '#d81b60'
  }
};

const layout = {
  title: {
    text: 'Plotly Demo: Sales Data',
    font: {
      color: theme === 'dark' ? '#ffffff' : '#333333'
    }
  },
  autosize: true,
  width: width,
  height: height,
  margin: { l: 40, r: 20, t: 60, b: 40 },
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  xaxis: {
    gridcolor: theme === 'dark' ? '#444444' : '#e0e0e0',
    tickfont: { color: theme === 'dark' ? '#ffffff' : '#333333' }
  },
  yaxis: {
    gridcolor: theme === 'dark' ? '#444444' : '#e0e0e0',
    tickfont: { color: theme === 'dark' ? '#ffffff' : '#333333' }
  },
  legend: {
    font: { color: theme === 'dark' ? '#ffffff' : '#333333' }
  }
};

const config = {
  responsive: true,
  displaylogo: false
};

Plotly.newPlot(container, [trace1, trace2], layout, config);

return () => {
  Plotly.purge(container);
};