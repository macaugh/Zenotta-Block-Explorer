/** Extract transaction from block 0 to latest and saves them to a JSON file **/
const axios = require('axios');
const fs = require('fs');

const BATCH_SIZE = 99
const FILENAME = 'Txs';

/**
 * Extract transaction from latest checked block to latest block and saves them to a JSON file
 * Temporary solution until db is implemented
 * @param {*} latestBlockNum 
 * @param {*} network 
 */
async function extractLatestTxs(latestBlockNum, network, config) {
    return await new Promise(async (resolve, reject) => {
        console.log('\nCheck for latest txs...');
        const filePrefix = network.name.split(' ')[0].toLowerCase();

        let err = null;
        let jsonFile = await fetchJsonFile(filePrefix + FILENAME).then((res) => { return res ? res : null }).catch((err) => { console.log('ERR', err); return null });

        if (jsonFile) {
            console.log(latestBlockNum && jsonFile.latestCheckedbNum < latestBlockNum, `${latestBlockNum} && ${jsonFile.latestCheckedbNum} < ${latestBlockNum}`)
            if (latestBlockNum && jsonFile.latestCheckedbNum < latestBlockNum) {
                let i = jsonFile.latestCheckedbNum;
                let nbTxs = 0;
                while (i < latestBlockNum) {
                    const endBlock = i + BATCH_SIZE <= latestBlockNum ? i + BATCH_SIZE : latestBlockNum;
                    const startBlock = i;

                    console.log(startBlock, endBlock)

                    let blockRange = await fetchBlockRange(startBlock, endBlock, network, config);
                    if (blockRange) {
                        for (const d of blockRange) {
                            if (d[1].block.transactions.length > 0) {
                                console.log(`${d[1].block.transactions.length} tx(s) in block ${d[1].block.header.b_num}`);
                                jsonFile.transactions.push({ bNum: d[1].block.header.b_num, txs: d[1].block.transactions })
                                nbTxs += d[1].block.transactions.length;
                            }
                        }
                        jsonFile.latestCheckedbNum = endBlock; // Update latest checked block number
                        i += BATCH_SIZE + 1; // Increment i by batch size
                        writeToJsonFile(filePrefix + FILENAME, jsonFile);
                    } else {
                        err = 'Error while fetching block range';
                        break;
                    }
                }
                writeToJsonFile(filePrefix + FILENAME, jsonFile).then(() => {
                    let msg = `No new tx(s) found \nFinished at block ${jsonFile.latestCheckedbNum}`;
                    if (nbTxs > 0)
                        msg = `Extracted total of ${nbTxs} tx(s) \nFinished at block ${jsonFile.latestCheckedbNum}`;
                    resolve(`\n${msg}`);
                });
            } else {
                err = 'No new blocks to check';
            }
        } else {
            err = 'Error while fetching json file';
        }
        if (err)
            reject(err);
    });
}

async function fetchBlockRange(startBlock, endBlock, network, config) {
    const nums = [...Array(endBlock - startBlock + 1).keys()].map(x => x + startBlock); // Generate number array from range
    return axios.post(`${config.LOCAL_NODE}:${config.LOCAL_PORT}/api/blockRange`, { nums, network: network })
        .then(res => {
            return res.data
        })
        .catch(err => {
            return null
        });
}

async function fetchJsonFile(filename) {
    let jsonData = fs.readFileSync(`public/${filename}.json`, "utf8",
        function (err, data) {
            if (err) {
                console.log('read file error', err);
                return null
            } else {
                return data
            }
        });

    return JSON.parse(jsonData);
}

async function writeToJsonFile(filename, data) {
    fs.writeFile(`public/${filename}.json`, JSON.stringify(data), "utf8", (err) => {
        if (err) console.log('write file error', err);
    });
}

module.exports = {
    extractTxs: extractLatestTxs
};