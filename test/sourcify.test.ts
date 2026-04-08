import { fetchFromSourcify } from '../src/sourcify'
import { NatSpecFetchError, NatSpecNotFoundError } from '../src/errors'

describe('fetchFromSourcify', () => {
  const mockResponse = {
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
          details: 'Moves tokens',
          params: { to: 'Recipient', amount: 'Amount' },
        },
      },
    },
  }

  it('fetches and returns userdoc/devdoc', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await fetchFromSourcify(1, '0xabc', undefined, mockFetch)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://sourcify.dev/server/v2/contract/1/0xabc?fields=userdoc,devdoc',
    )
    expect(result).toEqual(mockResponse)
  })

  it('uses custom base URL', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    })

    await fetchFromSourcify(1, '0xabc', 'https://custom.api', mockFetch)

    expect(mockFetch).toHaveBeenCalledWith(
      'https://custom.api/v2/contract/1/0xabc?fields=userdoc,devdoc',
    )
  })

  it('throws NatSpecNotFoundError on 404', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    })

    await expect(fetchFromSourcify(1, '0xabc', undefined, mockFetch))
      .rejects.toThrow(NatSpecNotFoundError)

    try {
      await fetchFromSourcify(1, '0xabc', undefined, mockFetch)
    } catch (err) {
      expect(err).toBeInstanceOf(NatSpecNotFoundError)
      expect((err as NatSpecNotFoundError).chainId).toBe(1)
      expect((err as NatSpecNotFoundError).address).toBe('0xabc')
    }
  })

  it('throws NatSpecFetchError on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    await expect(fetchFromSourcify(1, '0xabc', undefined, mockFetch))
      .rejects.toThrow(NatSpecFetchError)

    try {
      await fetchFromSourcify(1, '0xabc', undefined, mockFetch)
    } catch (err) {
      expect(err).toBeInstanceOf(NatSpecFetchError)
      expect((err as NatSpecFetchError).status).toBe(500)
      expect((err as NatSpecFetchError).chainId).toBe(1)
      expect((err as NatSpecFetchError).address).toBe('0xabc')
    }
  })
})
