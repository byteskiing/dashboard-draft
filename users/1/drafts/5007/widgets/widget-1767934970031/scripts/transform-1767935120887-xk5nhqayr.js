// v2.2 - Multi-series support
// Extract all items from API response as separate series
const apiData = frames[0].fields[0].values[0];
console.log('[Transform v2.2] Input frames:', frames);
console.log('[Transform v2.2] Raw API data:', apiData);

const items = apiData?.data?.items || [];
console.log('[Transform v2.2] Items count:', items.length);

// Create one TDataFrame for each item (each becomes a series)
const result = items.map((item, index) => {
  const intervals = item.intervals || [];
  const seriesName = item.p || `Series ${index + 1}`; // Use path as series name

  console.log(`[Transform v2.2] Series ${index + 1} (${seriesName}): ${intervals.length} points`);

  return {
    name: seriesName,
    fields: [
      {
        name: 'time',
        type: 'time',
        config: {},
        values: intervals.map(pt => pt.T)
      },
      {
        name: 'value',
        type: 'number',
        config: {},
        values: intervals.map(pt => pt.V)
      }
    ],
    length: intervals.length
  };
});

console.log('[Transform v2.2] Output:', result.length, 'series');
return result;
