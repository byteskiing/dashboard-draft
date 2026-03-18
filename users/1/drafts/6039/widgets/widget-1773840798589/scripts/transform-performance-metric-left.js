const raw = frames?.[0]?.fields?.[0]?.values?.[0];
if (!raw?.metrics) return frames;

const m = raw.metrics.find(x => String(x?.dimension ?? '').toLowerCase() === 'performance')
  ?? { value: 0, tir: 0, target: 0 };

const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

return [{
  name: 'metric',
  fields: [
    { name: 'value', type: 'number', config: {}, values: [toNumber(m.value)] },
    { name: 'tir', type: 'number', config: {}, values: [toNumber(m.tir)] },
    { name: 'target', type: 'number', config: {}, values: [toNumber(m.target)] }
  ],
  length: 1,
}];
