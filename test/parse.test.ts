import { parse, extractName } from '../src/parse'
import type { SourcifyUserDoc, SourcifyDevDoc } from '../src/types'

describe('extractName', () => {
  it('extracts bare name from signature', () => {
    expect(extractName('transfer(address,uint256)')).toBe('transfer')
  })

  it('returns string as-is when no parentheses', () => {
    expect(extractName('fallback')).toBe('fallback')
  })

  it('handles empty params', () => {
    expect(extractName('totalSupply()')).toBe('totalSupply')
  })
})

describe('parse', () => {
  const emptyUserDoc: SourcifyUserDoc = { kind: 'user' }
  const emptyDevDoc: SourcifyDevDoc = { kind: 'dev' }

  it('returns empty sections for empty docs', () => {
    const result = parse(emptyUserDoc, emptyDevDoc)
    expect(result.contract).toBeUndefined()
    expect(result.functions).toEqual({})
    expect(result.events).toEqual({})
    expect(result.errors).toEqual({})
  })

  describe('contract-level natspec', () => {
    it('parses contract-level docs', () => {
      const userdoc: SourcifyUserDoc = { kind: 'user', notice: 'A token contract' }
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        title: 'MyToken',
        author: 'Dev Team',
        details: 'Implementation of ERC-20',
      }

      const result = parse(userdoc, devdoc)
      expect(result.contract).toEqual({
        title: 'MyToken',
        author: 'Dev Team',
        notice: 'A token contract',
        details: 'Implementation of ERC-20',
      })
    })

    it('omits undefined fields', () => {
      const userdoc: SourcifyUserDoc = { kind: 'user' }
      const devdoc: SourcifyDevDoc = { kind: 'dev', title: 'MyToken' }

      const result = parse(userdoc, devdoc)
      expect(result.contract).toEqual({ title: 'MyToken' })
      expect(result.contract).not.toHaveProperty('author')
    })
  })

  describe('functions', () => {
    it('merges userdoc and devdoc for a function', () => {
      const userdoc: SourcifyUserDoc = {
        kind: 'user',
        methods: {
          'transfer(address,uint256)': { notice: 'Transfer tokens' },
        },
      }
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        methods: {
          'transfer(address,uint256)': {
            details: 'Moves tokens from sender to recipient',
            params: { to: 'Recipient address', amount: 'Amount to transfer' },
            returns: { _0: 'True if successful' },
          },
        },
      }

      const result = parse(userdoc, devdoc)
      expect(result.functions).toEqual({
        transfer: {
          signature: 'transfer(address,uint256)',
          name: 'transfer',
          notice: 'Transfer tokens',
          details: 'Moves tokens from sender to recipient',
          params: { to: 'Recipient address', amount: 'Amount to transfer' },
          returns: { _0: 'True if successful' },
        },
      })
    })

    it('handles function only in userdoc', () => {
      const userdoc: SourcifyUserDoc = {
        kind: 'user',
        methods: {
          'approve(address,uint256)': { notice: 'Approve spender' },
        },
      }

      const result = parse(userdoc, emptyDevDoc)
      expect(result.functions.approve).toEqual({
        signature: 'approve(address,uint256)',
        name: 'approve',
        notice: 'Approve spender',
      })
    })

    it('handles function only in devdoc', () => {
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        methods: {
          'balanceOf(address)': {
            details: 'Returns the balance',
            params: { account: 'The account' },
          },
        },
      }

      const result = parse(emptyUserDoc, devdoc)
      expect(result.functions.balanceOf).toEqual({
        signature: 'balanceOf(address)',
        name: 'balanceOf',
        details: 'Returns the balance',
        params: { account: 'The account' },
      })
    })

    it('uses full signature as key for overloaded functions', () => {
      const userdoc: SourcifyUserDoc = {
        kind: 'user',
        methods: {
          'safeTransferFrom(address,address,uint256)': { notice: 'Safe transfer' },
          'safeTransferFrom(address,address,uint256,bytes)': { notice: 'Safe transfer with data' },
        },
      }

      const result = parse(userdoc, emptyDevDoc)
      expect(result.functions).toHaveProperty('safeTransferFrom(address,address,uint256)')
      expect(result.functions).toHaveProperty('safeTransferFrom(address,address,uint256,bytes)')
      expect(result.functions).not.toHaveProperty('safeTransferFrom')
    })

    it('merges state variables as functions', () => {
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        stateVariables: {
          totalSupply: {
            details: 'Returns total token supply',
            returns: { _0: 'The total supply' },
          },
        },
      }

      const result = parse(emptyUserDoc, devdoc)
      expect(result.functions.totalSupply).toEqual({
        signature: 'totalSupply()',
        name: 'totalSupply',
        details: 'Returns total token supply',
        returns: { _0: 'The total supply' },
      })
    })

    it('uses name() for state variable with params not in methods', () => {
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        stateVariables: {
          balances: {
            details: 'Token balances per account',
            params: { account: 'The account address' },
            returns: { _0: 'The balance' },
          },
        },
      }

      const result = parse(emptyUserDoc, devdoc)
      // Should be balances() not balances(account) — NatSpec params are names, not types
      expect(result.functions.balances).toEqual({
        signature: 'balances()',
        name: 'balances',
        details: 'Token balances per account',
        params: { account: 'The account address' },
        returns: { _0: 'The balance' },
      })
    })

    it('does not duplicate state variable if already in methods', () => {
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        methods: {
          'totalSupply()': { details: 'From methods' },
        },
        stateVariables: {
          totalSupply: { details: 'From stateVariables' },
        },
      }

      const result = parse(emptyUserDoc, devdoc)
      const keys = Object.keys(result.functions)
      expect(keys.filter(k => extractName(k) === 'totalSupply')).toHaveLength(1)
      expect(result.functions.totalSupply.details).toBe('From methods')
    })

    it('omits empty params/returns', () => {
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        methods: {
          'pause()': { details: 'Pause the contract', params: {}, returns: {} },
        },
      }

      const result = parse(emptyUserDoc, devdoc)
      expect(result.functions.pause).not.toHaveProperty('params')
      expect(result.functions.pause).not.toHaveProperty('returns')
    })
  })

  describe('events', () => {
    it('merges userdoc and devdoc for an event', () => {
      const userdoc: SourcifyUserDoc = {
        kind: 'user',
        events: {
          'Transfer(address,address,uint256)': { notice: 'Emitted on transfer' },
        },
      }
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        events: {
          'Transfer(address,address,uint256)': {
            details: 'Logged when tokens move',
            params: { from: 'Sender', to: 'Recipient', value: 'Amount' },
          },
        },
      }

      const result = parse(userdoc, devdoc)
      expect(result.events.Transfer).toEqual({
        signature: 'Transfer(address,address,uint256)',
        name: 'Transfer',
        notice: 'Emitted on transfer',
        details: 'Logged when tokens move',
        params: { from: 'Sender', to: 'Recipient', value: 'Amount' },
      })
    })

    it('uses full signature as key for overloaded events', () => {
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        events: {
          'Transfer(address,address,uint256)': { details: 'ERC-20 transfer' },
          'Transfer(address,address,uint256,uint256)': { details: 'ERC-1155 transfer' },
        },
      }

      const result = parse(emptyUserDoc, devdoc)
      expect(result.events).toHaveProperty('Transfer(address,address,uint256)')
      expect(result.events).toHaveProperty('Transfer(address,address,uint256,uint256)')
    })
  })

  describe('errors', () => {
    it('parses error arrays from userdoc and devdoc', () => {
      const userdoc: SourcifyUserDoc = {
        kind: 'user',
        errors: {
          'InsufficientBalance(uint256,uint256)': [
            { notice: 'Not enough balance' },
          ],
        },
      }
      const devdoc: SourcifyDevDoc = {
        kind: 'dev',
        errors: {
          'InsufficientBalance(uint256,uint256)': [
            {
              details: 'Reverts when balance is too low',
              params: { available: 'Current balance', required: 'Needed amount' },
            },
          ],
        },
      }

      const result = parse(userdoc, devdoc)
      expect(result.errors.InsufficientBalance).toEqual({
        signature: 'InsufficientBalance(uint256,uint256)',
        name: 'InsufficientBalance',
        notice: 'Not enough balance',
        details: 'Reverts when balance is too low',
        params: { available: 'Current balance', required: 'Needed amount' },
      })
    })

    it('handles errors only in userdoc', () => {
      const userdoc: SourcifyUserDoc = {
        kind: 'user',
        errors: {
          'Unauthorized()': [{ notice: 'Caller not authorized' }],
        },
      }

      const result = parse(userdoc, emptyDevDoc)
      expect(result.errors.Unauthorized).toEqual({
        signature: 'Unauthorized()',
        name: 'Unauthorized',
        notice: 'Caller not authorized',
      })
    })
  })
})
