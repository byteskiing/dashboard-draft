const frame = frames?.[0];
const apiData = (() => {
  if (!frame || !Array.isArray(frame.fields) || frame.fields.length === 0) {
    return null;
  }

  const wrappedValue = frame.fields[0]?.name === 'data'
    ? frame.fields[0]?.values?.[0]
    : null;

  if (wrappedValue && typeof wrappedValue === 'object' && !Array.isArray(wrappedValue)) {
    return wrappedValue;
  }

  if (frame.length === 1) {
    return frame.fields.reduce((result, field) => {
      if (!field?.name || !Array.isArray(field.values)) {
        return result;
      }

      result[field.name] = field.values[0];
      return result;
    }, {});
  }

  return null;
})();

if (!apiData || typeof apiData !== 'object') {
  return frames;
}

const toSeries = (trendKey, valueKey) => {
  const trend = Array.isArray(apiData[trendKey])
    ? apiData[trendKey].map((value) => Number(value ?? 0)).filter((value) => Number.isFinite(value))
    : [];

  if (trend.length > 0) {
    return trend;
  }

  return [Number(apiData[valueKey] ?? 0)];
};

const performanceSeries = toSeries('avgPerformanceTrend', 'avgPerformance');
const resilienceSeries = toSeries('avgResilienceTrend', 'avgResilience');
const skillSeries = toSeries('avgSkillTrend', 'avgSkill');
const overallSeries = toSeries('avgOverallScoreTrend', 'avgOverallScore');

const maxLength = Math.max(
  performanceSeries.length,
  resilienceSeries.length,
  skillSeries.length,
  overallSeries.length,
  1
);

return [
  {
    name: 'SBC Overview',
    fields: [
      {
        name: 'avgPerformance',
        type: 'number',
        config: {},
        values: performanceSeries,
      },
      {
        name: 'avgResilience',
        type: 'number',
        config: {},
        values: resilienceSeries,
      },
      {
        name: 'avgSkill',
        type: 'number',
        config: {},
        values: skillSeries,
      },
      {
        name: 'avgOverallScore',
        type: 'number',
        config: {},
        values: overallSeries,
      },
    ],
    length: maxLength,
  },
];
