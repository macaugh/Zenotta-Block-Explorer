/** Extract transaction from block 0 to latest and saves them to a JSON file **/
const axios = require('axios');
const fs = require('fs');
const calls = require('./calls');


const BATCH_SIZE = 99
const FILENAME = 'transactions';

async function extractTxs(latestBlockNum) {
    console.log("LATEST BNUM", latestBlockNum);
    console.log('extractTXS');
    let jsonFile = await fetchJsonFile(FILENAME).then((res) => { return res ? res : null });

    if (jsonFile != null) {
        if (latestBlockNum && jsonFile.latestCheckedBlockNum < latestBlockNum) {
            let i = jsonFile.latestCheckedBlockNum;

            while (i < latestBlockNum) {
                const endBlock = i + BATCH_SIZE <= latestBlockNum ? i + BATCH_SIZE : latestBlockNum;
                const startBlock = i;

                console.log(startBlock, endBlock)

                let blockRange = await fetchBlockRange(startBlock, endBlock);
                if (blockRange) {
                    for (const d of blockRange) {
                        if (d[1].block.transactions.length > 0) {
                            jsonFile.transactions.push({ blockNum: d[1].block.header.b_num, txs: d[1].block.transactions })
                        }
                    }
                }
                jsonFile.latestCheckedBlockNum = endBlock;
                i += BATCH_SIZE + 1;
                createJsonFile(FILENAME, jsonFile);
            }
            await createJsonFile(FILENAME, jsonFile);
            console.log('Finished tsx extraction at block ', jsonFile.latestCheckedBlockNum);
        } else {
            console.log('No new transactions');
        }
    } else {
        console.log('No json file found.');
    }
}

async function fetchJsonFile(filename) {
    return axios.get(`http://localhost:8090/${filename}.json`).then(response => {
        const isJson = response.headers['content-type']?.search('application/json') != -1 ? true : false;
        return isJson ? JSON.parse(JSON.stringify(response.data)) : null;
    }).catch(error => {
        console.log(error)
    })
}

async function fetchBlockRange(startBlock, endBlock) {
    const nums = [...Array(endBlock - startBlock + 1).keys()].map(x => x + startBlock); // Generate number array from range
    return axios.post('http://localhost:8090/api/blockRange', { nums }).then(res => res.data);
}

async function createJsonFile(filename, data) {
    fs.writeFile(`public/${filename}.json`, JSON.stringify(data), "utf8", (err) => {
        if (err) console.log('error', err);
    });
}

module.exports = {
    extractTxs
};