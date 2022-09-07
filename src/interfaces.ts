/** Global */
export enum ItemType {
    Block,
    Transaction
}

/** Request data structures */

export interface BlockDataWrapperV0_1 {
    block: BlockDataV0_1,
    mining_tx_hash_and_nonces: any
}

export interface BlockDataV0_1 {
    header: {
        version: number,
        bits: number,
        nonce: number[],
        b_num: number,
        seed_value: number[],
        previous_hash: string | null,
        merkle_root_hash: string,
    },
    transactions: string[]
}

export interface BlockDataV2 {
    header: {
        version: number,
        bits: number,
        nonce_and_mining_tx_hash: any[],
        b_num: number,
        seed_value: number[],
        previous_hash: string,
        txs_merkle_root_and_hash: string[],
    },
    transactions: string[]
}

export interface TransactionData {
    druid_info: null,
    inputs: InputData[],
    outputs: OutputData[],
    version: number
}

export interface InputData {
    previous_out: {
        n: number,
        t_hash: string
    },
    script_signature: {
        stack: StackData[]
    }
}

export interface OutputData {
    drs_block_hash: string | null,
    drs_tx_hash: string | null,
    locktime: number,
    script_public_key: string,
    value: { Token: number } | { Receipt: number }
}

export interface StackData {
    Op?: string,
    Num?: number,
    Bytes?: string,
    Signature?: number[],
    PubKey?: number[]
}

/** Application interfaces */

export interface Block {
    bNum: number,
    previousHash: string,
    seed: number[],
    bits: number,
    version: number,
    miningTxHashNonces: {
        hash: string,
        nonce: number[],
    },
    merkleRootHash: {
        merkleRootHash: string,
        txsHash: string
    },
    transactions: string[],
}

export interface Transaction {
    druidInfo: null,
    inputs: Input[],
    outputs: Output[],
    version: number
}

export interface Input {
    previousOut: {
        num: number,
        tHash: string
    } | null,
    scriptSig: {
        stack: StackData[]
    }
}

export interface Output {
    drsBHash: string | null,
    drsTHash: string | null,
    locktime: number,
    scriptPubKey: string,
    value: { Token: number } | { Receipt: number }
}

/** UI Interfaces */
export interface BlockInfo {
    hash: string,
    bNum: number,
    merkleRootHash: string,
    previousHash: string,
    version: number,
    byteSize: string,
    nbTransactions: number
}

export interface TransactionInfo {
    inputs: {
        previousOutHash: string,
        scriptSig: string,
    }[],
    outputs: TokenInfo[] | ReceiptInfo[],
}

export interface InputInfo {
    previousOutHash: string,
    scriptSig: string,
}

export interface TokenInfo {
    address: string,
    tokens: string,
    fractionatedTokens: string,
    lockTime: number,
}

export interface ReceiptInfo {
    address: string,
    receipts: number,
    lockTime: number,
}

export interface TransactionTableData{
    blockNum: number,
    hash: string,
    transaction: Transaction
}

export interface BlockTableData{
    block: Block,
    hash: string
}


