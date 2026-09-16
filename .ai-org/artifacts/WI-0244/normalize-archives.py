"""Regenerate approved public evidence copies; originals remain in Git history."""
import gzip, hashlib, io, json, pathlib, re, sys, tarfile

root = pathlib.Path.cwd()
inventory = json.loads(pathlib.Path(sys.argv[1]).read_text())
apply = '--apply' in sys.argv
sha = lambda b: hashlib.sha256(b).hexdigest()
registry = (root / '.ai-org/project/evidence.json').read_text()
selected = [r for r in inventory['records'] if any(m['findings'] or m.get('named_owner_metadata') for m in r.get('members', []))]
plans = []
for r in selected:
    assert r['path'] not in registry, 'active evidence impact requires CLI reconciliation'
    assert sha((root / r['path']).read_bytes()) == r['sha256'], 'stale source'
def normalize(payload):
    text = payload.decode('utf-8', errors='strict')
    text, homes = re.subn(r'/(?:Users|home)/[A-Za-z0-9._-]+', '<redacted-home>', text)
    text, emails = re.subn(r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b', '<redacted-email>', text, flags=re.I)
    return text.encode(), {'home_path_occurrences': homes, 'email_occurrences': emails}
for r in selected:
    old = (root / r['path']).read_bytes()
    expanded = gzip.decompress(old)
    assert len(expanded) <= 64 * 1024 * 1024
    members, removed = [], []
    if r['path'].endswith('.tar.gz'):
        buffer = io.BytesIO()
        with tarfile.open(fileobj=io.BytesIO(expanded), mode='r:') as archive, tarfile.open(fileobj=buffer, mode='w', format=tarfile.USTAR_FORMAT) as result:
            for m in archive.getmembers():
                p = pathlib.PurePosixPath(m.name)
                assert not p.is_absolute() and '..' not in p.parts
                assert m.isfile() or m.isdir()
                if p.name.startswith('._'):
                    raw = archive.extractfile(m).read()
                    assert raw[:4] == b'\x00\x05\x16\x07', 'not AppleDouble'
                    removed.append({'path': m.name, 'sha256': sha(raw), 'reason': 'AppleDouble auxiliary metadata'})
                    continue
                payload = archive.extractfile(m).read() if m.isfile() else b''
                public, counts = normalize(payload)
                clean = tarfile.TarInfo(m.name); clean.size = len(public); clean.mode = 0o755 if m.isdir() else 0o644
                clean.type = tarfile.DIRTYPE if m.isdir() else tarfile.REGTYPE
                clean.uid = clean.gid = clean.mtime = 0; clean.uname = clean.gname = ''
                result.addfile(clean, io.BytesIO(public) if m.isfile() else None)
                members.append({'path': m.name, 'original_sha256': sha(payload), 'public_sha256': sha(public), **counts})
        public_archive = gzip.compress(buffer.getvalue(), mtime=0)
    else:
        public, counts = normalize(expanded)
        public_archive = gzip.compress(public, mtime=0)
        members.append({'path': pathlib.PurePosixPath(r['path']).name[:-3], 'original_sha256': sha(expanded), 'public_sha256': sha(public), **counts})
    plans.append({'path': r['path'], 'original_archive_sha256': sha(old), 'public_archive_sha256': sha(public_archive),
                  'members': members, 'removed_metadata': removed, 'active_registry_impact': []})
    if apply:
        assert sha((root / r['path']).read_bytes()) == r['sha256']
        temporary = (root / r['path']).with_suffix('.publication-tmp')
        with temporary.open('xb') as stream: stream.write(public_archive)
        temporary.replace(root / r['path'])
report = {'schema_version': 'temple.public-evidence-copy-observation/v1', 'applied': apply,
          'source_revision': '5106bf13c0dc006f60d227ee2156e15d88c8ea52',
          'originals_retained': 'unchanged Git history; original hashes do not certify normalized current copies',
          'policy': 'replace home paths and email literals with explicit placeholders; remove only AppleDouble auxiliary records and owner metadata; retain test result and metric fields',
          'archives': plans}
pathlib.Path(sys.argv[2]).write_text(json.dumps(report, indent=2) + '\n')
print(json.dumps({'applied': apply, 'archives': len(plans), 'removed_metadata_records': sum(len(r['removed_metadata']) for r in plans),
                  'redacted_home_occurrences': sum(m['home_path_occurrences'] for r in plans for m in r['members']),
                  'redacted_email_occurrences': sum(m['email_occurrences'] for r in plans for m in r['members'])}))
