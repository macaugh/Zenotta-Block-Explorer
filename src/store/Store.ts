import axios from "axios";
import { action, makeAutoObservable, observable } from "mobx";
import { RequestData, Block, MiningTxHashAndNoce, Transaction } from "../interfaces";

class Store {
    constructor() {
        makeAutoObservable(this)
    }

    @observable tableData: RequestData[] = [];
    @observable latestBlock: Block | null = null;
    @observable latestTransactions: Transaction[] = [];
    @observable blockchainItemCache: any = {};

    @action addToLatestTransactions(tx: any) {
        this.latestTransactions.push(tx);
    }

    @action setLatestBlock(block: Block) {
        this.latestBlock = block;
    }

    @action setTableData(tableData: RequestData[]) {
        this.tableData = tableData;
    }

    @action setLatestTransactions(transactions: Transaction[]) {
        this.latestTransactions = transactions;
    }

    @action
    async fetchLatestBlock(pageNumber: number, maxBlocks: number) {
        await axios.get('http://localhost:8090/api/latestBlock').then(async (response) => {
            this.setLatestBlock(this.formatBlock(response.data));
            await this.fetchTableData(pageNumber, maxBlocks);
        }).catch((error) => {
            console.error(`Fetch of latest block failed with status code ${error.status}`);
            console.error(error.data);
        });
    }

    @action async fetchBlockchainItem(hash: string): Promise<Block | Transaction> {
        let bItemData = null;
        if (Object.keys(this.blockchainItemCache).indexOf(hash) == -1) {
            bItemData = await axios.post(`http://localhost:8090/api/blockchainItem`, { hash }).then(res => res.data);
            this.blockchainItemCache[hash] = bItemData;
        } else {
            bItemData = this.blockchainItemCache[hash];
        }
        
        let itemType = Object.getOwnPropertyNames(bItemData)[0]

        if (itemType === 'Block') {
            return this.formatBlock(bItemData.Block);
        } else if (itemType === 'Transaction') {
            return this.formatTransaction(bItemData.Transaction);
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
    async fetchTableData(pageNumber: number, maxBlocks: number) {
        const nums = this.getNEntries(pageNumber, maxBlocks);

        let data = await axios.post('http://localhost:8090/api/blockRange', { nums }).then(res => res.data);
        this.setTableData(this.formatBlockSet(data));
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
    async blockNumIsValid(num: number): Promise<{ isValid: boolean, error: string }> {
        if (!this.latestBlock) {
            await this.fetchLatestBlock(0, 0);
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

        return {
            isValid: true,
            error: ''
        }
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

    formatBlockSet(data: any[]): RequestData[] {
        var dataTable: RequestData[] = [];
        data.map((array: any[]) => {
            let hash = array[0];
            let block = array[1].block;
            if (block.header.merkle_root_hash === "") {
                block.header.merkle_root_hash = "N/A";
            }
            var miningTxHashAndNonces: MiningTxHashAndNoce = {
                hash: array[1].mining_tx_hash_and_nonces['1'][0],
                nonce: array[1].mining_tx_hash_and_nonces['1'][1]
            }
            dataTable.push({
                hash: hash,
                block: block,
                miningTxHashAndNonces: miningTxHashAndNonces
            });
        });
        return dataTable;
    }

    formatBlock(data: any): Block { 
        let block = data.block;
        if (block.header.merkle_root_hash === "") {
            block.header.merkle_root_hash = "N/A";
        }
        var miningTxHashAndNonces: MiningTxHashAndNoce = {
            hash: data.mining_tx_hash_and_nonces['1'][0],
            nonce: data.mining_tx_hash_and_nonces['1'][1]
        }
        var lb: Block = {
            block: block,
            miningTxHashAndNonces: miningTxHashAndNonces
        }
        return lb
    }

    formatTransaction(data: any): Transaction {
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