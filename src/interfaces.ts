export interface BlockInfo {
    hash: string,
    computeNodes: number,
    blockNum: number,
    merkleRootHash: string,
    previousHash: string,
    version: number,
    byteSize: string,
    transactions: number
}

export interface RequestData {
    hash: string,
    block: BlockData,
    miningTxHashAndNonces: MiningTxHashAndNoce,
};

export interface Block {
    block: BlockData,
    miningTxHashAndNonces: MiningTxHashAndNoce,
}

export interface MiningTxHashAndNoce {
    hash: string,
    nonce: number[]
}

export interface BlockDataFromResponse {
    block: BlockData,
    mining_tx_hash_and_nonces: any
}

export interface Transaction {
    druid_info: any,
    inputs: TransactionInputs[],
    outputs: TransactionOutputs[],
    version: number,
}

export interface MiningTx {
    tokens: number,
    tokensDivided: number,
    scriptPublicKey: string,
    version: number
}

export interface BlockchainItem {
    type: string,
    item: Promise<Block | Transaction>
}

export interface TransactionInputs {
    previous_out: any,
    script_signature: ScriptSignature,
}

export interface TransactionOutputs {
    drs_block_hash: any,
    drs_tx_hash: any,
    locktime: number,
    script_public_key: string,
    value: TokenOutput | ReceiptOutput
}

export interface TokenOutput {
    Token: number
}

export interface ReceiptOutput {
    Receipt: number
}

interface ScriptSignature {
    stack: any[]
}

// export interface Stack {
//     Op?: string,
//     Num?: number,
//     Bytes?: string,
//     Signature?: number[],
//     PubKey?: number[]
// }

interface BlockData {
    header: BlockHeader,
    transactions: any[]
}

interface BlockHeader {
    version: number,
    bits: number,
    nonce: any[],
    b_num: number,
    seedValue: any[],
    previous_hash: string,
    merkle_root_hash: string,
}

