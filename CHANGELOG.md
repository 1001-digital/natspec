# @1001-digital/natspec

## 0.1.0

### Minor Changes

- [`c930585`](https://github.com/1001-digital/natspec/commit/c93058514d51b756d1a42a587ad4fc18c5a2e02d) Thanks [@jwahdatehagh](https://github.com/jwahdatehagh)! - Initial release of `@1001-digital/natspec` — fetch and normalize NatSpec documentation from Sourcify for any verified smart contract.

  ### Features

  - **`createNatSpec(config?)`** — factory that returns a client with `fetch`, `parse`, and `toMetadata` methods
  - **`parse(userdoc, devdoc)`** — pure function that merges Solidity compiler userdoc (`@notice`) and devdoc (`@dev`, `@param`, `@return`) into a normalized, name-keyed structure
  - **`toMetadata(natspec)`** — converts parsed NatSpec to a shape compatible with the [contract-metadata](https://github.com/1001-digital/contract-metadata) standard
  - **Overloaded function handling** — bare name for unique functions, full Solidity signature for overloads (e.g. `safeTransferFrom(address,address,uint256,bytes)`)
  - **State variable support** — public state variable NatSpec from `devdoc.stateVariables` is merged into the functions output
  - **Custom error classes** — `NatSpecNotFoundError` and `NatSpecFetchError` with chain/address context
  - Zero runtime dependencies — only uses the Fetch API

### Patch Changes

- [`aad2482`](https://github.com/1001-digital/natspec/commit/aad2482e69b77cfee1aef2e9e921c3f1e7fe62db) Thanks [@jwahdatehagh](https://github.com/jwahdatehagh)! - Fix error handling and state variable getter signatures.

  ### Bug fixes

  - **State variable getter signatures** — no longer reconstructs signatures from parameter names (which are names, not Solidity types). State variables not already in methods now use `name()` instead of producing misleading signatures like `balances(owner)`.
  - **Partial Sourcify responses** — missing `userdoc` or `devdoc` in the API response now defaults to `{ methods: {} }` instead of crashing with a TypeError.
  - **Network error wrapping** — fetch rejections (DNS failure, timeout) and JSON parse errors are now wrapped in `NatSpecFetchError` with `cause`, so callers can catch all failures via `NatSpecError`.

  ### Housekeeping

  - Deduplicated `DEFAULT_BASE_URL` between `sourcify.ts` and `index.ts`
