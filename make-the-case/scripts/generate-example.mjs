import fs from 'node:fs';
import { exampleWorkspace } from '../dist/example.mjs';
import { blankWorkspace, pitchMarkdown } from '../dist/model.mjs';
const example = exampleWorkspace(); example.updatedAt = '2026-10-27T00:00:00Z';
const blank = blankWorkspace(); blank.updatedAt = example.updatedAt; blank.ideas[0].id = 'IDEA-01'; blank.selectedId = 'IDEA-01';
fs.writeFileSync('dist/northstar-workspace.json', JSON.stringify(example,null,2)+'\n');
fs.writeFileSync('dist/blank-workspace.json', JSON.stringify(blank,null,2)+'\n');
fs.writeFileSync('docs/northstar-pitch.md', pitchMarkdown(example, example.ideas[0]));
console.log('Generated the portable example, blank workspace, and supporting pitch from the canonical model.');
