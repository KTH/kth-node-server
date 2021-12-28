'use strict'

const path = require('path')
const fetch = require('node-fetch')
const https = require('https')
const server = require('./index')

// Accept self signed SSL cert
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const logger = {
  info: () => {},
  trace: () => {},
  debug: () => {},
}

// eslint-disable-next-line no-unused-vars
server.use('/test', (req, res, next) =>
  res.status(200).json({
    status: 'ok',
  })
)

describe('HTTP Server', () => {
  afterAll(() => jest.resetAllMocks())

  beforeEach(() => {
    jest.resetModules()
  })

  afterEach(() => {
    server.close()
  })

  test('can start the server', async () => {
    server.start({
      port: 3002,
      useSsl: false,
      logger,
    })
    const res = await fetch('http://localhost:3002/test')
    const json = await res.json()
    expect(json).not.toBeUndefined()
    expect(json.status).toBe('ok')
  })
  test('can start the server in secure mode', async () => {
    server.start({
      port: 9090,
      useSsl: true,
      pfx: path.join(__dirname, 'test/certs/withpassphrase.pfx'),
      passphrase: path.join(__dirname, 'test/certs/passphrase.txt'),
      logger,
    })

    const agent = new https.Agent({
      rejectUnauthorized: false,
    })

    const res = await fetch('https://localhost:9090/test', { agent })
    const json = await res.json()
    expect(json).not.toBeUndefined()
    expect(json.status).toBe('ok')
  })
})
