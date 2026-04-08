import { createNatSpec } from '../src/index'

describe('createNatSpec', () => {
  const sourcifyResponse = {
    userdoc: {
      kind: 'user' as const,
      methods: {
        'transfer(address,uint256)': { notice: 'Transfer tokens' },
      },
    },
    devdoc: {
      kind: 'dev' as const,
      methods: {
        'transfer(address,uint256)': {
          details: 'Moves tokens from sender',
          params: { to: 'Recipient', amount: 'Amount' },
          returns: { _0: 'Success' },
        },
      },
    },
  }

  it('creates a client with fetch, parse, and toMetadata', () => {
    const client = createNatSpec()
    expect(client).toHaveProperty('fetch')
    expect(client).toHaveProperty('parse')
    expect(client).toHaveProperty('toMetadata')
  })

  it('fetch() calls Sourcify and returns parsed NatSpec', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(sourcifyResponse),
    })

    const client = createNatSpec({ fetch: mockFetch })
    const result = await client.fetch(1, '0xabc')

    expect(mockFetch).toHaveBeenCalledOnce()
    expect(result.functions.transfer).toEqual({
      signature: 'transfer(address,uint256)',
      name: 'transfer',
      notice: 'Transfer tokens',
      details: 'Moves tokens from sender',
      params: { to: 'Recipient', amount: 'Amount' },
      returns: { _0: 'Success' },
    })
  })

  it('parse() works as a pure function', () => {
    const client = createNatSpec()
    const result = client.parse(sourcifyResponse.userdoc, sourcifyResponse.devdoc)

    expect(result.functions.transfer.notice).toBe('Transfer tokens')
  })

  it('toMetadata() converts parsed NatSpec', () => {
    const client = createNatSpec()
    const parsed = client.parse(sourcifyResponse.userdoc, sourcifyResponse.devdoc)
    const metadata = client.toMetadata(parsed)

    expect(metadata.functions!.transfer).toEqual({
      description: 'Transfer tokens',
      params: {
        to: { description: 'Recipient' },
        amount: { description: 'Amount' },
      },
      returns: {
        _0: { description: 'Success' },
      },
    })
  })

  it('uses custom baseUrl', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(sourcifyResponse),
    })

    const client = createNatSpec({
      baseUrl: 'https://custom.sourcify.dev',
      fetch: mockFetch,
    })
    await client.fetch(1, '0xabc')

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.sourcify.dev/v2/contract/1/0xabc?fields=userdoc,devdoc',
    )
  })
})
