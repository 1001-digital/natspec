# @1001-digital/natspec

Fetch and normalize NatSpec (userdoc/devdoc) documentation from [Sourcify](https://sourcify.dev) for any verified smart contract.

## Install

```bash
pnpm add @1001-digital/natspec
```

## Usage

### Fetch NatSpec from Sourcify

```ts
import { createNatSpec } from '@1001-digital/natspec'

const natspec = createNatSpec()

// Fetch + parse in one step
const result = await natspec.fetch(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')

console.log(result.functions.deposit)
// {
//   signature: 'deposit()',
//   name: 'deposit',
//   notice: 'Deposit ETH and receive WETH',
// }
```

### Parse raw userdoc/devdoc

If you already have the userdoc and devdoc (e.g. from compiler output), use `parse` directly:

```ts
import { parse } from '@1001-digital/natspec'

const result = parse(userdoc, devdoc)
```

### Convert to contract-metadata format

Convert parsed NatSpec to a shape compatible with the [contract-metadata](https://github.com/1001-digital/contract-metadata) standard:

```ts
import { createNatSpec } from '@1001-digital/natspec'

const natspec = createNatSpec()
const result = await natspec.fetch(1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2')
const metadata = natspec.toMetadata(result)

console.log(metadata.functions?.deposit)
// {
//   description: 'Deposit ETH and receive WETH',
// }
```

## API

### `createNatSpec(config?)`

Creates a NatSpec client.

**Config options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | `'https://sourcify.dev/server'` | Sourcify API base URL |
| `fetch` | `typeof fetch` | `globalThis.fetch` | Custom fetch function |

**Returns** a `NatSpecClient` with:

- **`fetch(chainId, address)`** — Fetches userdoc + devdoc from Sourcify and returns normalized `NatSpec`
- **`parse(userdoc, devdoc)`** — Pure function. Merges raw userdoc/devdoc into normalized `NatSpec`
- **`toMetadata(natspec)`** — Pure function. Converts `NatSpec` to `NatSpecMetadata` (contract-metadata compatible)

### `parse(userdoc, devdoc)`

Also exported directly for standalone use without the factory.

### `toMetadata(natspec)`

Also exported directly for standalone use.

## Output shapes

### `NatSpec` (normalized intermediate)

```ts
{
  contract?: { title?, author?, notice?, details? }
  functions: Record<string, {
    signature: string      // e.g. 'transfer(address,uint256)'
    name: string           // e.g. 'transfer'
    notice?: string        // from @notice (user-facing)
    details?: string       // from @dev (developer-facing)
    params?: Record<string, string>
    returns?: Record<string, string>
  }>
  events: Record<string, { ... }>   // same shape minus returns
  errors: Record<string, { ... }>   // same shape minus returns
}
```

### `NatSpecMetadata` (contract-metadata compatible)

```ts
{
  functions?: Record<string, {
    description?: string
    params?: Record<string, { description: string }>
    returns?: Record<string, { description: string }>
  }>
  events?: Record<string, { ... }>
  errors?: Record<string, { ... }>
}
```

### Overloaded functions

Functions with the same name but different parameters use the full Solidity signature as key:

```ts
result.functions['safeTransferFrom(address,address,uint256)']
result.functions['safeTransferFrom(address,address,uint256,bytes)']
```

Non-overloaded functions use the bare name:

```ts
result.functions['transfer']
```

## License

MIT
