
const margin = { top: 30, right: 30, bottom: 50, left: 60 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;

const chartData = (data && data.values && data.labels) 
  ? data.labels.map((label, i) => ({ label, value: data.values[i] || 0 }))
  : [
      { label: 'A', value: 30 },
      { label: 'B', value: 80 },
      { label: 'C', value: 45 },
      { label: 'D', value: 60 },
      { label: 'E', value: 20 },
      { label: 'F', value: 90 },
      { label: 'G', value: 55 }
    ];

const svg = d3.select(container)
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

const xScale = d3.scaleBand()
  .domain(chartData.map(d => d.label))
  .range([0, chartWidth])
  .padding(0.3);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(chartData, d => d.value) * 1.1 || 100])
  .range([chartHeight, 0]);

const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale).ticks(5);

const textColor = theme === 'dark' ? '#e0e0e0' : '#333333';
const barColor = theme === 'dark' ? '#4fc3f7' : '#0288d1';
const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';

svg.append('g')
  .attr('transform', `translate(0,${chartHeight})`)
  .call(xAxis)
  .selectAll('text')
  .style('fill', textColor);

svg.append('g')
  .call(yAxis)
  .selectAll('text')
  .style('fill', textColor);

svg.selectAll('.grid-line')
  .data(yScale.ticks(5))
  .enter()
  .append('line')
  .attr('class', 'grid-line')
  .attr('x1', 0)
  .attr('x2', chartWidth)
  .attr('y1', d => yScale(d))
  .attr('y2', d => yScale(d))
  .attr('stroke', gridColor)
  .attr('stroke-width', 1);

svg.selectAll('.bar')
  .data(chartData)
  .enter()
  .append('rect')
  .attr('class', 'bar')
  .attr('x', d => xScale(d.label))
  .attr('y', chartHeight)
  .attr('width', xScale.bandwidth())
  .attr('height', 0)
  .attr('fill', barColor)
  .attr('rx', 4)
  .transition()
  .duration(800)
  .attr('y', d => yScale(d.value))
  .attr('height', d => chartHeight - yScale(d.value));

return () => {
  d3.select(container).selectAll('*').remove();
};
