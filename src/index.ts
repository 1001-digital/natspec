import type { NatSpecConfig, NatSpecClient } from './types'
import { fetchFromSourcify, DEFAULT_BASE_URL } from './sourcify'
import { parse } from './parse'
import { toMetadata } from './metadata'

export function createNatSpec(config: NatSpecConfig = {}): NatSpecClient {
  const baseUrl = config.baseUrl ?? DEFAULT_BASE_URL
  const fetchFn = config.fetch ?? globalThis.fetch

  return {
    async fetch(chainId: number, address: string) {
      const { userdoc, devdoc } = await fetchFromSourcify(
        chainId, address, baseUrl, fetchFn,
      )
      return parse(userdoc, devdoc)
    },

    parse,

    toMetadata,
  }
}

export { parse } from './parse'
export { toMetadata } from './metadata'
export { extractName } from './parse'
export { NatSpecError, NatSpecFetchError, NatSpecNotFoundError } from './errors'

export type {
  NatSpecConfig,
  NatSpecClient,
  SourcifyUserDoc,
  SourcifyDevDoc,
  UserDocItem,
  DevDocMethod,
  DevDocEvent,
  DevDocError,
  DevDocStateVar,
  NatSpec,
  ContractNatSpec,
  NatSpecFunction,
  NatSpecEvent,
  NatSpecErrorEntry,
  NatSpecMetadata,
  FunctionMeta,
  EventMeta,
  ErrorMeta,
  ParamMeta,
} from './types'
