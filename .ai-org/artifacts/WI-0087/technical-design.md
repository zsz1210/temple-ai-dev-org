# WI-0087 Technical Design

Add a test-local `removeTemporaryTree` helper that calls `fs.rm` with:

- `recursive: true`
- `force: true`
- `maxRetries: 5`
- `retryDelay: 100`

Register the helper in the fixture's `context.after` callback. Node applies retries only to recognized transient recursive-removal failures, including `ENOTEMPTY`; a persistent failure still rejects the cleanup and fails the test.

No production source, inbox assertion, timeout, or security behavior changes.
