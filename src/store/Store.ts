import axios from "axios";
import { action, makeAutoObservable, observable } from "mobx";
import { Network } from "interfaces";
import { HOST_PROTOCOL, HOST_NAME, IDB_BLOCKS_CACHE, IDB_TX_CACHE } from "../constants";
import { NETWORKS } from "networks";
import BrowserCache from "./BrowserCache";
import {
  Block,
  BlockDataV0_1,
  BlockDataV2,
  BlockTableData,
  InputData,
  OutputData,
  Transaction,
  TransactionData,
  TransactionTableData,
} from "../interfaces";

const FILENAME = "Txs";

class Store {
  constructor() {
    makeAutoObservable(this);
  }

  @observable latestBlock: Block | null = null;

  @observable blocksTableData: BlockTableData[] = [];
  @observable txsTableData: TransactionTableData[] = [];

  @observable nbTxs: number = 0;
  @observable blockchainItemCache: any = {};
  @observable network: Network =
    NETWORKS.filter((e) => e.name == localStorage.getItem("NETWORK"))[0] ||
    NETWORKS[0];

  /** SET */
  @action setTxsTableData(tableData: any[]) {
    this.txsTableData = tableData;
  }

  @action setLatestBlock(block: Block) {
    this.latestBlock = block;

    // let test = BrowserCache.get(IDB_BLOCKS_CACHE, block);
    //console.log(test);
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

  @action setNetwork(network: string) {
    this.network = NETWORKS.filter((e) => e.name === network)[0];
  }

  /** BLOCK */

  // TODO : check for block version (currently it is safe to assume all latest blocks are version 2)
  @action
  async fetchLatestBlock() {
    await axios
      .post(`${HOST_PROTOCOL}://${HOST_NAME}/api/latestBlock`, { network: this.network })
      .then(async (response) => {
        this.setLatestBlock(this.formatBlock(response.data.content));
      });
  }

  @action async fetchBlockchainItem(
    hash: string
  ): Promise<Block | Transaction | null> {
    let bItemData = null;
    if (Object.keys(this.blockchainItemCache).indexOf(hash) == -1) {
      bItemData = await axios
        .post(`${HOST_PROTOCOL}://${HOST_NAME}/api/blockchainItem`, {
          hash,
          network: this.network,
        })
        .then((res) => {
          return res.data;
        });
      this.setBcItemCache(hash, bItemData);
    } else {
      bItemData = this.blockchainItemCache[hash];
    }

    let itemType = Object.getOwnPropertyNames(bItemData)[0];
    if (itemType === "Block") {
      return this.formatBlock(bItemData.Block) as Block;
    } else if (itemType === "Transaction") {
      return this.formatTxs(bItemData.Transaction) as Transaction;
    }
    return null;
  }

  @action
  async fetchBlockRange(startBlock: number, endBlock: number) {
    const nums = [...Array(endBlock - startBlock + 1).keys()].map(
      (x) => x + startBlock
    ); // Generate number array from range

    const { remainingNums, blocks } = await this.getBlocksFromCache(nums);
    let retData = blocks.length ? blocks : [];

    console.log('Block numbers to fetch:', remainingNums);

    if (remainingNums.length) {
      let data = await axios
        .post(`${HOST_PROTOCOL}://${HOST_NAME}/api/blockRange`, {
          nums: remainingNums,
          network: this.network,
        })
        .then((res) => res.data);
      
      retData.push(...this.formatBlockSet(data));
      this.addBlocksToCache(retData);
    }

    return retData;
  }

  @action
  async fetchBlocksTableData(pageNumber: number, maxBlocks: number) {
    const latestBh = this.getLatestBlockHeight();
    if (latestBh) {
      const start = latestBh - pageNumber * maxBlocks;
      const end = start + maxBlocks;
      const resp = await this.fetchBlockRange(start < 0 ? 0 : start + 1, end);
      this.setBlockTableData(resp.reverse());
    }
  }

  @action
  async fetchBlockHashByNum(num: number) {
    let data: any = [];
    const { remainingNums: _, blocks } = await this.getBlocksFromCache([num]);

    if (!blocks.length) {
      data = await axios
        .post(`${HOST_PROTOCOL}://${HOST_NAME}/api/blockRange`, {
          nums: [num],
          network: this.network,
        })
        .then((res) => res.data)
        .catch((error) => {
          console.error(
            `Fetch of block by number failed with status code ${error.status}`
          );
          console.error(error.data);
        });
      
      this.addBlocksToCache(this.formatBlockSet(data));

    } else {
      // Weird format requirement
      data = [[blocks[0].hash], blocks[0].bNum];
    }

    if (data.length) {
      return data[0][0];
    }

    return null;
  }

  @action
  async searchHashIsValid(
    hash: string,
    type: string
  ): Promise<{ isValid: boolean; error: string }> {
    const re = /^[0-9A-Ga-gx]+$/g;
    const reTest = re.test(hash);

    // This has to be a strict boolean check for some reason? Thanks JS
    if (reTest !== true) {
      return { isValid: false, error: "Please provide a valid hash" };
    }

    if (type === "Block" && new TextEncoder().encode("foo").length != 65) {
      return { isValid: false, error: "Block hash is invalid" };
    }

    if (!(await this.fetchBlockchainItem(hash))) {
      return { isValid: false, error: "Blockchain item not found" };
    }

    return { isValid: true, error: "" };
  }

  @action
  async blockNumIsValid(
    num: number
  ): Promise<{ isValid: boolean; error: string }> {
    if (!this.latestBlock) {
      await this.fetchLatestBlock();
    }
    // Check for NaN
    if (isNaN(num)) {
      return {
        isValid: false,
        error: "Please provide a number to search by block number",
      };
    }
    // Check for negative
    if (num < 0) {
      return {
        isValid: false,
        error: "Block number must be greater than zero",
      };
    }
    // Check against latest block
    let latestBlockHeight = this.getLatestBlockHeight();
    if (latestBlockHeight && latestBlockHeight < num) {
      return {
        isValid: false,
        error: `Block number ${num} is too high. Latest block is ${this.getLatestBlockHeight()}`,
      };
    }

    return { isValid: true, error: "" };
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

  /** 
   * Extracts transactions ids from static files generated from express server (runs audit on every new block and stores transactions in json file)
   * 
   * TODO: Update to be more efficient in the DB on server side (switch to Postgres?)
   * 
   * @param {number} startTxs - Start index of txs to fetch
   * @param {number} endTxs - End index of txs to fetch
   */
  @action
  async fetchTxsIdRange(
    startTxs: number,
    endTxs: number
  ): Promise<{ blockNum: number; tx: string } | null> {
    let txsIdRange = await axios
      .get(`${HOST_PROTOCOL}://${HOST_NAME}/${this.network.name.split(' ')[0].toLowerCase() + FILENAME}.json`)
      .then((response) => {
        const isJson =
          response.headers["content-type"] &&
          response.headers["content-type"].search("application/json") != -1;

        let data = isJson ? JSON.parse(JSON.stringify(response.data)) : null;

        // Format transaction data. This is a bit hacky, but it works for now. Should change base structure of stored transactions.
        const txIds = data.transactions
          .map(({ blockNum, txs }: any) => {
            const formatted = txs.map((tx: any) => {
              return { blockNum, tx };
            });
            return [...formatted];
          })
          .flat();

        if (txIds.length > 0) {
          this.setNbTxs(txIds.length);

          const start = txIds.length - 1 - startTxs;
          const end = txIds.length - startTxs + endTxs;

          return txIds.slice(start < 0 ? 0 : start + 1, end).reverse();
        }
      });
    return txsIdRange;
  }

  @action async fetchTxsContents(txsObj: any) {
    const hashes = txsObj.map((tx: any) => tx.tx);
    let { remainingHashes, txs } = await this.getTransactionsFromCache(hashes);
    let calls = remainingHashes.map((hash: string) => this.fetchBlockchainItem(hash));

    await Promise.all(calls).then((txRes) => {
      txRes.forEach((tx, i) => {
        let newTx = {
          hash: remainingHashes[i],
          transaction: tx,
          // Improve the efficiency below, filter every item is expensive
          blockNum: txsObj.filter((e: any) => e.tx == remainingHashes[i]).map((e: any) => e.blockNum)[0],
        };

        txs.push(newTx);

        // Add to cache
        this.addTransactionToCache(newTx);
      })
    });

    return txs;
  }

  /**
   * Adds provided transaction to the browser cache
   * 
   * @param {any} tx - Transaction data
   */
  addTransactionToCache(tx: any) {
    tx.id = tx.hash;
    BrowserCache.add(`${IDB_TX_CACHE}_${this.network.sIp}`, tx);
  }

  /** 
   * Adds provided blocks to the browser cache
   * 
   * @param {any[]} blocks - Array of blocks to add to cache
   */
  addBlocksToCache(blocks: any[]) {
    blocks.forEach((block) => {
      block.id = block.block.bNum;
      BrowserCache.add(`${IDB_BLOCKS_CACHE}_${this.network.sIp}`, block);
    });
  }

  /**
   * Fetches blocks from cache by block number
   * 
   * @param {number[]} blockNums - Array of block numbers to fetch
   * @returns {{ remainingNums: number[], blocks: any[] }} - Object containing remaining block numbers to fetch and array of retrieved blocks
   */
  async getBlocksFromCache(blockNums: number[]) {
    let blocks: any[] = [];
    let remainingNums: number[] = [];
    
    const calls = blockNums.map(num => BrowserCache.get(`${IDB_BLOCKS_CACHE}_${this.network.sIp}`, num));

    await Promise.all(calls).then((results) => {
      results.forEach((result: any) => {
        // Cache hit
        if (result && result.id) {
          delete result.id;
          blocks.push(result);
        
          // Not present in the cache, so we need to fetch it
        } else {
          remainingNums.push(result.key);
        }
      });
    });

    return { remainingNums, blocks };
  }

  /**
   * Fetches transactions from cache by transaction hash
   * 
   * @param {string[]} txHashes - Array of transaction hashes to fetch
   * @returns {{ remainingHashes: string[], txs: any[] }} - Object containing remaining transaction hashes to fetch and array of retrieved transactions
   */
  async getTransactionsFromCache(txHashes: string[]) {
    let txs: any[] = [];
    let remainingHashes: string[] = [];

    const calls = txHashes.map(hash => BrowserCache.get(`${IDB_TX_CACHE}_${this.network.sIp}`, hash));

    await Promise.all(calls).then((results) => {
      results.forEach((result: any) => {
        // Cache hit
        if (result && result.id) {
          delete result.id;
          txs.push(result);
        
        // Not present in the cache, so we need to fetch it
        } else {
          remainingHashes.push(result.key);
        }
      })
    });

    return { remainingHashes, txs };
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

  /** 
   * Format block data to Block object
   * Handles up to block version 2
   */
  formatBlock(content: BlockDataV0_1 | BlockDataV2): Block {
    // Check for block type
    const block: Block = this.handleBlockVersionFormat(content);
    return block;
  }

  handleBlockVersionFormat(content: any): Block {
    // Block with different version have different structures
    if (content.block.header.version > 1) {
      // V2
      const blockData = content.block as BlockDataV2;
      return {
        bNum: blockData.header.b_num,
        previousHash: blockData.header.previous_hash,
        seed: blockData.header.seed_value,
        version: blockData.header.version,
        bits: blockData.header.bits,
        miningTxHashNonces: {
          hash: blockData.header.nonce_and_mining_tx_hash[1],
          nonce: blockData.header.nonce_and_mining_tx_hash[0],
        },
        merkleRootHash: {
          merkleRootHash: blockData.header.txs_merkle_root_and_hash[1],
          txsHash: blockData.header.txs_merkle_root_and_hash[0],
        },
        transactions: blockData.transactions,
      };
    } else {
      // V0_1
      const blockData = content.block as BlockDataV0_1;
      const miningTxHashNonces = content.mining_tx_hash_and_nonces;
      return {
        bNum: blockData.header.b_num,
        previousHash: blockData.header.previous_hash
          ? blockData.header.previous_hash
          : "",
        seed: blockData.header.seed_value,
        version: blockData.header.version,
        bits: blockData.header.bits,
        miningTxHashNonces: {
          hash: miningTxHashNonces["1"][0],
          nonce: miningTxHashNonces["1"][1],
        },
        merkleRootHash: {
          merkleRootHash: blockData.header.merkle_root_hash,
          txsHash: "",
        },
        transactions: blockData.transactions,
      };
    }
  }

  formatTxs(data: TransactionData): Transaction {
    let txData = {
      druidInfo: data.druid_info,
      inputs: data.inputs.map((input: InputData) => {
        return {
          previousOut: input.previous_out
            ? {
                num: input.previous_out.n,
                tHash: input.previous_out.t_hash,
              }
            : null,
          scriptSig: input.script_signature,
        };
      }),
      outputs: data.outputs.map((output: OutputData) => {
        return {
          drsBHash: output.drs_block_hash,
          drsTHash: output.drs_tx_hash,
          locktime: output.locktime,
          scriptPubKey: output.script_public_key,
          value: output.value,
        };
      }),
      version: data.version,
    };
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

      for (
        let i = latestb_num;
        i > Math.max(latestb_num - maxBlocks, -1);
        i--
      ) {
        nums.push(i);
      }
      return nums;
    }
    return null;
  }
}

export default new Store();
