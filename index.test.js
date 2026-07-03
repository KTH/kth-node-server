'use strict'

const path = require('path')
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

function httpsGetJson(url) {
  return new Promise((resolve, reject) => {
    // Allow self-signed certificates for testing purposes
    const req = https.get(url, { rejectUnauthorized: false }, res => {
      let body = ''

      res.on('data', chunk => {
        body += chunk
      })

      res.on('end', () => {
        try {
          resolve(JSON.parse(body))
        } catch (error) {
          reject(error)
        }
      })
    })

    req.on('error', reject)
  })
}

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

    const json = await httpsGetJson('https://localhost:9090/test')
    expect(json).not.toBeUndefined()
    expect(json.status).toBe('ok')
  })
})
