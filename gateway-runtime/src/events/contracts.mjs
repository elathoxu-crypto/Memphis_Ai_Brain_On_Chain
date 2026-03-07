export const SUBJECT_PREFIX = {
  cmd: 'cmd.',
  evt: 'evt.',
  sys: 'sys.',
};

export const REQUIRED_ENVELOPE_FIELDS = [
  'event_id',
  'event_type',
  'ts',
  'trace_id',
  'producer',
  'payload',
];

export const validateEnvelope = (envelope) => {
  const missing = REQUIRED_ENVELOPE_FIELDS.filter((k) => envelope?.[k] === undefined || envelope?.[k] === null);
  if (missing.length) return { ok: false, error: 'missing_fields', missing };

  const t = String(envelope.event_type || '');
  if (!Object.values(SUBJECT_PREFIX).some((p) => t.startsWith(p))) {
    return { ok: false, error: 'invalid_subject_prefix', event_type: t };
  }

  if (!t.endsWith('.v1')) return { ok: false, error: 'unsupported_version', event_type: t };

  return { ok: true };
};

export const routeGroup = (eventType) => {
  if (eventType.startsWith(SUBJECT_PREFIX.cmd)) return 'cmd';
  if (eventType.startsWith(SUBJECT_PREFIX.evt)) return 'evt';
  if (eventType.startsWith(SUBJECT_PREFIX.sys)) return 'sys';
  return 'unknown';
};
