import axios from "axios";
import { action, makeAutoObservable, observable } from "mobx";
import { RequestData, RequestBlock, MiningTxHashAndNoceData, BlockData, TransactionData, ItemType, TransactionTableData } from "../interfaces";

const FILENAME = 'transactions';

class Store {
    constructor() {
        makeAutoObservable(this)
    }

    @observable latestBlock: RequestBlock | null = null;
    @observable blocksTableData: RequestData[] = [];
    @observable latestTx: TransactionData | null = null;
    @observable txsTableData: TransactionTableData[] = [];
    @observable nbTxs: number = 0;
    @observable blockchainItemCache: any = {};

    /** SET */

    @action setTxsTableData(tableData: any) {
        this.txsTableData = tableData;
    }

    @action setLatestBlock(block: RequestBlock) {
        this.latestBlock = block;
    }

    @action setBlockTableData(tableData: RequestData[]) {
        this.blocksTableData = tableData;
    }

    @action setBcItemCache(key: string, value: any) {
        this.blockchainItemCache[key] = value;
    }

    @action setNbTxs(nbTxs: number) {
        this.nbTxs = nbTxs;
    }

    /** BLOCK */

    @action
    async fetchLatestBlock() {
        await axios.get('http://localhost:8090/api/latestBlock').then(async (response) => {
            this.setLatestBlock(this.formatBlock(response.data));
        });
    }

    @action async fetchBlockchainItem(hash: string): Promise<RequestBlock | TransactionData> {
        let bItemData = null;
        if (Object.keys(this.blockchainItemCache).indexOf(hash) == -1) {
            bItemData = await axios.post(`http://localhost:8090/api/blockchainItem`, { hash }).then(res => res.data);
            this.setBcItemCache(hash, bItemData);
        } else {
            bItemData = this.blockchainItemCache[hash];
        }

        let itemType = Object.getOwnPropertyNames(bItemData)[0]

        if (itemType === 'Block') {
            return this.formatBlock(bItemData.Block);
        } else if (itemType === 'Transaction') {
            return this.formatTxs(bItemData.Transaction);
        }
        return bItemData
    }

    @action
    async fetchBlockRange(startBlock: number, endBlock: number): Promise<RequestData[]> {
        const nums = [...Array(endBlock - startBlock + 1).keys()].map(x => x + startBlock); // Generate number array from range
        let data = await axios.post('http://localhost:8090/api/blockRange', { nums }).then(res => res.data);
        return this.formatBlockSet(data)
    }

    @action
    async fetchBlocksTableData(pageNumber: number, maxBlocks: number) {
        const latestBh = this.getLatestBlockHeight();
        if (latestBh) {
            const start = latestBh - (pageNumber * maxBlocks);
            const end = start + maxBlocks;
            const resp = await this.fetchBlockRange(start < 0 ? 0 : start + 1, end);
            this.setBlockTableData(resp.reverse());
        }
    }

    @action
    async fetchBlockHashByNum(num: number) {
        let data = await axios.post('http://localhost:8090/api/blockRange', { nums: [num] }).then(res => res.data)
            .catch((error) => {
                console.error(`Fetch of block by number failed with status code ${error.status}`);
                console.error(error.data);
            });

        if (data.length) {
            return data[0][0];
        }

        return null;
    }

    @action
    async searchHashIsValid(hash: string, type: string): Promise<{ isValid: boolean, error: string }> {
        const re = /^[0-9A-Ga-gx]+$/g;
        const reTest = re.test(hash);

        // This has to be a strict boolean check for some reason? Thanks JS
        if (reTest !== true) {
            return { isValid: false, error: 'Please provide a valid hash' };
        }

        if (type === 'Block' && (new TextEncoder().encode('foo')).length != 65) {
            return { isValid: false, error: 'Block hash is invalid' };
        }

        if (!await this.fetchBlockchainItem(hash)) {
            return { isValid: false, error: 'Blockchain item not found' };
        }

        return { isValid: true, error: '' };
    }

    @action
    async blockNumIsValid(num: number): Promise<{ isValid: boolean, error: string }> {
        if (!this.latestBlock) {
            await this.fetchLatestBlock();
        }
        // Check for NaN
        if (isNaN(num)) {
            return { isValid: false, error: 'Please provide a number to search by block number' };
        }
        // Check for negative
        if (num < 0) {
            return { isValid: false, error: 'Block number must be greater than zero' };
        }
        // Check against latest block
        let latestBlockHeight = this.getLatestBlockHeight();
        if (latestBlockHeight && latestBlockHeight < num) {
            return {
                isValid: false,
                error: `Block number ${num} is too high. Latest block is ${this.getLatestBlockHeight()}`
            }
        }

        return { isValid: true, error: '' }
    }

