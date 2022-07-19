const axios = require('axios');

// Fetch the latest block from the specified path
function fetchLatestBlock(path) {
    return axios.get(path).then(async (response) => {
        return response.data;
    }).catch((error) => {
        console.error(`Fetch of LATEST BLOCK failed with status code ${error}`)
        throw(error);
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
        console.error(`Fetch of BLOCKCHAIN ITEM failed with status code ${error}`)
        throw(error);
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
        console.error(`Fetch of BLOCK RANGE failed with status code ${error}`);
        throw(error);
    });
}

module.exports = {
    fetchBlockRange,
    fetchLatestBlock,
    fetchBlockchainItem
};