const express = require('express');
const https = require('https');
const path = require('path');
const cors = require('cors');
const calls = require('./utils/calls');
const config = require('./utils/config');
const DragonflyCache = require('dragonfly-cache').DragonflyCache;
const httpsOptions = {
    ca: fs.readFileSync("ca_bundle_explorer.crt"),
    key: fs.readFileSync("private_explorer.key"),
    cert: fs.readFileSync("certificate_explorer.crt")
};

const { extractTxs } = require('./utils/getTransactions');

// Server setup
const app = express();
const fullConfig = config.getConfig("./serverConfig.json");
const port = process.env.PORT || fullConfig.PORT;
const env = process.env.NODE_ENV || 'production';

console.log(`Starting server in ${env} mode`);

// Middleware
if (env == 'development') {
    app.use(cors());
}

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Network connection
const storageNode = fullConfig.STORAGE_NODE;
// const computeNode = fullConfig.COMPUTE_NODE;

// Caches
const cacheCapacity = fullConfig.CACHE_CAPACITY;
const blocksCache = new DragonflyCache();
const txsCache = new DragonflyCache();
const bNumCache = new DragonflyCache();

/** Fetch latest block */
app.post('/api/latestBlock', (req, res) => {
    const network = req.body.network;

    console.log('network', network);
    const storagePath = `${fullConfig.PROTOCOL}://${network.sIp}:${network.sPort}/latest_block`;

    calls.fetchLatestBlock(storagePath).then(latestBlock => {
        try {
            extractTxs(latestBlock.content.block.header.b_num); // Extract transaction data to json file
        } catch (error) {
            console.log('Failed to retrive latest transactions: ', error);
        }
        res.json(latestBlock);
    })
        .catch(error => {
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

    if (isBlock) {
        posEntry = blocksCache.get(hash);
        console.log('retrieved from cache', posEntry);
    } else { // Transaction
        posEntry = txsCache.get(hash);
        console.log('retrieved from cache', posEntry);
    }

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
                    console.log('adding to cache', b);
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

https
  .createServer(httpsOptions, app)
  .listen(port, ()=>{
    console.log(`server is runing at port ${port}`)
  });