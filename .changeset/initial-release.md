---
'@1001-digital/natspec': minor
---

Initial release of `@1001-digital/natspec` — fetch and normalize NatSpec documentation from Sourcify for any verified smart contract.

### Features

- **`createNatSpec(config?)`** — factory that returns a client with `fetch`, `parse`, and `toMetadata` methods
- **`parse(userdoc, devdoc)`** — pure function that merges Solidity compiler userdoc (`@notice`) and devdoc (`@dev`, `@param`, `@return`) into a normalized, name-keyed structure
- **`toMetadata(natspec)`** — converts parsed NatSpec to a shape compatible with the [contract-metadata](https://github.com/1001-digital/contract-metadata) standard
- **Overloaded function handling** — bare name for unique functions, full Solidity signature for overloads (e.g. `safeTransferFrom(address,address,uint256,bytes)`)
- **State variable support** — public state variable NatSpec from `devdoc.stateVariables` is merged into the functions output
- **Custom error classes** — `NatSpecNotFoundError` and `NatSpecFetchError` with chain/address context
- Zero runtime dependencies — only uses the Fetch API
