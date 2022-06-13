import { RequestData, BlockInfo } from './interfaces';

export const formatToBlockInfo = (data: RequestData): BlockInfo => {
    const blockInfo: BlockInfo = {
        hash: data.hash,
        blockNum: data.block.header.b_num,
        merkleRootHash: data.block.header.merkle_root_hash || 'N/A',
        previousHash: data.block.header.previous_hash || 'N/A',
        version: data.block.header.version,
        byteSize: `${new TextEncoder().encode(JSON.stringify(data.block)).length} bytes`,
        transactions: data.block.transactions.length
    };
    return blockInfo
}