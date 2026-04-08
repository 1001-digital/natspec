import type { SourcifyUserDoc, SourcifyDevDoc } from './types'
import { NatSpecFetchError, NatSpecNotFoundError, errorMessage } from './errors'

export const DEFAULT_BASE_URL = 'https://sourcify.dev/server'

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

  let response: Response
  try {
    response = await fetchFn(url)
  } catch (error) {
    throw new NatSpecFetchError(
      `Failed to fetch from Sourcify: ${errorMessage(error)}`,
      { status: 0, chainId, address },
      { cause: error },
    )
  }

  if (response.status === 404) {
    throw new NatSpecNotFoundError(chainId, address)
  }

  if (!response.ok) {
    throw new NatSpecFetchError(
      `Sourcify API returned ${response.status}`,
      { status: response.status, chainId, address },
    )
  }

  let data: any
  try {
    data = await response.json()
  } catch (error) {
    throw new NatSpecFetchError(
      `Invalid JSON from Sourcify: ${errorMessage(error)}`,
      { status: response.status, chainId, address },
      { cause: error },
    )
  }

  return {
    userdoc: data.userdoc ?? { methods: {} },
    devdoc: data.devdoc ?? { methods: {} },
  }
}
