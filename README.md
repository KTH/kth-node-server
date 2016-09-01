# kth-node-server

A wrapper around express.
In it's most basic usage, it just exposes an express app, but it has support for starting with ssl.

## Simple usage, starts a server on http
```
const app = require('kth-node-server')
app.start()
```
## Start with options
```
const app = require('kth-node-server')
app.start(options)
```
### options:
| Option        | Default       | Description  |
| ------------- |:-------------:| ------------:|
| useSsl      | false | Whether ssl should be used or not |
| logging       | console | other logging (bunyan for instance) |
| passphrase |       | Passphrase for certificate|
| pfx |       | pfx for ssl|
| cert |       | certificate for ssl|
| port | 3000      | Port to run the server|


