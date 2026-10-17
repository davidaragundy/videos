/**
 * Scaffold a new video from `templates/video`.
 *
 *   pnpm new "Why Do Stars Shine?"
 *   pnpm new "Why Do Stars Shine?" --slug stars
 */
import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import {join, resolve} from 'node:path';

const root = resolve(import.meta.dirname, '..');
const videosDir = join(root, 'videos');
const templateDir = join(root, 'templates', 'video');

const args = process.argv.slice(2);
const slugFlag = args.indexOf('--slug');
const customSlug = slugFlag >= 0 ? args.splice(slugFlag, 2)[1] : undefined;
const title = args.join(' ').trim();

if (!title) {
  console.error('Usage: pnpm new "Video Title" [--slug short-name]');
  process.exit(1);
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');

const next =
  readdirSync(videosDir)
    .map(name => Number.parseInt(name, 10))
    .filter(Number.isFinite)
    .reduce((max, n) => Math.max(max, n), 0) + 1;

const slug = `${String(next).padStart(3, '0')}-${slugify(customSlug ?? title)}`;
const target = join(videosDir, slug);

if (existsSync(target)) {
  console.error(`✖ ${target} already exists`);
  process.exit(1);
}

cpSync(templateDir, target, {recursive: true});

const fill = (dir: string) => {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
      fill(path);
    } else if (/\.(ts|tsx|md|meta)$/.test(entry)) {
      const content = readFileSync(path, 'utf8')
        .replaceAll('{{TITLE}}', title.replaceAll("'", "\\'"))
        .replaceAll('{{SLUG}}', slug);
      writeFileSync(path, content);
    }
  }
};
fill(target);

console.log(`✔ Created videos/${slug}`);
console.log('  Next: write script.md, then run `pnpm dev` and pick the project.');
