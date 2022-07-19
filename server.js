const express = require('express');
const path = require('path');
const cors = require('cors');
const calls = require('./utils/calls');
const cache = require('./utils/cache');
const config = require('./utils/config');

const { extractTxs } = require('./utils/getTransactions');

// Server setup
const app = express();
const fullConfig = config.getConfig("./serverConfig.json");
const port = fullConfig.PORT;
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
const bItemCache = new cache.NetworkCache(cacheCapacity * 3);
const bNumCache = new cache.NetworkCache(cacheCapacity);

/** Fetch latest block */
app.get('/api/latestBlock', (_, res) => {
    const storagePath = `${storageNode}/latest_block`;

    calls.fetchLatestBlock(storagePath).then(latestBlock => {
        extractTxs(latestBlock.block.header.b_num); // Extract transaction data to json file
        console.log('Latest block: ', latestBlock.block.header.b_num);
        res.json(latestBlock);
    })
    .catch(error => {
        res.status(500).send(error);
    });

});

/** Fetch blockchain item */
app.post('/api/blockchainItem', (req, res) => {
    const hash = req.body.hash;
    const storagePath = `${storageNode}/blockchain_entry_by_key`;
    const posEntry = bItemCache.get(hash);

    if (!posEntry) {
        calls.fetchBlockchainItem(storagePath, hash).then(bItem => {
            bItemCache.add(hash, bItem);
            res.json(bItem);
        }).catch(error => {
            res.status(500).send(error);
        });
    } else { // Serving from cache
        res.json(posEntry);
    }

});

/** Fetch block range */
app.post('/api/blockRange', (req, res) => {
    const storagePath = `${storageNode}/block_by_num`;
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
        calls.fetchBlockRange(storagePath, unknowns).then(blocks => {
            if (blocks && blocks.length) {
                for (let b of blocks) {
                    bNumCache.add(b[1].block.header.b_num, b);

                    // Add to bItemCache too coz why not
                    if (!bItemCache.get(b[0])) {
                        bItemCache.add(b[0], { "Block": b[1] });
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

app.listen(port, () => {
    console.log('Server started on port:' + port);
});