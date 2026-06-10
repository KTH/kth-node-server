# @kth/server

A wrapper around Express.

In its most basic usage, it exposes an Express app, but it also supports starting with SSL.

## Requirements

- Node.js `>=24`

## Simple usage, starts a server on http

Start returns a promise that resolves when startup is complete.

```JavaScript
const app = require('@kth/server')
app.start()
  .then((res) => {
    // Do something...
  })
```

The import returns an Express.js instance, so you can add middleware and functions just as in a normal Express app:

```JavaScript
app.get('/', function (req, res) {
  res.send('Hello world!')
})
```

To stop the instance you call app.close() which returns a promise that resolves when done.

```JavaScript
app.close()
  .then(() => {
    // Do something...
  })
```

## Start server with options

### Secure HTTPS

```JavaScript
const app = require('@kth/server')

const optionsForSsl = {
  useSsl: true,
  pfx: '/path/to/file.pfx',
  passphrase: '/path/to/file.txt',
  port: 3000, // Optional, defaults to 3000
  logger: console // Optional, defaults to console
}

app.start(optionsForSsl)
```

### Plain HTTP

```JavaScript
const app = require('@kth/server')

const optionsForSsl = {
  port: 3000, // Optional, defaults to 3000
  logger: console // Optional, defaults to console
}

app.start(optionsForSsl)
```

## Creating a self-signed cert for testing

```
  $ openssl genrsa 2048 > test/certs/private.pem
  $ openssl req -x509 -days 1000 -new -key test/certs/private.pem -out test/certs/public.pem -subj "/C=SE/ST=SWEDEN/L=Stockholm/O=kth-node-server/CN=www.test.com"
  $ openssl pkcs12 -export -in test/certs/public.pem -inkey test/certs/private.pem -passout pass:test -out test/certs/withpassphrase.pfx
  $ echo 'test' >> test/certs/passphrase.txt
  $ rm test/certs/private.pem test/certs/public.pem
```
