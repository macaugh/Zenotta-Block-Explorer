/** UI Interfaces */
export interface BlockInfo {
    hash: string,
    blockNum: number,
    merkleRootHash: string,
    previousHash: string,
    version: number,
    byteSize: string,
    transactions: number
}

export interface TransactionInfo {
    hash: string,
    outputs: TokenOutput[] | ReceiptOutput[],
    totalTokens: number,
    txInHashes: any[],
}

/** Store Interfaces */
export interface RequestData {
    hash: string,
    block: BlockData,
    miningTxHashAndNonces: MiningTxHashAndNoceData,
};

export interface RequestBlock {
    block: BlockData,
    miningTxHashAndNonces: MiningTxHashAndNoceData,
}

export interface BlockData {
    header: BlockHeader,
    transactions: any[]
}

export interface TransactionData {
    druid_info: any,
    inputs: TransactionInputsData[],
    outputs: TransactionOutputsData[],
    version: number,
}

export interface MiningTxHashAndNoceData {
    hash: string,
    nonce: number[]
}

export interface MiningTxData {
    tokens: number,
    tokensDivided: number,
    scriptPublicKey: string,
    version: number
}

export interface TransactionInputsData {
    previous_out: any,
    script_signature: ScriptSignature,
}

export interface TransactionOutputsData {
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


interface BlockHeader {
    version: number,
    bits: number,
    nonce: any[],
    b_num: number,
    seedValue: any[],
    previous_hash: string,
    merkle_root_hash: string,
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


