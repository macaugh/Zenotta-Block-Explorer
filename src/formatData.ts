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

export const formatNumber = (num: string | number): string => {
    let target = '';
    if (num) {
        if (typeof num === 'number')
            target = num.toString();
        else
            target = num;
    }
    return target.replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

export const formatAddressForDisplay = (address: string, nbChar: number) => {
    let displayAddress = address;
    if (address.length > nbChar) {
        displayAddress = address.substring(0, nbChar / 2) + '...' + address.substring(address.length - nbChar / 2, address.length);
    }
    return displayAddress;
}

export const formatAmount = (tx: any) => {
    let result = 0;
    if (tx.outputs.length > 1) {
            if (tx.outputs[0].value.hasOwnProperty('Token')) {
                result = tx.outputs.reduce((acc: number, o: any) => acc + o.value.Token, 0)
            } 
    } else if (tx.outputs.length != 0) {
        if (tx.outputs[0].value.hasOwnProperty('Token')) {
            result += tx.outputs[0].value.Token;
        }
    }
    return formatNumber((result / 25200).toFixed(2));
}