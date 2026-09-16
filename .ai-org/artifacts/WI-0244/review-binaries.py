"""Read-only bounded review inventory; never extract or execute archive members."""
import gzip, hashlib, io, json, pathlib, re, struct, sys, tarfile

root = pathlib.Path.cwd()
audit = json.loads(pathlib.Path(sys.argv[1]).read_text())
prior = json.loads((root / '.ai-org/artifacts/WI-0160/binary-review.json').read_text())
sha = lambda data: hashlib.sha256(data).hexdigest()
old = {r['path']: r for r in prior['records']}
patterns = {
    'private-key': r'-----BEGIN (?:[A-Z0-9]+ )?PRIVATE KEY-----',
    'provider-key': r'\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b',
    'github-token': r'\bgh[pousr]_[A-Za-z0-9]{20,}\b',
    'aws-key': r'\bAKIA[0-9A-Z]{16}\b',
    'npm-token': r'\bnpm_[A-Za-z0-9]{20,}\b',
    'home-path': r'/(?:Users|home)/([A-Za-z0-9._-]+)',
    'windows-home': r'\b[A-Za-z]:\\Users\\([A-Za-z0-9._-]+)',
    'tailnet': r'\b[a-z0-9][a-z0-9-]*\.tail[a-z0-9-]*\.ts\.net\b',
    'private-ip': r'\b(?:10(?:\.\d{1,3}){3}|192\.168(?:\.\d{1,3}){2}|172\.(?:1[6-9]|2\d|3[01])(?:\.\d{1,3}){2})\b',
    'email': r'\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b',
}
def scan(data):
    try:
        text = data.decode('utf-8', errors='strict')
    except UnicodeDecodeError:
        return {'findings': {'non-utf8-member-needs-review': 1}, 'redacted_or_fixture_home_occurrences': 0}
    findings, placeholders = {}, 0
    for kind, expression in patterns.items():
        matches = list(re.finditer(expression, text, re.I if kind in ('email', 'tailnet') else 0))
        if kind in ('home-path', 'windows-home'):
            placeholders += sum(m[1].lower() in ('redacted', 'fixture', 'runner') for m in matches)
            matches = [m for m in matches if m[1].lower() not in ('redacted', 'fixture', 'runner')]
        if matches: findings[kind] = len(matches)
    return {'findings': findings, 'redacted_or_fixture_home_occurrences': placeholders}

records = []
for finding in audit['surfaces'][0]['findings']:
    if finding['rule_id'] != 'binary-review': continue
    name = finding['path']; data = (root / name).read_bytes()
    record = {'path': name, 'sha256': sha(data), 'bytes': len(data)}
    if name in old and sha(data) == old[name]['sha256']:
        record.update(disposition='reuse-exact-prior-review', evidence='.ai-org/artifacts/WI-0160/binary-review.json')
    elif name.endswith('.png'):
        assert data.startswith(b'\x89PNG\r\n\x1a\n')
        chunks, pos = [], 8
        while pos < len(data):
            size = struct.unpack('>I', data[pos:pos+4])[0]
            chunks.append(data[pos+4:pos+8].decode('ascii')); pos += 12 + size
        assert pos == len(data)
        metadata = [c for c in chunks if c in ('tEXt', 'zTXt', 'iTXt', 'eXIf')]
        record.update(disposition='new-rendered-review-required', embedded_text_or_exif_chunks=metadata)
    else:
        assert name.endswith('.gz')
        with gzip.GzipFile(fileobj=io.BytesIO(data)) as stream:
            expanded = stream.read(64 * 1024 * 1024 + 1)
        assert len(expanded) <= 64 * 1024 * 1024
        members = []
        if name.endswith('.tar.gz'):
            with tarfile.open(fileobj=io.BytesIO(expanded), mode='r:') as archive:
                for member in archive.getmembers():
                    p = pathlib.PurePosixPath(member.name)
                    assert not p.is_absolute() and '..' not in p.parts and len(p.parts) < 30
                    assert member.isfile() or member.isdir(), 'unsafe archive entry'
                    assert member.size <= 16 * 1024 * 1024
                    payload = archive.extractfile(member).read() if member.isfile() else b''
                    members.append({'path': member.name, 'sha256': sha(payload), 'bytes': len(payload),
                        'kind': 'file' if member.isfile() else 'directory',
                        'named_owner_metadata': bool(member.uname or member.gname),
                        'pax_metadata_keys': sorted(member.pax_headers), **scan(payload)})
        else:
            members.append({'path': pathlib.PurePosixPath(name).name[:-3], 'sha256': sha(expanded), 'bytes': len(expanded), **scan(expanded)})
        record.update(disposition='expanded-text-reviewed', members=members)
    records.append(record)
result = {'scope': 'current tracked binary reminders; no extraction, execution or Git history rewrite',
    'matched_values_retained': False, 'records': records,
    'summary': {'total': len(records), 'reused_prior_images': sum(r['disposition']=='reuse-exact-prior-review' for r in records),
    'new_images': sum(r['disposition']=='new-rendered-review-required' for r in records),
    'archives': sum('members' in r for r in records),
    'members_with_findings': sum(bool(m['findings']) for r in records for m in r.get('members', []))}}
pathlib.Path(sys.argv[2]).write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result['summary']))
for r in records:
    for member in r.get('members', []):
        if member['findings'] or member.get('named_owner_metadata'):
            print(json.dumps({'archive': r['path'], 'member': member['path'], 'findings': member['findings'], 'owner_metadata': member.get('named_owner_metadata', False)}))
