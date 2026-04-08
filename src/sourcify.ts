import type { SourcifyUserDoc, SourcifyDevDoc } from './types'
import { NatSpecFetchError, NatSpecNotFoundError } from './errors'

const DEFAULT_BASE_URL = 'https://sourcify.dev/server'

export interface SourcifyResponse {
  userdoc: SourcifyUserDoc
  devdoc: SourcifyDevDoc
}

export async function fetchFromSourcify(
  chainId: number,
  address: string,
  baseUrl: string = DEFAULT_BASE_URL,
  fetchFn: typeof globalThis.fetch = globalThis.fetch,
): Promise<SourcifyResponse> {
  const url = `${baseUrl}/v2/contract/${chainId}/${address}?fields=userdoc,devdoc`

  const response = await fetchFn(url)

  if (response.status === 404) {
    throw new NatSpecNotFoundError(chainId, address)
  }

  if (!response.ok) {
    throw new NatSpecFetchError(
      `Sourcify API returned ${response.status}`,
      { status: response.status, chainId, address },
    )
  }

  const data = await response.json()
  return data as SourcifyResponse
}
