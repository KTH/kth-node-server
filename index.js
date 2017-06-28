'use strict'

const fs = require('fs')
const express = require('express')
const app = express()
const assert = require('assert')

/**
 * Initialize the server. Performed before startup.
 */
let server
let _logger
/**
 * Closing the server
 * @param signal the log message depending on the given signal.
 */
function serverClose (signal, done) {
  _logger.info('Process received ' + signal + ', exiting ....')
  if (done === undefined) {
    done = function () {
      process.exit(0)
    }
  }
  if (server) {
    server.close(done)
  } else {
    done()
  }
}

function start (params = {}) {
  let {logger, useSsl, passphrase, key, ca, pfx, cert, port} = params

  // Set default params
  _logger = logger || {
    info (msg) {
      console.log(msg)
    },
    debug (msg) {
      console.log(msg)
    },
    trace (msg) {
      console.log(msg)
    },
    error (msg) {
      console.error(msg)
    }
  }

  if (useSsl) {
    if (!pfx && !cert) {
      assert(false, 'Missing pfx or cert required for SSL')
    }

    if (pfx) {
      assert(passphrase, 'When using pfx we also require a passphrase. Should be path to file')
    }

    if (cert) {
      assert(ca, 'Missing ca required for SSL with cert. Should be path to file')
      assert(key, 'Missing key required for SSL with cert. Should be path to file')
    }
  }

  if (cert || pfx) {
    assert(useSsl, 'You are passing a cert or pfx but not enabling SSL')
  }

  port = port || 3000

  if (useSsl) {
    let options

    if (pfx) {
      var password = fs.readFileSync(passphrase) + ''
      password = password.trim()
      _logger.info('Setting key for HTTPS(pfx): ' + pfx)
      options = {
        pfx: fs.readFileSync(pfx),
        passphrase: password
      }
    } else {
      options = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert),
        ca: fs.readFileSync(ca)
      }
      _logger.info('Setting key for HTTPS(cert): ' + cert)
    }
  }

  if (useSsl) {
    _logger.info('using Secure(HTTPS) server')
    server = require('https').createServer(options, app)
  } else {
    server = require('http').createServer(app)
    _logger.info('using http')
  }

  return new Promise((resolve, reject) => {
    try {
      server.listen(port, resolve)
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = app

// .start and .close returns a promise
module.exports.start = start

module.exports.close = function () {
  return new Promise(function (resolve, reject) {
    try {
      serverClose('SIGHUP', () => {
        resolve()
      })
    } catch (e) {
      reject(e)
    }
  })
}
