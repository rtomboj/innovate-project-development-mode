"""Package only the reader-owned Sheets kit; never include project credentials."""
from pathlib import Path
import zipfile
import hashlib
import shutil

root = Path(__file__).resolve().parents[1]
output = root.parent / 'outputs' / 'make-the-case-google-sheets-v0.5.0.zip'
output.parent.mkdir(parents=True, exist_ok=True)
files = sorted(p for p in (root / 'apps-script').rglob('*') if p.is_file())
files += [root / 'LICENSE', root / 'ATTRIBUTIONS.md', root / 'STATUS.md', root / 'docs' / 'validation.md']
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('make-the-case-sheets/START-HERE.md',
        '# Make the Case Sheets kit\n\n'
        'Existing Sheet: read apps-script/UPDATE-AND-TEST.md first. New copy: read apps-script/README.md.\n\n'
        'This kit contains the integrated Coach.html and backend. Live Google-account/provider checks are pending. '
        'No API key or private company records are included.\n')
    for source in files:
        archive.write(source, 'make-the-case-sheets/' + source.relative_to(root).as_posix())
public_copy = root / 'downloads' / output.name
public_copy.parent.mkdir(parents=True, exist_ok=True)
shutil.copyfile(output, public_copy)
digest = hashlib.sha256(public_copy.read_bytes()).hexdigest()
(public_copy.parent / 'SHA256SUMS.txt').write_text(digest + '  ' + public_copy.name + '\n', encoding='utf-8')
print(str(output))
print(str(public_copy))
