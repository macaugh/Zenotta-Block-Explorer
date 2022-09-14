const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Fetch the latest block from the specified path
function fetchLatestBlock(path) {
    const requestId = uuidv4().replace(/-/g,'');
    return axios.get(path, {
        headers: {
          'x-request-id': requestId
        }
      }).then(async (response) => {
        return response.data;
    }).catch((error) => {
        console.error(`Fetch of LATEST BLOCK failed with status code ${error}`)
        throw(error);
    });
}

// Fetch the blockchain item with the given hash from the specified path
function fetchBlockchainItem(path, hash) {
    const requestId = uuidv4().replace(/-/g,'');
    return axios.post(path,
        `"${hash}"`, {
        headers: {
            'Content-Type': 'application/json',
            'x-request-id': requestId
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
    const requestId = uuidv4().replace(/-/g,'');
    return axios({
        url: path,
        method: 'POST',
        data: nums,
        headers: {
            "Content-Type": "application/json",
            'x-request-id': requestId
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