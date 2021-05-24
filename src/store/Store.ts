import axios from "axios";
import { observable, action, makeAutoObservable } from "mobx";

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

    @action async fetchLatestBlock() {
        try {
            const response: HTTPResponse = await axios.get(`http://localhost:3001/latest_block`);
            this.latestBlock = response.data;

            this.fetchTableData();
        }
        catch (err) {
            console.error(`Fetch of latest block failed with status code ${err.status}`);
            console.error(err.data);
        }
    }

    @action fetchBlockchainItem(hash: string) {
        return axios.post(`http://localhost:3001/blockchain_entry_by_key`,
            `"${hash}"`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            return response.data;
        });
    }

    @action async fetchTableData() {
        const nums = this.getNEntries();

        try {
            const response = await axios({
                url: `http://localhost:3001/block_by_num`,
                method: 'POST',
                data: nums,
                headers: {
                    "Content-Type": "application/json",
                }
            });

            this.tableData = response.data;
        } catch (err) {
            console.error(`Fetch of blocks by number failed with status code ${err.status}`);
            console.error(err.data);
        }
    }

    getNEntries(): number[] | null {
        if (this.latestBlock) {
            let latestBNum = this.latestBlock.block.header.b_num;
            let nums = [];

            for (let i = latestBNum; i > Math.max(latestBNum - 10, 0); i--) {
                nums.push(i);
            }

            return nums;
        }

        return null;
    }

}

export default new Store();