const apiData = frames?.[0]?.fields?.[0]?.values?.[0];

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