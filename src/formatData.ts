import { RequestData, BlockInfo } from './interfaces';

export const formatToBlockInfo = (data: RequestData): BlockInfo => {
    const blockInfo: BlockInfo = {
        hash: data.hash,
        computeNodes: data.miningTxHashAndNonces.nonce.length,
        blockNum: data.block.header.b_num,
        merkleRootHash: data.block.header.merkle_root_hash,
        previousHash: data.block.header.previous_hash,
        version: data.block.header.version,
        byteSize: `${new TextEncoder().encode(JSON.stringify(data.block)).length} bytes`,
        transactions: data.block.transactions.length
    };
    return blockInfo
}