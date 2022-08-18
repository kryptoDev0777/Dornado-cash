const Web3 = require('web3')
const { hexToNumberString, toChecksumAddress, numberToHex } = require('web3-utils')
const VERSIONS = ['old', 'new']

// TODO: create constants, utils
// TODO: move _repeatUntilResult and _generateId to utils

export default (ctx, inject) => {
  const moduleOptions = {"id":1,"rpcUrl":"https://mainnet.infura.io/v3/undefined","rpcCallRetryAttempt":15,"blockGasLimit":7300000}

  const instance = class Provider {
    constructor(options) {
      this.address = ''
      this.version = 'new'

      this.config = options.config
      this.web3 = new Web3(new Web3.providers.HttpProvider(options.config.rpcUrl))
    }

    async initProvider(provider, { version }) {
      try {
        this.provider = provider

        await this._setVersion(version)
        return await this._initProvider()
      } catch (err) {
        throw new Error(`Provider method initProvider has error: ${err.message}`)
      }
    }

    initWeb3(rpcUrl) {
      try {
        if (!rpcUrl) {
          throw new Error(`Please set rpcUrl to params, current rpcUrl ${rpcUrl}`)
        }

        const web3 = new Web3(new Web3.providers.HttpProvider(rpcUrl))
        this.web3 = web3

        return web3
      } catch (err) {
        throw new Error(`Provider method initWeb3 has error: ${err.message}`)
      }
    }

    async sendRequest(params) {
      try {
        const request = (args) => (this.version === 'old' ? this._sendAsync(args) : this.provider.request(args))

        return await request(params)
      } catch (err) {
        throw new Error(`Provider method sendRequest has error: ${err.message}`)
      }
    }

    getWeb3(rpcUrl) {
      try {
        if (!rpcUrl) {
          throw new Error(`Please set url to params, current url ${rpcUrl}`)
        }

        return new Web3(rpcUrl)
      } catch (err) {
        throw new Error(`Provider method getWeb3 has error: ${err.message}`)
      }
    }

    getContract({ abi, address }) {
      return new this.web3.eth.Contract(abi, address)
    }

    async deployContract({ domain, deploymentActions, abi, address }) {
      try {
        const [{ bytecode, expectedAddress }] = deploymentActions.actions.filter((action) => action.domain === domain)

        const code = await this.web3.eth.getCode(expectedAddress)

        if (code !== '0x') {
          throw new Error('Already deployed')
        }

        const data = this.getContract({ abi, address }).methods.deploy(bytecode, deploymentActions.salt).encodeABI()

        const callParams = {
          method: 'eth_sendTransaction',
          params: [
            {
              from: this.address,
              to: this.getContract()._address,
              gas: numberToHex(6e6),
              gasPrice: '0x100000000',
              value: 0,
              data,
            },
          ],
          from: this.address,
        }

        return await this.sendRequest(callParams)
      } catch (err) {
        throw new Error(`Provider method deployContract has error: ${err.message}`)
      }
    }

    async contractRequest({ methodName, data, to, from, gas, value = 0 }) {
      const { rpcCallRetryAttempt, blockGasLimit } = this.config

      try {
        const params = {
          to,
          data,
          value,
          from: from || this.address,
          gas: gas || blockGasLimit + 100000,
        }

        return await this._repeatUntilResult(() => this.web3.eth[methodName](params), rpcCallRetryAttempt)
      } catch (err) {
        throw new Error(`Provider method contractRequest has error: ${err.message}`)
      }
    }

    async getBalance({ address }) {
      const { rpcCallRetryAttempt } = this.config

      try {
        const params = {
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }

        const balance = await this._repeatUntilResult(() => this.sendRequest(params), rpcCallRetryAttempt)

        return hexToNumberString(balance)
      } catch (err) {
        throw new Error(`Provider method getBalance has error: ${err.message}`)
      }
    }

    async waitForTxReceipt({ txHash }) {
      const { rpcCallRetryAttempt } = this.config

      try {
        const params = {
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        }

        return await this._repeatUntilResult(() => this.sendRequest(params), rpcCallRetryAttempt * 10)
      } catch (err) {
        throw new Error(`Provider method waitForTxReceipt has error: ${err.message}`)
      }
    }

    async batchRequest({ txs, callback }) {
      try {
        const txsPromisesBucket = []

        for (const [index, params] of txs.entries()) {
          const txPromise = this.sendRequest({
            method: 'eth_sendTransaction',
            params: [params],
          })

          await this._sleep(1000)

          if (!(index % 2) && index !== 0) {
            await txPromise
          }

          txsPromisesBucket.push(txPromise)
        }

        callback(txsPromisesBucket)

        return await Promise.all(txsPromisesBucket)
      } catch (err) {
        throw new Error(err.message)
      }
    }

    async checkNetworkVersion() {
      try {
        return await this.sendRequest({ method: 'net_version' })
      } catch (err) {
        throw new Error(`Provider method _checkNetworkVersion has error: ${err.message}`)
      }
    }

    on({ method, callback }) {
      try {
        this.provider.on(method, callback)
      } catch (err) {
        throw new Error(`Provider method _checkNetworkVersion has error: ${err.message}`)
      }
    }

    async _initProvider() {
      try {
        let request = () =>
          this.version === 'old' ? this.provider.enable() : this.sendRequest({ method: 'eth_requestAccounts' })

        if (this.provider.injectedRequest && typeof this.provider.injectedRequest === 'function') {
          request = () => this.provider.injectedRequest()
        }

        const [account] = await request()

        if (!account) {
          throw new Error('Locked metamask')
        }

        this.address = account

        this.provider.on('accountsChanged', (accounts) => this._onAccountsChanged(accounts))
        this.provider.on('chainChanged', (id) => this._onNetworkChanged({ id }))

        this.config.id = await this.checkNetworkVersion()

        return toChecksumAddress(account)
      } catch (err) {
        throw new Error(`Provider method _initProvider has error: ${err.message}`)
      }
    }

    _sleep(time) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve()
        }, time)
      })
    }

    _sendAsync({ method, params, from }) {
      const { id } = this.config

      switch (id) {
        case 77:
        case 99:
        case 100:
          from = undefined
          break
      }

      return new Promise((resolve, reject) => {
        const callback = (err, response) => {
          if (err || response.error) {
            reject(err)
          }

          resolve(response.result)
        }

        this.provider.sendAsync(
          {
            from,
            method,
            params,
            jsonrpc: '2.0',
            id: this._generateId(),
          },
          callback,
        )
      })
    }

    async _send({ method, params }) {
      try {
        return await this.provider.send(method, params)
      } catch (err) {
        throw new Error(`Provider method _send has error: ${err.message}`)
      }
    }

    _onNetworkChanged({ id }) {
      if (id) {
        this.network = id
        window.location.reload()
      }
    }

    _onAccountsChanged(accounts) {
      const [account] = accounts

      if (account) {
        this.address = toChecksumAddress(account)
        window.location.reload()
      }
    }

    async _setVersion(version) {
      try {
        if(version) {
          if (!VERSIONS.includes(version)) {
            throw new Error('Invalid version parameter.')
          }

          this.version = version
          return
        }

        return await this._checkVersion()
      } catch (err) {
        throw new Error(`Provider method _setVersion has error: ${err.message}`)
      }
    }

    _checkVersion() {
      if (this.provider && this.provider.request) {
        this.version = 'new'
      } else {
        this.version = 'old'
      }
    }

    _repeatUntilResult(action, totalAttempts, retryAttempt = 1) {
      return new Promise((resolve, reject) => {
        const iteration = async () => {
          try {
            const result = await action()

            if (!result) {
              if (retryAttempt <= totalAttempts) {
                retryAttempt++
                setTimeout(iteration, 1000 * retryAttempt)
              } else {
                return reject(new Error('Tx not minted'))
              }
            } else {
              resolve(result)
            }
          } catch (err) {
            reject(err)
          }
        }

        iteration()
      })
    }

    _generateId() {
      const date = Date.now() * Math.pow(10, 3);
      const extra = Math.floor(Math.random() * Math.pow(10, 3));
      return date + extra;
    }
  }

  const provider = new instance({ config: moduleOptions })

  inject('provider', provider)
  ctx.$provider = provider
}
