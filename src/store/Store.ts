import axios from "axios";
import { action, makeAutoObservable, observable } from "mobx";

interface HTTPResponse {
    config: any,
    data: any,
    headers: any,
    request: any,
    status: number,
    statusText: string
}

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
        console.log('Fetching latest block');

        await axios.get('http://localhost:8090/api/latestBlock').then(async (response) => {
            console.log('latest block response', response.data);
            this.setLatestBlock(response.data);
            await this.fetchTableData(pageNumber, maxBlocks);
        }).catch((error) => {
            console.error(`Fetch of latest block failed with status code ${error.status}`);
            console.error(error.data);
        });
    }

    @action async fetchBlockchainItem(hash: string) {
        if (Object.keys(this.blockchainItemCache).indexOf(hash) == -1) {
            let bItemData = await axios.post(`http://localhost:8090/api/blockchainItem`, { hash }).then(res => res.data);
            this.blockchainItemCache[hash] = bItemData;

            return bItemData;
        }

        return this.blockchainItemCache[hash];
    }

    @action
    async fetchTableData(pageNumber: number, maxBlocks: number) {
        const nums = this.getNEntries(pageNumber, maxBlocks);

        let data = await axios.post('http://localhost:8090/api/blockRange', { nums }).then(res => res.data);
        data = data.map((e: any[]) => {
            let blockData = e[1];
            if (blockData.block.header.merkle_root_hash === "") {
                blockData.block.header.merkle_root_hash = "N/A";
            }

            e[1] = blockData;
            return e;
        });
        console.log(data);
        this.setTableData(data);
    }

    @action
    async fetchBlockHashByNum(num: number) {
        console.log('Fetching block by number');

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

    getNEntries(pageNumber: number, maxBlocks: number): number[] | null {
        if (this.latestBlock) {
            let latestBNum = this.latestBlock.block.header.b_num - (pageNumber - 1) * maxBlocks;
            let nums = [];

            for (let i = latestBNum; i > Math.max(latestBNum - maxBlocks, 0); i--) {
                nums.push(i);
            }
            return nums;
        }
        return null;
    }

}

export default new Store();