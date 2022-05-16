import axios from "axios";
import { action, makeAutoObservable, observable } from "mobx";

class Store {
    constructor() {
        makeAutoObservable(this)
    }

    @observable tableData: any = [];
    @observable latestBlock: any = null;
    @observable latestTransactions: any[] = [];
    @observable blockchainItemCache: any = {};

    @action addToLatestTransactions(tx: any) {
        this.latestTransactions.push(tx);
    }

    @action setLatestBlock(block: any) {
        this.latestBlock = block;
    }

    @action setTableData(tableData: any) {
        this.tableData = tableData;
    }

    @action setLatestTransactions(transactions: any[]) {
        this.latestTransactions = transactions;
    }

    @action
    async fetchLatestBlock(pageNumber: number, maxBlocks: number) {
        await axios.get('/api/latestBlock').then(async (response) => {
            this.setLatestBlock(response.data);
            await this.fetchTableData(pageNumber, maxBlocks);

        }).catch((error) => {
            console.error(`Fetch of latest block failed with status code ${error.status}`);
            console.error(error.data);
        });
    }

    @action async fetchBlockchainItem(hash: string) {
        if (Object.keys(this.blockchainItemCache).indexOf(hash) == -1) {
            let bItemData = await axios.post(`/api/blockchainItem`, { hash }).then(res => res.data);
            this.blockchainItemCache[hash] = bItemData;

            return bItemData;
        }

        return this.blockchainItemCache[hash];
    }

    @action
    async fetchBlockRange(startBlock: number, endBlock: number): Promise<any> {
        const nums = [...Array(endBlock - startBlock + 1).keys()].map(x => x + startBlock); // Generate number array from range

        let data = await axios.post('/api/blockRange', { nums }).then(res => res.data);
        data = data.map((e: any[]) => {
            let blockData = e[1];
            if (blockData.block.header.merkle_root_hash === "") {
                blockData.block.header.merkle_root_hash = "N/A";
            }

            e[1] = blockData;
            return e;
        });
        return data
    }

    @action
    async fetchTableData(pageNumber: number, maxBlocks: number) {
        const nums = this.getNEntries(pageNumber, maxBlocks);

        let data = await axios.post('/api/blockRange', { nums }).then(res => res.data);
        data = data.map((e: any[]) => {
            let blockData = e[1];
            if (!blockData.block.header.merkle_root_hash) {
                blockData.block.header.merkle_root_hash = "N/A";
            }

            if (!blockData.block.header.previous_hash) {
                blockData.block.header.previous_hash = "N/A";
            }

            e[1] = blockData;
            return e;
        });
        this.setTableData(data);
    }

    @action
    async fetchBlockHashByNum(num: number) {
        let data = await axios.post('/api/blockRange', { nums: [num] }).then(res => res.data)
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
            await this.fetchLatestBlock(0,0);
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
        if (this.getLatestBlockHeight() < num) {
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
            let latestBNum = this.latestBlock.block.header.b_num - (pageNumber - 1) * maxBlocks;
            let nums = [];

            for (let i = latestBNum; i > Math.max(latestBNum - maxBlocks, -1); i--) {
                nums.push(i);
            }
            return nums;
        }
        return null;
    }

}

export default new Store();