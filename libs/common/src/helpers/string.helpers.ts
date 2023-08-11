import slugify from 'slugify';

export function formatName(name: string) {
  return name
    .trim()
    .replace(/\n/g, ' ')
    .replace(/\s\s+/g, ' ')
    .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
}

export function generatePointSlug(str: string): string {
  return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
}
