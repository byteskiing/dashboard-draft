// Alert Banner Transform — FactoryOverviewDto → 1-row flat fields
// Output row context used directly by Handlebars everyRow template:
//   {{hasAlerts}}, {{criticalCount}}, {{warningCount}},
//   {{alertText}}, {{levelColor}}, {{levelBg}}
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
if (!apiData || typeof apiData !== 'object') return frames;

const rawAlerts = Array.isArray(apiData.alerts) ? apiData.alerts : [];

// Sort by severity: critical → warning → info
const sorted = [...rawAlerts].sort((a, b) => {
  const order = { critical: 0, warning: 1, info: 2 };
  return (order[a.level] ?? 3) - (order[b.level] ?? 3);
});

const hasAlerts     = sorted.length > 0;
const criticalCount = sorted.filter(a => a.level === 'critical').length;
const warningCount  = sorted.filter(a => a.level === 'warning').length;
const alertText     = sorted
  .map(a => {
    const timeText = typeof a.time === 'string' && a.time ? ` [${a.time}]` : '';
    return `${a.message}${timeText}`;
  })
  .join('   ·   ');

// Visual theme driven by highest severity level
const topLevel   = sorted[0]?.level ?? 'info';
const levelColor = topLevel === 'critical' ? '#DC2626' : topLevel === 'warning' ? '#D97706' : '#3B82F6';
const levelBg    = topLevel === 'critical' ? '#FEF2F2' : topLevel === 'warning' ? '#FFFBEB' : '#EFF6FF';

return [{
  name: 'AlertBanner',
  fields: [
    { name: 'hasAlerts',     type: 'boolean', config: {}, values: [hasAlerts] },
    { name: 'criticalCount', type: 'number',  config: {}, values: [criticalCount] },
    { name: 'warningCount',  type: 'number',  config: {}, values: [warningCount] },
    { name: 'alertText',     type: 'string',  config: {}, values: [alertText] },
    { name: 'levelColor',    type: 'string',  config: {}, values: [levelColor] },
    { name: 'levelBg',       type: 'string',  config: {}, values: [levelBg] },
  ],
  length: 1,
}];
