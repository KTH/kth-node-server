'use strict'

var fs = require('fs')
var express = require('express')
var server = express()
var path = require('path')
var httpServer = require('https')

let config, initCallback, log

/**
 * Initialize the server. Performed before startup.
 */
function _init () {
  initCallback()
}

/**
 * Start the server.
 */
var myHttpServer = null
function _start () {
  if (config.full.useSsl) {
    var options

    if (config.full.ssl.passphrase && config.full.ssl.pfx) {
      var password = fs.readFileSync(config.full.ssl.passphrase) + ''
      password = password.trim()
      log.info('Setting key for HTTPS(pfx): ' + config.full.ssl.pfx)
      options = {
        pfx: fs.readFileSync(config.full.ssl.pfx),
        passphrase: password
      }
    } else {
      options = {
        key: fs.readFileSync(config.full.ssl.key),
        cert: fs.readFileSync(config.full.ssl.cert),
        ca: fs.readFileSync(config.full.ssl.ca)
      }
      log.info('Setting key for HTTPS(cert): ' + config.full.ssl.cert)
    }

    log.info('Secure(HTTPS) server started, listening at ' + config.full.port)
    myHttpServer = httpServer.createServer(options, server).listen(config.full.port)
  } else {
    log.info('Server started, listening at ' + config.full.port)
    server.listen(config.full.port)
  }

  /**
   * Close event of the server
   */
  server.on('close', function () {
    log.info('Server received close event')
  })

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

/**
 * Expose the server and start and init methods.
 */
module.exports = server
module.exports.init = _init
module.exports.start = _start

module.exports.setConfig = function (_conf) {
  config = _conf
}

module.exports.setInitCallback = function (_cb) {
  initCallback = _cb
}

module.exports.setLog = function (_log) {
  log = _log
}
