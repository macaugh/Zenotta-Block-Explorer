import axios from "axios";
import {action, makeAutoObservable, observable} from "mobx";

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
        await axios.get(`http://localhost:3001/latest_block`).then(async (response) => {
            this.setLatestBlock(response.data);
            await this.fetchTableData(pageNumber, maxBlocks);
        }).catch((error) => {
            console.error(`Fetch of latest block failed with status code ${error.status}`);
            console.error(error.data);
        });
    }

    @action async fetchBlockchainItem(hash: string) {
        return axios.post(`http://localhost:3001/blockchain_entry_by_key`,
            `"${hash}"`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => {
                return response.data;
            }).catch((error) => {
                console.error(`Fetch of blockchain item failed with status code ${error.status}`)
                console.error(error.data)
            });
    }

    @action
    async fetchTableData(pageNumber: number, maxBlocks: number) {
        const nums = this.getNEntries(pageNumber, maxBlocks);

        await axios({
            url: `http://localhost:3001/block_by_num`,
            method: 'POST',
            data: nums,
            headers: {
                "Content-Type": "application/json",
            }
        }).then((response) => {
            this.setTableData(response.data);
        }).catch((error) => {
            console.error(`Fetch of blocks by number failed with status code ${error.status}`);
            console.error(error.data);
        });
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