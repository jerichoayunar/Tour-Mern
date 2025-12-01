// Helper utilities to normalize and aggregate package/day inclusions
export function getInclusionsArray(day) {
  if (!day || !day.inclusions) return [];
  if (Array.isArray(day.inclusions)) return day.inclusions.map(String);
  if (typeof day.inclusions === 'object') {
    return Object.keys(day.inclusions).filter(k => !!day.inclusions[k]).map(String);
  }
  return [];
}

export function aggregatePackageInclusions(pkg) {
  const res = { transport: false, meals: false, stay: false };
  if (!pkg) return res;
  const it = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  it.forEach(day => {
    const arr = getInclusionsArray(day);
    if (arr.length) {
      arr.forEach(tag => {
        const t = String(tag).toLowerCase();
        if (t.includes('transport') || t === 'transport') res.transport = true;
        if (t.includes('meal') || t === 'meals' || t === 'meal') res.meals = true;
        if (t.includes('stay') || t === 'stay' || t.includes('accom') || t.includes('hotel')) res.stay = true;
      });
    }
  });
  // fallback to package-level legacy flags
  if (pkg.transport) res.transport = res.transport || !!pkg.transport;
  if (pkg.meals) res.meals = res.meals || !!pkg.meals;
  if (pkg.stay) res.stay = res.stay || !!pkg.stay;
  return res;
}

export function countInclusionDays(pkg, key) {
  if (!pkg || !Array.isArray(pkg.itinerary)) return 0;
  return pkg.itinerary.filter(day => {
    const arr = getInclusionsArray(day);
    if (arr.length) {
      return arr.some(tag => String(tag).toLowerCase().includes(key));
    }
    if (day.inclusions && typeof day.inclusions === 'object') {
      return !!day.inclusions[key];
    }
    return false;
  }).length;
}

export function uniqueInclusionsFromPackage(pkg) {
  if (!pkg) return [];
  const set = new Set();
  const it = Array.isArray(pkg.itinerary) ? pkg.itinerary : [];
  it.forEach(day => {
    getInclusionsArray(day).forEach(tag => {
      const t = String(tag).trim();
      if (t) set.add(t);
    });
  });
  return Array.from(set);
}

export function uniqueInclusionsFromPackages(packages) {
  if (!packages || !Array.isArray(packages)) return [];
  const set = new Set();
  packages.forEach(pkg => {
    uniqueInclusionsFromPackage(pkg).forEach(t => set.add(t));
  });
  return Array.from(set);
}

export function tagToEmoji(tag) {
  if (!tag) return '';
  const t = String(tag).toLowerCase();
  if (t.includes('transport') || t.includes('transfer') || t.includes('taxi') || t.includes('bus') || t.includes('airport')) return '🚗';
  if (t.includes('meal') || t.includes('breakfast') || t.includes('lunch') || t.includes('dinner') || t.includes('food')) return '🍽️';
  if (t.includes('stay') || t.includes('hotel') || t.includes('accom') || t.includes('night')) return '🏨';
  if (t.includes('guide') || t.includes('tour guide') || t.includes('guide')) return '🧭';
  if (t.includes('entrance') || t.includes('ticket')) return '🎟️';
  return '';
}
