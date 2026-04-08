import type {
  NatSpec,
  NatSpecMetadata,
  FunctionMeta,
  EventMeta,
  ErrorMeta,
  ParamMeta,
} from './types'

export function toMetadata(natspec: NatSpec): NatSpecMetadata {
  const result: NatSpecMetadata = {}

  const fnEntries = Object.entries(natspec.functions)
  if (fnEntries.length > 0) {
    result.functions = {}
    for (const [key, fn] of fnEntries) {
      const meta: FunctionMeta = {}
      const description = fn.notice ?? fn.details
      if (description) meta.description = description
      if (fn.params) meta.params = mapParams(fn.params)
      if (fn.returns) meta.returns = mapParams(fn.returns)
      result.functions[key] = meta
    }
  }

  const evtEntries = Object.entries(natspec.events)
  if (evtEntries.length > 0) {
    result.events = {}
    for (const [key, evt] of evtEntries) {
      const meta: EventMeta = {}
      const description = evt.notice ?? evt.details
      if (description) meta.description = description
      if (evt.params) meta.params = mapParams(evt.params)
      result.events[key] = meta
    }
  }

  const errEntries = Object.entries(natspec.errors)
  if (errEntries.length > 0) {
    result.errors = {}
    for (const [key, err] of errEntries) {
      const meta: ErrorMeta = {}
      const description = err.notice ?? err.details
      if (description) meta.description = description
      if (err.params) meta.params = mapParams(err.params)
      result.errors[key] = meta
    }
  }

  return result
}

function mapParams(params: Record<string, string>): Record<string, ParamMeta> {
  const result: Record<string, ParamMeta> = {}
  for (const [name, description] of Object.entries(params)) {
    result[name] = { description }
  }
  return result
}
