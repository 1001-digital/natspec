---
'@1001-digital/natspec': patch
---

Fix error handling and state variable getter signatures.

### Bug fixes

- **State variable getter signatures** — no longer reconstructs signatures from parameter names (which are names, not Solidity types). State variables not already in methods now use `name()` instead of producing misleading signatures like `balances(owner)`.
- **Partial Sourcify responses** — missing `userdoc` or `devdoc` in the API response now defaults to `{ methods: {} }` instead of crashing with a TypeError.
- **Network error wrapping** — fetch rejections (DNS failure, timeout) and JSON parse errors are now wrapped in `NatSpecFetchError` with `cause`, so callers can catch all failures via `NatSpecError`.

### Housekeeping

- Deduplicated `DEFAULT_BASE_URL` between `sourcify.ts` and `index.ts`
