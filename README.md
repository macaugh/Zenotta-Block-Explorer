# Zenotta Block Explorer

The open source repo for the Zenotta blockchain block explorer.


## Running the Block Explorer

The Zenotta block explorer can be run with Webpack's `dev-server`:

```
npm run start
```

But pulling data from the blockchain requires it to be run by the Express server, which 
is how the explorer will run in production. The server can be started with

```
npm run start-server
```