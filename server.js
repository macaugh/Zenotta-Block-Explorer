const express = require('express');
const path = require('path');
const calls = require('./utils/calls');
const cache = require('./utils/cache');

// Server setup
const app = express();
const port = process.env.PORT || 8090;

// Middleware
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Network connection
const storageNode = 'http://localhost:3001';

// Caches
const cacheCapacity = process.env.CACHE_CAPACITY || 100;
const bItemCache = new cache.NetworkCache(cacheCapacity);
const bNumCache = new cache.NetworkCache(cacheCapacity);


/** Fetch latest block */
app.get('/api/latestBlock', (_, res) => {
    console.log("Received request for latest block");
    const storagePath = `${storageNode}/latest_block`;

    calls.fetchLatestBlock(storagePath).then(latestBlock => {
        res.json(latestBlock);
    });

});

/** Fetch blockchain item */
app.post('/api/blockchainItem', (req, res) => {
    const hash = req.body.hash;
    console.log("Received request for blockchain item:", hash);

    const storagePath = `${storageNode}/blockchain_entry_by_key`;
    const posEntry = bItemCache.get(hash);

    if (!posEntry) {
        calls.fetchBlockchainItem(storagePath, hash).then(bItem => {
            bItemCache.add(hash, bItem);
            res.json(bItem);
        });

    } else {
        res.json(posEntry);
    }
    
});

/** Fetch block range */
app.post('/api/blockRange', (req, res) => {
    console.log("Received request for a range of block numbers:", req.body.nums);
    const storagePath = `${storageNode}/block_by_num`;

    calls.fetchBlockRange(storagePath, req.body.nums).then(blocks => {
        res.json(blocks);
    });
});

app.use(express.static('./public'));

// Let react-router handle routing
app.get('*', function (_, res) {
    res.sendFile('public/index.html', { root: path.join(__dirname, '/') });
});

app.listen(port, () => {
    console.log('Server started on port:' + port);
});