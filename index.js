'use strict'

var fs = require('fs')
var express = require('express')
var server = express()
var httpsServer = require('https')
var assert = require('assert')

/**
 * Initialize the server. Performed before startup.
 */

/**
 * Start the server.
 */
var _httpServer = null
var _logger
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
  if (_httpServer) {
    _httpServer.close(done)
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
    }
  }

  if (useSsl) {
    // assert(cert, 'Missing cert required for SSL')

    if (!passphrase && !key) {
      assert(false, 'Missing key or passphrase required for SSL')
    }

    if (passphrase) {
      assert(pfx, 'Missing pfx required for SSL with passphrase')
    }

    /*if (key) {
      assert(ca, 'Missing ca required for SSL with key')
    }*/
  }

  if (cert) {
    assert(useSsl, 'You are passing a cert but not enabling SSL')
  }

  port = port || 3000

  if (useSsl) {
    let options

    if (passphrase && pfx) {
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

    var httpServer = httpsServer.createServer(options, server).listen(port)
  } else {
    var httpServer = server
  }

  // close down gracefully on sigterm, sighup and sigint
  process.on('SIGTERM', function () {
    serverClose('SIGTERM')
  })

  process.on('SIGHUP', function () {
    serverClose('SIGHUP')
  })

  process.on('SIGINT', function () {
    serverClose('SIGINT')
  })

  return new Promise(function(resolve, reject) {
    try {
      _httpServer = httpServer.listen(port, () => {
        if (useSsl) {
          _logger.info('Secure(HTTPS) server started, listening at ' + port)
        } else {
          _logger.info('Server started, listening at ' + port)
        }
        resolve(module.exports)
      })
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = server

// .start and .close returns a promise
module.exports.start = start
module.exports.close = function () {
  return new Promise(function(resolve, reject) {
    try {
      serverClose('SIGHUP', () => {
        resolve()
      })
    } catch (e) {
      reject(e)
    }
  })
}
