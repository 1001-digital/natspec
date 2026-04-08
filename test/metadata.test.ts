import { toMetadata } from '../src/metadata'
import type { NatSpec } from '../src/types'

describe('toMetadata', () => {
  it('returns empty object for empty natspec', () => {
    const natspec: NatSpec = { functions: {}, events: {}, errors: {} }
    expect(toMetadata(natspec)).toEqual({})
  })

  it('converts functions with notice as description', () => {
    const natspec: NatSpec = {
      functions: {
        transfer: {
          signature: 'transfer(address,uint256)',
          name: 'transfer',
          notice: 'Transfer tokens to recipient',
          details: 'Internal implementation detail',
          params: { to: 'Recipient address', amount: 'Amount to transfer' },
          returns: { _0: 'True if successful' },
        },
      },
      events: {},
      errors: {},
    }

    const result = toMetadata(natspec)
    expect(result.functions).toEqual({
      transfer: {
        description: 'Transfer tokens to recipient',
        params: {
          to: { description: 'Recipient address' },
          amount: { description: 'Amount to transfer' },
        },
        returns: {
          _0: { description: 'True if successful' },
        },
      },
    })
  })

  it('falls back to details when no notice', () => {
    const natspec: NatSpec = {
      functions: {
        pause: {
          signature: 'pause()',
          name: 'pause',
          details: 'Pauses the contract',
        },
      },
      events: {},
      errors: {},
    }

    const result = toMetadata(natspec)
    expect(result.functions!.pause.description).toBe('Pauses the contract')
  })

  it('omits description when neither notice nor details exist', () => {
    const natspec: NatSpec = {
      functions: {
        foo: {
          signature: 'foo()',
          name: 'foo',
          params: { x: 'A param' },
        },
      },
      events: {},
      errors: {},
    }

    const result = toMetadata(natspec)
    expect(result.functions!.foo).not.toHaveProperty('description')
    expect(result.functions!.foo.params).toEqual({ x: { description: 'A param' } })
  })

  it('converts events', () => {
    const natspec: NatSpec = {
      functions: {},
      events: {
        Transfer: {
          signature: 'Transfer(address,address,uint256)',
          name: 'Transfer',
          notice: 'Emitted on transfer',
          params: { from: 'Sender', to: 'Recipient', value: 'Amount' },
        },
      },
      errors: {},
    }

    const result = toMetadata(natspec)
    expect(result.events).toEqual({
      Transfer: {
        description: 'Emitted on transfer',
        params: {
          from: { description: 'Sender' },
          to: { description: 'Recipient' },
          value: { description: 'Amount' },
        },
      },
    })
  })

  it('converts errors', () => {
    const natspec: NatSpec = {
      functions: {},
      events: {},
      errors: {
        InsufficientBalance: {
          signature: 'InsufficientBalance(uint256,uint256)',
          name: 'InsufficientBalance',
          notice: 'Not enough balance',
          params: { available: 'Current balance', required: 'Needed amount' },
        },
      },
    }

    const result = toMetadata(natspec)
    expect(result.errors).toEqual({
      InsufficientBalance: {
        description: 'Not enough balance',
        params: {
          available: { description: 'Current balance' },
          required: { description: 'Needed amount' },
        },
      },
    })
  })

  it('preserves overloaded function keys', () => {
    const natspec: NatSpec = {
      functions: {
        'safeTransferFrom(address,address,uint256)': {
          signature: 'safeTransferFrom(address,address,uint256)',
          name: 'safeTransferFrom',
          notice: 'Safe transfer',
        },
        'safeTransferFrom(address,address,uint256,bytes)': {
          signature: 'safeTransferFrom(address,address,uint256,bytes)',
          name: 'safeTransferFrom',
          notice: 'Safe transfer with data',
        },
      },
      events: {},
      errors: {},
    }

    const result = toMetadata(natspec)
    expect(result.functions).toHaveProperty('safeTransferFrom(address,address,uint256)')
    expect(result.functions).toHaveProperty('safeTransferFrom(address,address,uint256,bytes)')
  })

  it('omits sections with no entries', () => {
    const natspec: NatSpec = {
      functions: {
        foo: { signature: 'foo()', name: 'foo', notice: 'Does foo' },
      },
      events: {},
      errors: {},
    }

    const result = toMetadata(natspec)
    expect(result).toHaveProperty('functions')
    expect(result).not.toHaveProperty('events')
    expect(result).not.toHaveProperty('errors')
  })
})
