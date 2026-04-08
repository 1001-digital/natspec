import type {
  SourcifyUserDoc,
  SourcifyDevDoc,
  NatSpec,
  ContractNatSpec,
  NatSpecFunction,
  NatSpecEvent,
  NatSpecErrorEntry,
} from './types'

export function parse(userdoc: SourcifyUserDoc, devdoc: SourcifyDevDoc): NatSpec {
  const contract = parseContract(userdoc, devdoc)
  const functions = parseFunctions(userdoc, devdoc)
  const events = parseEvents(userdoc, devdoc)
  const errors = parseErrors(userdoc, devdoc)

  return { ...(contract && { contract }), functions, events, errors }
}

function parseContract(
  userdoc: SourcifyUserDoc,
  devdoc: SourcifyDevDoc,
): ContractNatSpec | undefined {
  if (!devdoc.title && !devdoc.author && !devdoc.details && !userdoc.notice) {
    return undefined
  }

  return {
    ...(devdoc.title && { title: devdoc.title }),
    ...(devdoc.author && { author: devdoc.author }),
    ...(userdoc.notice && { notice: userdoc.notice }),
    ...(devdoc.details && { details: devdoc.details }),
  }
}

function parseFunctions(
  userdoc: SourcifyUserDoc,
  devdoc: SourcifyDevDoc,
): Record<string, NatSpecFunction> {
  const allSigs = new Set<string>([
    ...Object.keys(userdoc.methods ?? {}),
    ...Object.keys(devdoc.methods ?? {}),
  ])

  // State variables generate getter functions — merge them in
  if (devdoc.stateVariables) {
    for (const [name, sv] of Object.entries(devdoc.stateVariables)) {
      // State variable getters may already appear in methods with their full signature.
      // If not, we add them with just the name (no params means simple getter).
      const alreadyHasSig = [...allSigs].some(sig => extractName(sig) === name)
      if (!alreadyHasSig) {
        // For public state variables without params, the getter has no arguments
        const params = sv.params ? `(${Object.keys(sv.params).join(',')})` : '()'
        allSigs.add(`${name}${params}`)
      }
    }
  }

  const signatures = [...allSigs]
  const keyMap = buildKeyMap(signatures)
  const result: Record<string, NatSpecFunction> = {}

  for (const sig of signatures) {
    const key = keyMap.get(sig)!
    const name = extractName(sig)
    const user = userdoc.methods?.[sig]
    const dev = devdoc.methods?.[sig]

    // Check if this is a state variable getter
    const sv = devdoc.stateVariables?.[name]

    const notice = user?.notice
    const details = dev?.details ?? sv?.details
    const params = dev?.params ?? sv?.params
    const returns = dev?.returns ?? sv?.returns

    result[key] = {
      signature: sig,
      name,
      ...(notice && { notice }),
      ...(details && { details }),
      ...(params && Object.keys(params).length > 0 && { params }),
      ...(returns && Object.keys(returns).length > 0 && { returns }),
    }
  }

  return result
}

function parseEvents(
  userdoc: SourcifyUserDoc,
  devdoc: SourcifyDevDoc,
): Record<string, NatSpecEvent> {
  const allSigs = new Set<string>([
    ...Object.keys(userdoc.events ?? {}),
    ...Object.keys(devdoc.events ?? {}),
  ])

  const signatures = [...allSigs]
  const keyMap = buildKeyMap(signatures)
  const result: Record<string, NatSpecEvent> = {}

  for (const sig of signatures) {
    const key = keyMap.get(sig)!
    const name = extractName(sig)
    const user = userdoc.events?.[sig]
    const dev = devdoc.events?.[sig]

    result[key] = {
      signature: sig,
      name,
      ...(user?.notice && { notice: user.notice }),
      ...(dev?.details && { details: dev.details }),
      ...(dev?.params && Object.keys(dev.params).length > 0 && { params: dev.params }),
    }
  }

  return result
}

function parseErrors(
  userdoc: SourcifyUserDoc,
  devdoc: SourcifyDevDoc,
): Record<string, NatSpecErrorEntry> {
  const allSigs = new Set<string>([
    ...Object.keys(userdoc.errors ?? {}),
    ...Object.keys(devdoc.errors ?? {}),
  ])

  const signatures = [...allSigs]
  const keyMap = buildKeyMap(signatures)
  const result: Record<string, NatSpecErrorEntry> = {}

  for (const sig of signatures) {
    const key = keyMap.get(sig)!
    const name = extractName(sig)
    // Errors are arrays — take the first entry
    const user = userdoc.errors?.[sig]?.[0]
    const dev = devdoc.errors?.[sig]?.[0]

    result[key] = {
      signature: sig,
      name,
      ...(user?.notice && { notice: user.notice }),
      ...(dev?.details && { details: dev.details }),
      ...(dev?.params && Object.keys(dev.params).length > 0 && { params: dev.params }),
    }
  }

  return result
}

export function extractName(signature: string): string {
  const parenIndex = signature.indexOf('(')
  return parenIndex === -1 ? signature : signature.slice(0, parenIndex)
}

function buildKeyMap(signatures: string[]): Map<string, string> {
  const nameCount = new Map<string, number>()
  for (const sig of signatures) {
    const name = extractName(sig)
    nameCount.set(name, (nameCount.get(name) ?? 0) + 1)
  }

  const keyMap = new Map<string, string>()
  for (const sig of signatures) {
    const name = extractName(sig)
    keyMap.set(sig, nameCount.get(name)! > 1 ? sig : name)
  }

  return keyMap
}
