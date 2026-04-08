import { parse } from '../src/parse'
import { toMetadata } from '../src/metadata'
import type { SourcifyUserDoc, SourcifyDevDoc } from '../src/types'

// Real-world NatSpec from VV Checks Originals
// 0x036721e5a769cc48b3189efbb9cce4471e8a48b1 on mainnet
const userdoc: SourcifyUserDoc = {
  kind: 'user',
  version: 1,
  notice: 'This artwork is notable.',
  methods: {
    'getEpoch()': { notice: 'The identifier of the current epoch' },
    'svg(uint256)': { notice: 'Render the SVG for a given token.' },
    'burn(uint256)': { notice: 'Burn a check. Note: This burn does not composite or swap tokens.' },
    'totalSupply()': { notice: 'Returns how many tokens this contract manages.' },
    'colors(uint256)': { notice: 'Get the colors of all checks in a given token.' },
    'editionChecks()': { notice: 'The VV Checks Edition contract.' },
    'getCheck(uint256)': { notice: 'Get a specific check with its genome settings.' },
    'tokenURI(uint256)': { notice: 'Get the metadata for a given token.' },
    'infinity(uint256[])': { notice: 'Sacrifice 64 single-check tokens to form a black check.' },
    'getEpochData(uint256)': { notice: 'Get the data for a given epoch' },
    'mint(uint256[],address)': {
      notice: 'Migrate Checks Editions to Checks Originals by burning the Editions. Requires the Approval of this contract on the Edition contract.',
    },
    'resolveEpochIfNecessary()': { notice: 'Initializes and closes epochs.' },
    'inItForTheArt(uint256,uint256)': {
      notice: 'Sacrifice a token to transfer its visual representation to another token.',
    },
    'composite(uint256,uint256,bool)': {
      notice: 'Composite one token into another. This mixes the visual and reduces the number of checks.',
    },
    'compositeMany(uint256[],uint256[])': {
      notice: 'Composite multiple tokens. This mixes the visuals and checks in remaining tokens.',
    },
    'simulateComposite(uint256,uint256)': { notice: 'Simulate a composite.' },
    'inItForTheArts(uint256[],uint256[])': {
      notice: 'Sacrifice multiple tokens to transfer their visual to other tokens.',
    },
    'simulateCompositeSVG(uint256,uint256)': {
      notice: 'Render the SVG for a simulated composite.',
    },
  },
}

const devdoc: SourcifyDevDoc = {
  kind: 'dev',
  version: 1,
  title: 'Checks',
  author: 'VisualizeValue',
  methods: {
    'name()': { details: 'See {IERC721Metadata-name}.' },
    'symbol()': { details: 'See {IERC721Metadata-symbol}.' },
    'svg(uint256)': {
      details: 'Consider using the ChecksArt Library directly.',
      params: { tokenId: 'The token to render.' },
    },
    'burn(uint256)': {
      details: 'A common purpose burn method.',
      params: { tokenId: 'The token ID to burn.' },
    },
    'colors(uint256)': {
      details: 'Consider using the ChecksArt and EightyColors Libraries in combination with the getCheck function to resolve this yourself.',
      params: { tokenId: 'The token ID to get colors for.' },
    },
    'ownerOf(uint256)': { details: 'See {IERC721-ownerOf}.' },
    'getCheck(uint256)': {
      params: { tokenId: 'The token ID to fetch.' },
    },
    'tokenURI(uint256)': {
      details: 'Consider using the ChecksMetadata Library directly.',
      params: { tokenId: 'The token to render.' },
    },
    'balanceOf(address)': { details: 'See {IERC721-balanceOf}.' },
    'infinity(uint256[])': {
      details: 'The check at index 0 survives.',
      params: { tokenIds: 'The token IDs to burn for the black check.' },
    },
    'getApproved(uint256)': { details: 'See {IERC721-getApproved}.' },
    'getEpochData(uint256)': {
      params: { index: 'The identifier of the epoch to fetch' },
    },
    'mint(uint256[],address)': {
      params: {
        tokenIds: 'The Edition token IDs you want to migrate.',
        recipient: 'The address to receive the tokens.',
      },
    },
    'approve(address,uint256)': { details: 'See {IERC721-approve}.' },
    'resolveEpochIfNecessary()': {
      details: 'Based on the commit-reveal scheme proposed by MouseDev.',
    },
    'supportsInterface(bytes4)': { details: 'See {IERC165-supportsInterface}.' },
    'inItForTheArt(uint256,uint256)': {
      params: {
        burnId: 'The token ID to sacrifice.',
        tokenId: 'The token ID transfer the art into.',
      },
    },
    'composite(uint256,uint256,bool)': {
      params: {
        swap: 'Swap the visuals before compositing.',
        burnId: 'The token ID to composite into the tokenId.',
        tokenId: 'The token ID to keep alive. Its visual will change.',
      },
    },
    'setApprovalForAll(address,bool)': { details: 'See {IERC721-setApprovalForAll}.' },
    'isApprovedForAll(address,address)': { details: 'See {IERC721-isApprovedForAll}.' },
    'compositeMany(uint256[],uint256[])': {
      params: {
        burnIds: 'The token IDs to composite.',
        tokenIds: 'The token IDs to keep alive. Their art will change.',
      },
    },
    'simulateComposite(uint256,uint256)': {
      params: {
        burnId: 'The token to composite.',
        tokenId: 'The token to render.',
      },
    },
    'inItForTheArts(uint256[],uint256[])': {
      params: {
        burnIds: 'The token IDs to sacrifice.',
        tokenIds: 'The token IDs to transfer the art into.',
      },
    },
    'simulateCompositeSVG(uint256,uint256)': {
      params: {
        burnId: 'The token to composite.',
        tokenId: 'The token to render.',
      },
    },
    'transferFrom(address,address,uint256)': { details: 'See {IERC721-transferFrom}.' },
    'safeTransferFrom(address,address,uint256)': { details: 'See {IERC721-safeTransferFrom}.' },
    'safeTransferFrom(address,address,uint256,bytes)': { details: 'See {IERC721-safeTransferFrom}.' },
  },
  stateVariables: {
    checks: { details: 'We use this database for persistent storage.' },
  },
}

