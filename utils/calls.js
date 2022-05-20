const axios = require('axios');

// Fetch the latest block from the specified path
function fetchLatestBlock(path) {
    return axios.get(path).then(async (response) => {
        return response.data;
    });
}

// Fetch the blockchain item with the given hash from the specified path
function fetchBlockchainItem(path, hash) {
    return axios.post(path,
        `"${hash}"`, {
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        return response.data;
    }).catch((error) => {
        console.error(`Fetch of blockchain item failed with status code ${error}`)
        console.error(error.data)
    });
}

// Fetch a range of blocks by block number
function fetchBlockRange(path, nums) {
    return axios({
        url: path,
        method: 'POST',
        data: nums,
        headers: {
            "Content-Type": "application/json",
        }
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.error(`Fetch of blocks by number failed with status code ${error}`);
        console.error(error.data);
    });
}

module.exports = {
    fetchBlockRange,
    fetchLatestBlock,
    fetchBlockchainItem
};