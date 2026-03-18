const raw = frames?.[0]?.fields?.[0]?.values?.[0];
if (!raw?.times) return frames;

const times = Array.isArray(raw.times) ? raw.times : [];
const values = Array.isArray(raw.performance) ? raw.performance : [];
const length = Math.min(times.length, values.length);

return [{
  name: 'trend',
  fields: [
    { name: 'time', type: 'string', config: {}, values: times.slice(0, length) },
    { name: 'value', type: 'number', config: {}, values: values.slice(0, length).map(v => Number(v ?? 0)) }
  ],
  length,
}];
