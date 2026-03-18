const raw = frames?.[0]?.fields?.[0]?.values?.[0];
const looksLikeRow = (item) => item && typeof item === 'object' && !Array.isArray(item);

const rows = Array.isArray(raw)
  ? raw.filter(looksLikeRow)
  : (Array.isArray(frames) && frames[0]?.fields?.length
      ? toRows(frames[0]).filter(looksLikeRow)
      : (Array.isArray(frames) ? frames.filter(looksLikeRow) : []));

if (!rows.length) {
  return frames;
}

const requestedUnitId = context?.unitId ?? context?.variables?.unitId;
const unit = rows.find((item) => String(item.unitId ?? '') === String(requestedUnitId ?? '')) ?? rows[0];
const toNumber = (value) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

return [{
  name: 'unit',
  fields: [
    { name: 'unitId', type: 'string', config: {}, values: [String(unit.unitId ?? '')] },
    { name: 'name', type: 'string', config: {}, values: [String(unit.name ?? '')] },
    { name: 'status', type: 'string', config: {}, values: [String(unit.status ?? 'normal')] },
    { name: 'overallScore', type: 'number', config: {}, values: [toNumber(unit.overallScore)] },
    { name: 'performance', type: 'number', config: {}, values: [toNumber(unit.performance)] },
    { name: 'resilience', type: 'number', config: {}, values: [toNumber(unit.resilience)] },
    { name: 'skill', type: 'number', config: {}, values: [toNumber(unit.skill)] }
  ],
  length: 1,
}];
