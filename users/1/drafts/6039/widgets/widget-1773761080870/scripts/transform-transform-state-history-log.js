const raw = frames?.[0]?.fields?.[0]?.values?.[0];
const sourceEvents = Array.isArray(raw?.events) ? raw.events : [];

const splitTime = (value) => {
  const text = String(value ?? '').replace('T', ' ').trim();
  const match = text.match(/(\d{4})[-/](\d{2})[-/](\d{2})\s+(\d{2}:\d{2})/);
  if (match) {
    return {
      dateLabel: `${match[2]}/${match[3]}`,
      timeLabel: match[4],
    };
  }

  const fallback = text.split(/\s+/);
  return {
    dateLabel: fallback[0] ?? '--/--',
    timeLabel: fallback[1] ?? '--:--',
  };
};

const colorForStatus = (status) => {
  const normalized = String(status ?? '').toLowerCase();
  if (normalized === 'normal') return '#10B981';
  if (normalized === 'warning') return '#D97706';
  if (normalized === 'critical' || normalized === 'error' || normalized === 'abnormal') return '#DC2626';
  return '#64748B';
};

const detailForEvent = (eventName, duration) => {
  const durationText = String(duration ?? '').trim();
  if (!durationText) return '';
  return /迁移/.test(String(eventName ?? ''))
    ? `停留时长 ${durationText}`
    : `状态切换 ${durationText}`;
};

const events = sourceEvents.map((item) => {
  const { dateLabel, timeLabel } = splitTime(item?.time);
  return {
    dateLabel,
    timeLabel,
    event: String(item?.event ?? ''),
    status: String(item?.status ?? ''),
    detail: detailForEvent(item?.event, item?.duration),
    dotColor: colorForStatus(item?.status),
  };
});

return [{
  name: 'events',
  fields: [
    {
      name: 'events',
      type: 'string',
      config: {},
      values: [JSON.stringify(events)],
    }
  ],
  length: 1,
}];
