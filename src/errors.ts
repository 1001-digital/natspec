export class NatSpecError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'NatSpecError'
  }
}

export class NatSpecFetchError extends NatSpecError {
  public readonly status: number
  public readonly chainId: number
  public readonly address: string

  constructor(
    message: string,
    details: { status: number; chainId: number; address: string },
    options?: ErrorOptions,
  ) {
    super(message, options)
    this.name = 'NatSpecFetchError'
    this.status = details.status
    this.chainId = details.chainId
    this.address = details.address
  }
}

export class NatSpecNotFoundError extends NatSpecError {
  public readonly chainId: number
  public readonly address: string

  constructor(chainId: number, address: string) {
    super(`Contract not found on Sourcify: chain ${chainId}, address ${address}`)
    this.name = 'NatSpecNotFoundError'
    this.chainId = chainId
    this.address = address
  }
}