    /** TXS */

    @action
    async fetchTxsIdRange(startTxs: number, endTxs: number, ascending: boolean) {
        let txsIdRange = await axios.get(`http://localhost:8090/${FILENAME}.json`).then(response => {
            const isJson = response.headers['content-type'] && response.headers['content-type'].search('application/json') != -1 ? true : false;
            let data = isJson ? JSON.parse(JSON.stringify(response.data)) : null;

            const dataLength = data ? Object.keys(data.transactions).length : 0;
            if (dataLength > 0) {
                this.setNbTxs(dataLength);
                if (ascending) {
                    return this.extractTxsIds(data, startTxs, endTxs);
                } else {
                    const start = dataLength - startTxs;
                    const end = (dataLength - startTxs) + endTxs;
                    return this.extractTxsIds(data, start < 0 ? 0 : start + 1, end);
                }
            }
        });
        return txsIdRange;
    }

    @action
    async fetchTxsTableData(pageNumber: number, maxTxs: number) {
        const start = pageNumber * maxTxs;
        const end = maxTxs;
        const txsObj = await this.fetchTxsIdRange(start, end, false);

        if (txsObj) {
            let result = await this.fetchTxsContents(txsObj);
            this.setTxsTableData(result.reverse());
        }
    }

    @action extractTxsIds(data: any, startTxs: number, endTxs: number) {
        const txsData = data.transactions.slice(startTxs - 1 < 0 ? 0 : startTxs - 1, endTxs);
        return txsData
    }

    @action async fetchTxsContents(txsObj: any) {
        let result: TransactionTableData[] = [];
        for (let i = 0; i < txsObj.length; i++) {
            for (let j = 0; j < txsObj[i].txs.length; j++) {
                const tx = await this.fetchBlockchainItem(txsObj[i].txs[j]) as TransactionData;
                const TxTableData: TransactionTableData = {
                    hash: txsObj[i].txs[j],
                    transaction: tx,
                    blockNum: txsObj[i].blockNum,
                }
                result.push(TxTableData);
            }
        }
        return result;
    }

    /** GET */

    getLatestBlockHeight() {
        if (this.latestBlock) {
            return this.latestBlock.block.header.b_num;
        }
        return null;
    }

    getNEntries(pageNumber: number, maxBlocks: number): number[] | null {
        if (this.latestBlock) {
            let latestb_num = this.latestBlock.block.header.b_num - (pageNumber - 1) * maxBlocks;
            let nums = [];

            for (let i = latestb_num; i > Math.max(latestb_num - maxBlocks, -1); i--) {
                nums.push(i);
            }
            return nums;
        }
        return null;
    }

    /** FORMAT */

    // formatTxsSet(data: any) {
    //     let tableData = [];
    // }

    formatBlockSet(data: any[]): RequestData[] {
        let blockSet: RequestData[] = [];
        data.map((array: any[]) => {
            let hash = array[0];
            let { block, miningTxHashAndNonces } = this.formatBlock(array[1]);

            blockSet.push({
                hash: hash,
                block: block,
                miningTxHashAndNonces: miningTxHashAndNonces
            });
        });
        return blockSet;
    }

    formatBlock(data: { block: BlockData, mining_tx_hash_and_nonces: any }): RequestBlock {
        let block = data.block;
        if (block.header.merkle_root_hash === "") {
            block.header.merkle_root_hash = "N/A";
        }

        if (block.header.previous_hash === "") {
            block.header.previous_hash = "N/A";
        }

        let miningTxHashAndNonces: MiningTxHashAndNoceData = {
            hash: data.mining_tx_hash_and_nonces['1'][0],
            nonce: data.mining_tx_hash_and_nonces['1'][1]
        };

        return {
            block,
            miningTxHashAndNonces
        };
    }

    formatTxs(data: any): TransactionData {
        let txData = {
            druid_info: data.druid_info,
            inputs: data.inputs,
            outputs: data.outputs,
            version: data.version,
        }
        return txData
    }
}


export default new Store();