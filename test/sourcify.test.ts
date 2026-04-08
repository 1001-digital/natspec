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

    const err = await fetchFromSourcify(1, '0xabc', undefined, mockFetch).catch(e => e)
    expect(err).toBeInstanceOf(NatSpecNotFoundError)
    expect(err.chainId).toBe(1)
    expect(err.address).toBe('0xabc')
  })

  it('wraps network errors in NatSpecFetchError', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError('fetch failed'))

    const err = await fetchFromSourcify(1, '0xabc', undefined, mockFetch).catch(e => e)
    expect(err).toBeInstanceOf(NatSpecFetchError)
    expect(err.status).toBe(0)
    expect(err.chainId).toBe(1)
    expect(err.address).toBe('0xabc')
    expect(err.message).toContain('fetch failed')
    expect(err.cause).toBeInstanceOf(TypeError)
  })

  it('wraps JSON parse errors in NatSpecFetchError', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.reject(new SyntaxError('Unexpected token')),
    })

    const err = await fetchFromSourcify(1, '0xabc', undefined, mockFetch).catch(e => e)
    expect(err).toBeInstanceOf(NatSpecFetchError)
    expect(err.status).toBe(200)
    expect(err.message).toContain('Invalid JSON')
    expect(err.cause).toBeInstanceOf(SyntaxError)
  })

  it('defaults missing devdoc to empty object', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ userdoc: { kind: 'user', methods: {} } }),
    })

    const result = await fetchFromSourcify(1, '0xabc', undefined, mockFetch)
    expect(result.devdoc).toEqual({ methods: {} })
  })

  it('defaults missing userdoc to empty object', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ devdoc: { kind: 'dev', methods: {} } }),
    })

    const result = await fetchFromSourcify(1, '0xabc', undefined, mockFetch)
    expect(result.userdoc).toEqual({ methods: {} })
  })

  it('throws NatSpecFetchError on non-ok response', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    })

    const err = await fetchFromSourcify(1, '0xabc', undefined, mockFetch).catch(e => e)
    expect(err).toBeInstanceOf(NatSpecFetchError)
    expect(err.status).toBe(500)
    expect(err.chainId).toBe(1)
    expect(err.address).toBe('0xabc')
  })
})
