// Converts a legacy jsonme me.json (employments / trainings / sideProjects /
// technologies) into the {me} format. Stories and expertise can't be derived,
// so they are left for the author to write.

const date = (d) => {
  if (!d) return undefined;
  const m = String(d).match(/^(\d{2})-(\d{4})$/);
  return m ? `${m[2]}-${m[1]}` : String(d);
};

const clean = (obj) => JSON.parse(JSON.stringify(obj));

export function isLegacy(json) {
  return !!json && !json.basics && (json.employments || json.trainings || json.sideProjects || json.technologies || json.name);
}

export function migrate(old) {
  const loc = old.location || {};
  const work = [];
  for (const e of old.employments || []) {
    for (const role of e.roles || [{}]) {
      work.push({
        name: e.employer?.name,
        position: role.title,
        url: e.employer?.website,
        startDate: date(e.period?.from),
        endDate: date(e.period?.to),
        summary: role.summary || e.summary,
        highlights: (role.majorAchievements || []).map((a) => a.title)
      });
    }
  }

  const tech = old.technologies || [];
  const skills = [
    { name: 'Can mentor', keywords: tech.filter((t) => t.canMentor).map((t) => t.name) },
    { name: 'Working knowledge', keywords: tech.filter((t) => !t.canMentor).map((t) => t.name) }
  ].filter((s) => s.keywords.length);

  return clean({
    $schema: 'https://raw.githubusercontent.com/dobrinov/jsonme/main/me/schema/v1.json',
    basics: {
      name: old.name,
      label: work[0] ? `${work[0].position} at ${work[0].name}` : undefined,
      image: old.image,
      summary: old.summary,
      location: { city: loc.city || undefined, region: loc.state || undefined, country: loc.country || undefined }
    },
    work,
    projects: (old.sideProjects || []).map((p) => ({
      name: p.name,
      description: p.summary,
      url: p.website,
      startDate: date(p.period?.from),
      endDate: date(p.period?.to)
    })),
    education: (old.trainings || []).map((t) => ({
      institution: t.institution?.name,
      url: t.institution?.website,
      area: t.summary,
      startDate: date(t.period?.from),
      endDate: date(t.period?.to)
    })),
    skills,
    meta: { me: { listed: old.public !== false } }
  });
}
