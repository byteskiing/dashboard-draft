// Plant KPI transform — PlantSummaryDto[] -> 3 compact rows for Business Text allRows mode.
// Supports both API wrapper-object frames and array-to-dataframe mapped responses.

const wrappedValue = frames?.[0]?.fields?.[0]?.values?.[0];
const plants = Array.isArray(wrappedValue)
  ? wrappedValue
  : (Array.isArray(frames) && frames[0]?.fields?.length ? toRows(frames[0]) : []);

const normalizedPlants = plants.filter((item) => item && typeof item === 'object');

if (normalizedPlants.length === 0) {
  return [
    {
      name: 'PlantKpis',
      fields: [
        { name: 'label', type: 'string', config: {}, values: [] },
        { name: 'score', type: 'string', config: {}, values: [] },
        { name: 'target', type: 'string', config: {}, values: [] },
        { name: 'tone', type: 'string', config: {}, values: [] }
      ],
      length: 0
    }
  ];
}

const preferredPlant =
  normalizedPlants.find((item) => String(item.plantId ?? '').toLowerCase() === 'ethylene') ?? normalizedPlants[0];

const toScore = (value) => {
  const numberValue = Number(value ?? 0);
  return Number.isFinite(numberValue) ? numberValue.toFixed(1) : '0.0';
};

const toneFor = (value) => {
  const numberValue = Number(value ?? 0);
  if (numberValue >= 90) return 'good';
  if (numberValue >= 80) return 'warn';
  return 'normal';
};

return [
  {
    name: 'PlantKpis',
    fields: [
      { name: 'label', type: 'string', config: {}, values: ['操作绩效', '操作弹性', '操作技能'] },
      {
        name: 'score',
        type: 'string',
        config: {},
        values: [
          toScore(preferredPlant.performance),
          toScore(preferredPlant.resilience),
          toScore(preferredPlant.skill)
        ]
      },
      { name: 'target', type: 'string', config: {}, values: ['>85分', '>80分', '>85分'] },
      {
        name: 'tone',
        type: 'string',
        config: {},
        values: [
          toneFor(preferredPlant.performance),
          toneFor(preferredPlant.resilience),
          toneFor(preferredPlant.skill)
        ]
      }
    ],
    length: 3
  }
];