/* eslint-env mocha */
'use strict'
const expect = require('chai').expect
const request = require('request')
const path = require('path')

const server = require('../index')

// Accept self signed SSL cert
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

server.use('/test', function (req, res, next) {
  // console.log('======= GET')
  return res.status(200).json({
    status: 'ok'
  })
})

const logger = {
  info: () => {},
  trace: () => {},
  debug: () => {}
}

describe('HTTP Server', function () {
  before((done) => {
    server.start({
      port: 9090,
      useSsl: false,
      logger
    }).then((res) => {
      done()
    })
  })

  after((done) => {
    server.close().then(() => {
      done()
    })
  })

  it('can start the server', (done) => {
    request.get({
      url: 'http://localhost:9090/test'
    }, (err, resp, body) => {
      expect(err).to.equal(null)

      const jsonBody = JSON.parse(body)
      expect(jsonBody.status).to.equal('ok')
      done()
    })
  })
})

describe('Secure HTTPS Server with .pfx and passphrase', function () {
  before((done) => {
    server.start({
      port: 9090,
      useSsl: true,
      pfx: path.join(__dirname, 'certs/withpassphrase.pfx'),
      passphrase: path.join(__dirname, 'certs/passphrase.txt'),
      logger
    }).then((res) => {
      done()
    })
  })

  after((done) => {
    server.close().then(() => {
      done()
    })
  })

  it('can start the server', (done) => {
    request.get({
      url: 'https://localhost:9090/test'
    }, (err, resp, body) => {
      expect(err).to.equal(null)

      const jsonBody = JSON.parse(body)
      expect(jsonBody.status).to.equal('ok')
      done()
    })
  })
})
