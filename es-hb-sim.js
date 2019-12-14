'use strict'

const maxApi = require("max-api")

process.on('uncaughtException', (err, origin) => {
  maxApi.post(`uncaught exception error: ${err}`)
  maxApi.post(`uncaught exception origin: ${origin}`)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  maxApi.post(`unhandled rejection reason: ${reason}`)
  maxApi.post(`unhandled rejection promise: ${promise}`)
  process.exit(1)
})

setImmediate(onLoad)

function onLoad() {
  maxApi.post(`node script loading:  ${__filename}`)
  const maxApiHandler = new MaxApiHandler()
}

class MaxApiHandler {
  constructor() {
    this.bind(this.setEsURL)
    this.bind(this.setMonitor)
    this.bind(this.report)
    this.bind(this.setStatus)
    this.bind(this.setUp)
    }

  setEsURL(_, esURL) { this.esURL = esURL }
  setMonitor(_, monitor) { this.monitor = monitor }
  setStatus(status) { this.status = status ? 'up' : 'down' }
  setUp(up) {
    this.up = 0
    this.down = 0
    up ? this.up = 1 : this.down = 1
  }

  report() {
    if (this.esURL == null) return maxApi.post('report(): esURL is not set')
    if (this.monitor == null) return maxApi.post('report(): monitor is not set')
    if (this.status == null) return maxApi.post('report(): status is not set')
    if (this.up == null) return maxApi.post('report(): up is not set')
    if (this.down == null) return maxApi.post('report(): down is not set')
  
    const doc = {
      agent: { type: 'heartbeat' },
      event: { dataset:	'uptime' },
      monitor: { 
        name: this.monitor,
        status: this.status,
      },
      summary: {
        up: this.up,
        down: this.down,
      }
    }

    maxApi.post(`woulda sent ${JSON.stringify(doc)}`)
  }

  bind(fn) {
    maxApi.addHandler(fn.name, (...args) => {
      maxApi.post(`called ${fn.name}(${args.join(', ')})`)
      return this[fn.name](...args)
    })
  }
}
