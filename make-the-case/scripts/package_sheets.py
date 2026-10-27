"""Package only the reader-owned Sheets kit; never include project credentials."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
output = root.parent / 'outputs' / 'make-the-case-google-sheets-v0.2.zip'
output.parent.mkdir(parents=True, exist_ok=True)
files = sorted(p for p in (root / 'apps-script').rglob('*') if p.is_file())
files += [root / 'LICENSE', root / 'STATUS.md', root / 'docs' / 'validation.md']
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    archive.writestr('make-the-case-sheets/START-HERE.md',
        '# Make the Case Sheets kit\n\n'
        'Read apps-script/README.md for setup and apps-script/INTERFACE.md for the HTML connection.\n\n'
        'This handoff contains the backend. Claude\'s Coach.html and live Google-account checks are pending. '
        'No API key or private company records are included.\n')
    for source in files:
        archive.write(source, 'make-the-case-sheets/' + source.relative_to(root).as_posix())
print(str(output))
