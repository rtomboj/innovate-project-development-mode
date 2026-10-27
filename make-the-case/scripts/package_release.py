"""Prepare static guide downloads and a credential-free reusable starter archive."""
from pathlib import Path
import shutil
import zipfile

root = Path(__file__).resolve().parents[1]
for name in ('start-here.md', 'research.md', 'validation.md'):
    shutil.copyfile(root / 'docs' / name, root / 'dist' / name)
target = root / 'dist' / 'make-the-case-starter.zip'
files = [p for p in root.rglob('*') if p.is_file() and not any(part in ('.git', '.openai', 'node_modules', '__pycache__') for part in p.relative_to(root).parts) and p.suffix not in ('.zip', '.gz')]
with zipfile.ZipFile(target, 'w', zipfile.ZIP_DEFLATED) as archive:
    for source in sorted(files):
        archive.write(source, 'tomboj-make-the-case/' + source.relative_to(root).as_posix())
print(f'Prepared {len(files)} source files and the reusable starter archive.')
