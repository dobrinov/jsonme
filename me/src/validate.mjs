// Checks a me.json against the rules that matter for the page.
// Errors stop the build; warnings are printed and the build carries on.

const DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

export function validate(me) {
  const errors = [];
  const warnings = [];

  if (!me || typeof me !== 'object' || Array.isArray(me)) return { errors: ['me.json must be a JSON object'], warnings };
  if (!me.basics || typeof me.basics.name !== 'string' || !me.basics.name.trim()) errors.push('basics.name is required');

  const dates = (list, path) => (list || []).forEach((x, i) => {
    for (const key of ['startDate', 'endDate']) {
      if (x[key] != null && !DATE.test(x[key])) errors.push(`${path}[${i}].${key} must be YYYY, YYYY-MM or YYYY-MM-DD, got "${x[key]}"`);
    }
  });
  dates(me.work, 'work');
  dates(me.projects, 'projects');
  dates(me.education, 'education');
  (me.work || []).forEach((w, i) => { if (!w.name) errors.push(`work[${i}].name is required`); });

  const h = me.highlights || [];
  if (h.length > 3) errors.push(`highlights has ${h.length} entries; pick your best 3`);
  if (h.length < 3) warnings.push(`highlights has ${h.length} of 3 stories`);
  h.forEach((s, i) => {
    for (const key of ['title', 'problem', 'did', 'outcome']) if (!s[key]) errors.push(`highlights[${i}].${key} is required`);
    if (!s.evidence || !s.evidence.length) warnings.push(`highlights[${i}] "${s.title}" has no evidence link`);
  });

  for (const side of ['engineering', 'ai']) {
    const list = (me.expertise && me.expertise[side]) || [];
    if (!list.length) warnings.push(`expertise.${side} is empty`);
    list.forEach((x, i) => {
      if (!x.name) errors.push(`expertise.${side}[${i}].name is required`);
      if (!x.proof) errors.push(`expertise.${side}[${i}] "${x.name}" needs a one-line proof`);
    });
  }

  if ((me.facts || []).length > 4) errors.push('facts can have at most 4 entries');
  if (me.headline && me.headline.length > 120) warnings.push('headline is longer than 120 characters');

  return { errors, warnings };
}
