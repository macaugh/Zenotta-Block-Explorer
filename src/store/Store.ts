import axios from "axios";
import { action, makeAutoObservable, observable } from "mobx";
import { Block, BlockDataV0_1, BlockDataV2, BlockDataWrapperV0_1, BlockTableData, InputData, OutputData, Transaction, TransactionData, TransactionTableData } from "../interfaces";

const FILENAME = 'transactions';

class Store {
    constructor() {
        makeAutoObservable(this)
    }

    @observable latestBlock: Block | null = null;

    @observable blocksTableData: BlockTableData[] = [];
    @observable txsTableData: TransactionTableData[] = [];

    @observable nbTxs: number = 0;
    @observable blockchainItemCache: any = {};

    /** SET */
    @action setTxsTableData(tableData: any[]) {
        this.txsTableData = tableData;
    }

    @action setLatestBlock(block: Block) {
        this.latestBlock = block;
    }

    @action setBlockTableData(tableData: BlockTableData[]) {
        this.blocksTableData = tableData;
    }

    @action setBcItemCache(key: string, value: any) {
        this.blockchainItemCache[key] = value;
    }

    @action setNbTxs(nbTxs: number) {
        this.nbTxs = nbTxs;
    }

    /** BLOCK */

    // TODO : check for block version (currently it is safe to assume all latest blocks are version 2)
    @action
    async fetchLatestBlock() {
        await axios.get('http://localhost:8090/api/latestBlock').then(async (response) => {
            this.setLatestBlock(this.formatBlock(response.data.content));
        });
    }

    @action async fetchBlockchainItem(hash: string): Promise<Block | Transaction |  null> {
        let bItemData = null;
        if (Object.keys(this.blockchainItemCache).indexOf(hash) == -1) {
            bItemData = await axios.post(`http://localhost:8090/api/blockchainItem`, { hash }).then(res => { return res.data });
            this.setBcItemCache(hash, bItemData);
        } else {
            bItemData = this.blockchainItemCache[hash];
        }

        let itemType = Object.getOwnPropertyNames(bItemData)[0]
        if (itemType === 'Block') {
            return this.formatBlock(bItemData.Block) as Block;
        } else if (itemType === 'Transaction') {
            return this.formatTxs(bItemData.Transaction) as Transaction;
        }
        return null
    }

    @action
    async fetchBlockRange(startBlock: number, endBlock: number) {
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
    async fetchTxsTableData(pageNumber: number, maxTxsPerPage: number) {
        // Define range
        const start = pageNumber * maxTxsPerPage;
        const end = maxTxsPerPage;
        const txsObj = await this.fetchTxsIdRange(start, end);
        if (txsObj) {
            let result = await this.fetchTxsContents(txsObj);
            this.setTxsTableData(result);
        }
    }

    /** Extracts transactions ids from static files generated from express server (runs audit on every new block and stores transactions in json file)
 * Will be updated to a more efficient method in the future (Database on server)
*/
    @action
    async fetchTxsIdRange(startTxs: number, endTxs: number): Promise<{ blockNum: number, tx: string } | null> {
        let txsIdRange = await axios.get(`http://localhost:8090/${FILENAME}.json`).then(response => {
            const isJson = response.headers['content-type'] && response.headers['content-type'].search('application/json') != -1 ? true : false;
            let data = isJson ? JSON.parse(JSON.stringify(response.data)) : null;

            // Format transaction data. This is a bit hacky, but it works for now. Should change base structure of stored transactions.
            const txIds = data.transactions.map(({ blockNum, txs }: any) => {
                const formatted = txs.map((tx: any) => {
                    return { blockNum, tx }
                });
                return [...formatted];
            }).flat();


            if (txIds.length > 0) {
                this.setNbTxs(txIds.length);

                const start = (txIds.length - 1) - startTxs;
                const end = (txIds.length - startTxs) + endTxs;

                return txIds.slice(start < 0 ? 0 : start + 1, end).reverse();
            }
        });
        return txsIdRange;
    }

    @action async fetchTxsContents(txsObj: any) {
        const result = await Promise.all(txsObj.map(async (txObj: any) => {
            const txData = await this.fetchBlockchainItem(txObj.tx);
            return ({
                hash: txObj.tx,
                transaction: txData,
                blockNum: txObj.blockNum,
            })
        }));
        return result;
    }

    /** FORMAT */
    formatBlockSet(data: any[]): any[] {
        let blockSet: any[] = [];
        data.map((array: any[]) => {

            let hash = array[0];
            let block = this.formatBlock(array[1]);


            blockSet.push({
                hash: hash,
                block: block,
            });
        });
        return blockSet;
    }

    /** Format block data to Block object
     *  Handles up to block version 2
    */
    formatBlock(content: BlockDataV0_1 | BlockDataV2): Block {
        // Check for block type
        const block: Block = this.handleBlockVersionFormat(content)
        return block
    }

    handleBlockVersionFormat(content: any): Block {
        // Block with different version have different structures
        if (content.block.header.version > 1) { // V2
            const blockData = content.block as BlockDataV2;
            return {
                bNum: blockData.header.b_num,
                previousHash: blockData.header.previous_hash,
                seed: blockData.header.seed_value,
                version: blockData.header.version,
                bits: blockData.header.bits,
                miningTxHashNonces: {
                    hash: blockData.header.nonce_and_mining_tx_hash[1],
                    nonce: blockData.header.nonce_and_mining_tx_hash[0]
                },
                merkleRootHash: {
                    merkleRootHash: blockData.header.txs_merkle_root_and_hash[1],
                    txsHash: blockData.header.txs_merkle_root_and_hash[0]
                },
                transactions: blockData.transactions,
            }
        } else { // V0_1
            const blockData = content.block as BlockDataV0_1;
            const miningTxHashNonces = content.mining_tx_hash_and_nonces;
            return {
                bNum: blockData.header.b_num,
                previousHash: blockData.header.previous_hash ? blockData.header.previous_hash : '',
                seed: blockData.header.seed_value,
                version: blockData.header.version,
                bits: blockData.header.bits,
                miningTxHashNonces: {
                    hash: miningTxHashNonces['1'][0],
                    nonce: miningTxHashNonces['1'][1]
                },
                merkleRootHash: {
                    merkleRootHash: blockData.header.merkle_root_hash,
                    txsHash: ''
                },
                transactions: blockData.transactions,
            }
        }
    }

    formatTxs(data: TransactionData): Transaction {
        let txData = {
            druidInfo: data.druid_info,
            inputs: data.inputs.map((input: InputData) => {return {
                previousOut: input.previous_out ? {
                    num: input.previous_out.n,
                    tHash: input.previous_out.t_hash,
                } : null,
                scriptSig: input.script_signature,
            }}),
            outputs: data.outputs.map((output: OutputData) => {
                return {
                    drsBHash: output.drs_block_hash,
                    drsTHash: output.drs_tx_hash,
                    locktime: output.locktime,
                    scriptPubKey: output.script_public_key,
                    value: output.value,
                }
            }),
            version: data.version
        }
        return txData;
    }

    /** GET */
    getLatestBlockHeight() {
        if (this.latestBlock) {
            return this.latestBlock.bNum;
        }
        return null;
    }

    getNEntries(pageNumber: number, maxBlocks: number): number[] | null {
        if (this.latestBlock) {
            let latestb_num = this.latestBlock.bNum - (pageNumber - 1) * maxBlocks;
            let nums = [];

            for (let i = latestb_num; i > Math.max(latestb_num - maxBlocks, -1); i--) {
                nums.push(i);
            }
            return nums;
        }
        return null;
    }
}




export default new Store();