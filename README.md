<!--- PROJECT LOGO --->

<div align="center">
    <a>
        <img src="https://github.com/Zenotta/Block-Explorer/blob/main/assets/hero.svg" alt="Block Explorer Logo" style="width: 350px">
    </a>

    <h3 align="center">Zenotta Block Explorer</h3>

    <p align="center">
        The repo of Zenotta's block explorer
        <br />
        <br />
        <a href="https://zenotta.io"><strong>Official documentation »</strong></a>
        <br />
        <br />
    </p>
</div>

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
