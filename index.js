'use strict'

var fs = require('fs')
var express = require('express')
var server = express()
var httpServer = require('https')
var assert = require('assert')

/**
 * Initialize the server. Performed before startup.
 */

/**
 * Start the server.
 */
var myHttpServer = null
function start (params = {}) {
  options = options || {}
  let {logging, useSsl, passphrase, key, ca, pfx, cert, port} = params

  if (useSsl) {
    assert(cert, 'Missing cert required for SSL')

    if (!passphrase && !key) {
      assert(false, 'Missing key or passphrase required for SSL')
    }

    if (passphrase) {
      assert(pfx, 'Missing pfx required for SSL with passphrase')
    }

    if (key) {
      assert(ca, 'Missing ca required for SSL with key')
    }
  }

  if (cert) {
    assert(useSsl, 'You are passing a cert but not enabling SSL')
  }

  // Set default params
  const log = logging || {
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

  port = port || 3000

  if (useSsl) {
    let options

    if (passphrase && pfx) {
      var password = fs.readFileSync(passphrase) + ''
      password = password.trim()
      log.info('Setting key for HTTPS(pfx): ' + pfx)
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
      log.info('Setting key for HTTPS(cert): ' + cert)
    }

    log.info('Secure(HTTPS) server started, listening at ' + port)
    myHttpServer = htts.createServer(options, server).listen(port)
  } else {
    log.info('Server started, listening at ' + port)
    server.listen(port)
  }

  /**
   * Closing the server
   * @param signal the log message depending on the given signal.
   */
  function serverClose (signal) {
    log.info('Process received ' + signal + ', exiting ....')
    if (myHttpServer) {
      myHttpServer.close(function () {
        process.exit(0)
      })
    } else {
      process.exit(0)
    }
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

  /**
   * A list of promises which listen to different
   * events in the application which need to resolved
   * until the server is fully started.
   *
   * By adding a new promise in the list below the
   * <code>serverStartedPromise</code> will wait
   * for that promise (and the rest of the promises
   * in the array) to resolve.
   */
  var serverStartedPromise = Promise.all([
    createEventPromise('event:strategyInitialized')
  ])

  serverStartedPromise.then(function () {
    server.emit('event:serverStarted', 'true')
  })
  return Promise.resolve()
}

/**
 * Create an Promise which listen for a event.
 *
 * @param eventName - for the event that the promise will listen for
 * @returns {Promise} A Promise which will resolve when the event fires
 */
function createEventPromise (eventName) {
  return new Promise(
    function (resolve, reject) {
      server.on(eventName, function (initialized) {
        if (initialized) {
          resolve()
        } else {
          reject()
        }
      })
    }
  )
}

module.exports = server
module.exports.start = start
