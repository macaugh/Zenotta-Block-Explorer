# Zenotta Block Explorer

The open source repo for the Zenotta blockchain block explorer.

## Set Up and Run

The block explorer can be run in a dev environment using the following

```bash
npm install

# In one tab
npm run start-server-dev

# In another tab
npm run start-dev
```

If you'd like to run the explorer yourself somewhere in a production 
environment, you can do this by running

```bash
npm run build
npm run start
```

You can also change the configuration for the server by editing the parameters 
in `serverConfig.json` before running the above.
