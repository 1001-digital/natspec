# CLAUDE.md

NatSpec SDK (`@1001-digital/natspec`) — fetch and normalize NatSpec documentation from Sourcify for smart contracts.

## Code style

- TypeScript
- Single quotes, no semicolons

## Structure

- `src/` — Source code
- `src/index.ts` — Factory (`createNatSpec`) + barrel exports
- `src/types.ts` — Public types (input, intermediate, output)
- `src/errors.ts` — Error classes
- `src/parse.ts` — Pure parsing: merge userdoc+devdoc, signature-to-name extraction
- `src/metadata.ts` — Conversion to ContractUIMetadata-compatible shape
- `src/sourcify.ts` — Sourcify v2 API client
- `test/` — Vitest tests (mirrors src structure)

## Key patterns

- Vite build step — outputs JS + `.d.ts` to `dist/`, source TS published alongside for editor navigation
- Factory pattern — `createNatSpec(config?)` returns a `NatSpecClient` with `fetch`, `parse`, `toMetadata` methods
- Pure functions — `parse` and `toMetadata` are stateless and exported directly for standalone use
- Zero runtime dependencies — only uses the Fetch API
- Overloaded function handling — bare name for unique, full Solidity signature for overloaded

## Testing

Tests mock `globalThis.fetch` — no real network calls.
