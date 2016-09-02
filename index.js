'use strict'

var fs = require('fs')
var express = require('express')
var server = express()
var path = require('path')
var httpServer = require('https')

/**
 * Initialize the server. Performed before startup.
 */

/**
 * Start the server.
 */
var myHttpServer = null
function start (options) {
  options = options || {}
  let {logging, useSsl, passphrase, pfx, cert, port} = options

  // Set default params
  const log = logging || {
    info(msg) {
      console.log(msg)
    },
    debug(msg) {
      console.log(msg)
    },
    trace(msg) {
      console.log(msg)
    }
  }

  port = port || 3000

  if (useSsl) {
    var options

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
    myHttpServer = httpServer.createServer(options, server).listen(port)
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
}

module.exports = server
module.exports.start = start
