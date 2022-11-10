const fs = require('fs');
const express = require('express');
const https = require('https');
const path = require('path');
const cors = require('cors');
const calls = require('./utils/calls');
const config = require('./utils/config');
const DragonflyCache = require('dragonfly-cache').DragonflyCache;
const Semaphore = require('./utils/semaphore').Semaphore;
const { extractTxs } = require('./utils/getTransactions');

// Server setup
const app = express();
const env = process.env.NODE_ENV || 'production';
const fullConfig = env == 'production' ? config.getConfig('./serverConfig.json') : config.getConfig('');
const port = process.env.PORT || fullConfig.PORT;

console.log(`Starting server in ${env} mode`);

// Middleware
if (env == 'development') {
    app.use(cors());
} else if (env == 'production') {
    const httpsOptions = {
        ca: fs.readFileSync("public/chain.pem", 'utf8'),
        key: fs.readFileSync("public/privkey.pem", 'utf8'),
        cert: fs.readFileSync("public/cert.pem", 'utf8')
    };
}

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Caches
const blocksCache = new DragonflyCache();
const txsCache = new DragonflyCache();
const bNumCache = new DragonflyCache();

// Semaphore
const throttler = new Semaphore(1); // Semaphore to limit the number of concurrent requests to 1

/** Fetch latest block */
app.post('/api/latestBlock', (req, res) => {
    const network = req.body.network;
    const storagePath = `${fullConfig.PROTOCOL}://${network.sIp}:${network.sPort}/latest_block`;

    calls.fetchLatestBlock(storagePath).then(latestBlock => {
        try {
            throttler.callFunction(extractTxs, latestBlock.content.block.header.b_num, network, fullConfig).then(res => console.log(res)).catch(err => console.log(err));
        } catch (error) {
            console.log('Failed to retrive latest block: ', error);
        }
        res.json(latestBlock);
    }).catch(error => {
        res.status(500).send(error);
    });
});

/** Fetch blockchain item */
app.post('/api/blockchainItem', (req, res) => {
    const network = req.body.network;
    const hash = req.body.hash;
    const storagePath = `${fullConfig.PROTOCOL}://${network.sIp}:${network.sPort}/blockchain_entry`;
    const genesisTxRegex = /0{5}[0-9]/;
    const isBlock = hash[0] !== 'g' && !hash.match(genesisTxRegex);

    let posEntry = null;

    if (isBlock)
        posEntry = blocksCache.get(hash);
    else  // Transaction
        posEntry = txsCache.get(hash);


    if (!posEntry) {
        calls.fetchBlockchainItem(storagePath, hash).then(bItem => {
            if (bItem.content.hasOwnProperty('Block')) {
                blocksCache.add(hash, bItem.content);
            } else if (bItem.content.hasOwnProperty('Transaction')) {
                txsCache.add(hash, bItem.content);
            }
            res.json(bItem.content);
        }).catch(error => {
            res.status(500).send(error);
        });
    } else { // Serving from cache
        res.json(posEntry);
    }
});

/** Fetch block range */
app.post('/api/blockRange', (req, res) => {
    const network = req.body.network;
    const storagePath = `${fullConfig.PROTOCOL}://${network.sIp}:${network.sPort}/block_by_num`;
    let nums = Array.isArray(req.body.nums) ? req.body.nums.filter(num => Number.isFinite(num)) : [];
    let unknowns = [];
    let knowns = [];

    for (let n of nums) {
        let posEntry = bNumCache.get(n);

        if (posEntry) {
            knowns.push(posEntry);
        } else {
            unknowns.push(n);
        }
    }

    if (unknowns.length) {
        calls.fetchBlockRange(storagePath, unknowns).then(response => {
            if (response.status == 'Success' && response.content.length) {
                for (let b of response.content) {
                    bNumCache.add(b[1].block.header.b_num, b);
                    // Add to blocksCache too coz why not
                    if (!blocksCache.get(b[0])) {
                        blocksCache.add(b[0], { "Block": b[1] });
                    }
                    knowns.push(b);
                }
                res.json(knowns);
            }
        }).catch(error => {
            res.status(500).send(error);
        });
    } else {
        res.json(knowns);
    }
});

app.use(express.static('./public'));

// Let react-router handle routing
app.get('*', function (_, res) {
    res.sendFile('public/index.html', { root: path.join(__dirname, '/') });
});

if (env == 'development') {
    app.listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
} else if (env == 'production') {
    https.createServer(httpsOptions, app).listen(port, () => {
        console.log(`Server listening on port ${port}`);
    });
}
