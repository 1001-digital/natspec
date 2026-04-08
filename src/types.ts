// ── Configuration ──

export interface NatSpecConfig {
  /** Sourcify API base URL. Default: 'https://sourcify.dev/server' */
  baseUrl?: string
  /** Custom fetch function. Default: globalThis.fetch */
  fetch?: typeof globalThis.fetch
}

// ── Sourcify Input Types ──

export interface SourcifyUserDoc {
  kind?: 'user'
  version?: number
  notice?: string
  methods?: Record<string, UserDocItem>
  events?: Record<string, UserDocItem>
  errors?: Record<string, UserDocItem[]>
}

export interface UserDocItem {
  notice?: string
}

export interface SourcifyDevDoc {
  kind?: 'dev'
  version?: number
  title?: string
  author?: string
  details?: string
  methods?: Record<string, DevDocMethod>
  events?: Record<string, DevDocEvent>
  errors?: Record<string, DevDocError[]>
  stateVariables?: Record<string, DevDocStateVar>
}

export interface DevDocMethod {
  details?: string
  params?: Record<string, string>
  returns?: Record<string, string>
}

export interface DevDocEvent {
  details?: string
  params?: Record<string, string>
}

export interface DevDocError {
  details?: string
  params?: Record<string, string>
}

export interface DevDocStateVar {
  details?: string
  return?: string
  params?: Record<string, string>
  returns?: Record<string, string>
}

// ── Normalized NatSpec ──

export interface NatSpec {
  contract?: ContractNatSpec
  functions: Record<string, NatSpecFunction>
  events: Record<string, NatSpecEvent>
  errors: Record<string, NatSpecErrorEntry>
}

export interface ContractNatSpec {
  title?: string
  author?: string
  notice?: string
  details?: string
}

export interface NatSpecFunction {
  signature: string
  name: string
  notice?: string
  details?: string
  params?: Record<string, string>
  returns?: Record<string, string>
}

export interface NatSpecEvent {
  signature: string
  name: string
  notice?: string
  details?: string
  params?: Record<string, string>
}

export interface NatSpecErrorEntry {
  signature: string
  name: string
  notice?: string
  details?: string
  params?: Record<string, string>
}

// ── ContractUIMetadata-compatible output ──

export interface NatSpecMetadata {
  functions?: Record<string, FunctionMeta>
  events?: Record<string, EventMeta>
  errors?: Record<string, ErrorMeta>
}

export interface FunctionMeta {
  description?: string
  params?: Record<string, ParamMeta>
  returns?: Record<string, ParamMeta>
}

export interface EventMeta {
  description?: string
  params?: Record<string, ParamMeta>
}

export interface ErrorMeta {
  description?: string
  params?: Record<string, ParamMeta>
}

export interface ParamMeta {
  description?: string
}

// ── Client ──

export interface NatSpecClient {
  fetch: (chainId: number, address: string) => Promise<NatSpec>
  parse: (userdoc: SourcifyUserDoc, devdoc: SourcifyDevDoc) => NatSpec
  toMetadata: (natspec: NatSpec) => NatSpecMetadata
}
