/** Print every video with its status from script.md front-matter. */
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {join, resolve} from 'node:path';

const videosDir = resolve(import.meta.dirname, '..', 'videos');

const rows = readdirSync(videosDir, {withFileTypes: true})
  .filter(d => d.isDirectory() && existsSync(join(videosDir, d.name, 'project.ts')))
  .map(d => {
    const scriptPath = join(videosDir, d.name, 'script.md');
    const script = existsSync(scriptPath) ? readFileSync(scriptPath, 'utf8') : '';
    const field = (key: string) =>
      script.match(new RegExp(`^${key}:\\s*'?([^'\\n#]*)'?`, 'm'))?.[1]?.trim() ?? '—';
    return {slug: d.name, title: field('title'), status: field('status')};
  });

if (rows.length === 0) console.log('No videos yet. Run `pnpm new "Title"`.');
else console.table(rows);
