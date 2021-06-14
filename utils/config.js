const fs = require('fs');
const DEFAULTS = {
    port: 8090,
    storageNode: "http://localhost:3001",
    cacheCapacity: 100
};

function getConfig(path) {
    const obj = JSON.parse(fs.readFileSync(path, 'utf8'));

    return {
        PORT: obj.port || DEFAULTS.port,
        STORAGE_NODE: obj.storageNode || DEFAULTS.storageNode,
        CACHE_CAPACITY: obj.cacheCapacity || DEFAULTS.cacheCapacity
    };
}

module.exports = {
    getConfig
}