const yearPattern = /\b(?:19|20)\d{2}\b/g;
const yearRangePattern = /\b((?:19|20)\d{2})\s*[-\u2013\u2014]\s*((?:19|20)\d{2})\b/g;

export function getCatalogYears(datasetNames: readonly string[]): string[] {
  const years = new Set<number>();

  for (const name of datasetNames) {
    for (const match of name.matchAll(yearRangePattern)) {
      const start = Number(match[1]);
      const end = Number(match[2]);
      if (end >= start && end - start <= 100) {
        for (let year = start; year <= end; year += 1) years.add(year);
      } else {
        years.add(start);
        years.add(end);
      }
    }

    for (const match of name.matchAll(yearPattern)) years.add(Number(match[0]));
  }

  return Array.from(years, String).sort((first, second) => Number(second) - Number(first));
}

export function getCatalogPeriod(datasetName: string): string {
  const ranges = Array.from(datasetName.matchAll(yearRangePattern), (match) => `${match[1]}-${match[2]}`);
  if (ranges.length > 0) return Array.from(new Set(ranges)).join(', ');

  const years = Array.from(new Set(datasetName.match(yearPattern) ?? []));
  return years.length > 0 ? years.join(', ') : 'Not specified';
}