describe('Checks Originals (0x036721e5a769cc48b3189efbb9cce4471e8a48b1)', () => {
  const result = parse(userdoc, devdoc)

  describe('contract-level', () => {
    it('parses contract metadata', () => {
      expect(result.contract).toEqual({
        title: 'Checks',
        author: 'VisualizeValue',
        notice: 'This artwork is notable.',
      })
    })
  })

  describe('functions', () => {
    it('merges notice + details + params for composite', () => {
      expect(result.functions.composite).toEqual({
        signature: 'composite(uint256,uint256,bool)',
        name: 'composite',
        notice: 'Composite one token into another. This mixes the visual and reduces the number of checks.',
        params: {
          swap: 'Swap the visuals before compositing.',
          burnId: 'The token ID to composite into the tokenId.',
          tokenId: 'The token ID to keep alive. Its visual will change.',
        },
      })
    })

    it('merges notice + details for burn', () => {
      expect(result.functions.burn).toEqual({
        signature: 'burn(uint256)',
        name: 'burn',
        notice: 'Burn a check. Note: This burn does not composite or swap tokens.',
        details: 'A common purpose burn method.',
        params: { tokenId: 'The token ID to burn.' },
      })
    })

    it('handles devdoc-only functions (no notice)', () => {
      expect(result.functions.balanceOf).toEqual({
        signature: 'balanceOf(address)',
        name: 'balanceOf',
        details: 'See {IERC721-balanceOf}.',
      })
    })

    it('uses full signature for overloaded safeTransferFrom', () => {
      expect(result.functions).toHaveProperty('safeTransferFrom(address,address,uint256)')
      expect(result.functions).toHaveProperty('safeTransferFrom(address,address,uint256,bytes)')
      expect(result.functions).not.toHaveProperty('safeTransferFrom')

      expect(result.functions['safeTransferFrom(address,address,uint256)']).toEqual({
        signature: 'safeTransferFrom(address,address,uint256)',
        name: 'safeTransferFrom',
        details: 'See {IERC721-safeTransferFrom}.',
      })
    })

    it('includes the state variable as a function', () => {
      expect(result.functions.checks).toEqual({
        signature: 'checks()',
        name: 'checks',
        details: 'We use this database for persistent storage.',
      })
    })

    it('parses mint with multiple params', () => {
      expect(result.functions.mint).toEqual({
        signature: 'mint(uint256[],address)',
        name: 'mint',
        notice: 'Migrate Checks Editions to Checks Originals by burning the Editions. Requires the Approval of this contract on the Edition contract.',
        params: {
          tokenIds: 'The Edition token IDs you want to migrate.',
          recipient: 'The address to receive the tokens.',
        },
      })
    })
  })

  describe('toMetadata', () => {
    const metadata = toMetadata(result)

    it('uses notice as description (preferred over details)', () => {
      expect(metadata.functions!.burn.description)
        .toBe('Burn a check. Note: This burn does not composite or swap tokens.')
    })

    it('falls back to details when no notice', () => {
      expect(metadata.functions!.balanceOf.description)
        .toBe('See {IERC721-balanceOf}.')
    })

    it('maps params to { description } shape', () => {
      expect(metadata.functions!.composite.params).toEqual({
        swap: { description: 'Swap the visuals before compositing.' },
        burnId: { description: 'The token ID to composite into the tokenId.' },
        tokenId: { description: 'The token ID to keep alive. Its visual will change.' },
      })
    })

    it('preserves overloaded keys in metadata', () => {
      expect(metadata.functions).toHaveProperty('safeTransferFrom(address,address,uint256)')
      expect(metadata.functions).toHaveProperty('safeTransferFrom(address,address,uint256,bytes)')
    })
  })
})
