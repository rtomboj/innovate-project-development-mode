import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const failures = [];
const skill = fs.readFileSync(path.join(root,'skills/make-the-case/SKILL.md'),'utf8');
if (!/^---\r?\nname: make-the-case\r?\ndescription: [^\n]+\r?\n---/.test(skill)) failures.push('Skill frontmatter must contain the supported name and description.');
if (/\b(?:TODO|TBD|INSERT HERE)\b/.test(skill)) failures.push('The skill contains unfinished scaffold text.');
function walk(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => ['.git','node_modules','.openai'].includes(e.name) ? [] : e.isDirectory() ? walk(path.join(dir,e.name)) : [path.join(dir,e.name)]); }
for (const file of walk(root).filter(f => /\.(md|html|css|mjs|gs|json)$/.test(f))) {
  const text = fs.readFileSync(file, 'utf8');
  if (file.endsWith('.md')) {
    for (const m of text.matchAll(/\]\(([^)]+)\)/g)) {
      const target = m[1].split('#')[0]; if (!target || /^(https?:|mailto:)/.test(target)) continue;
      if (!fs.existsSync(path.resolve(path.dirname(file),target))) failures.push(`${path.relative(root,file)}: missing link ${target}`);
    }
  }
  if (file.endsWith('.html')) for (const m of text.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const target = m[1].split('#')[0]; if (/^(https?:|data:|mailto:)/.test(target)) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file),target))) failures.push(`${path.relative(root,file)}: missing asset ${target}`);
  }
  if (/\b(?:sk-[A-Za-z0-9]{24,}|github_pat_[A-Za-z0-9_]{30,})\b/.test(text)) failures.push(`${path.relative(root,file)}: possible credential`);
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; } else console.log('Local document links, page assets, and credential-pattern scan passed.');
