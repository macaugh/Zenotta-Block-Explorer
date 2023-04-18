import { formatToBlockInfo } from './formatData';

export const blockRangeToCsv = (data: any[]) => {
    if (data.length > 0) {
        let csvRows = [];
        let headers: any[] = Object.keys(formatToBlockInfo(data[0]));
        csvRows.push(headers.join(','));
        for (const item of data) {
            csvRows.push(rowToCsv(formatToBlockInfo(item), headers));
        }
        return csvRows.join('\n');;
    };
}

export const txsToCsv = (txs: any[], headers: any) => {
    let csvRows: any[] = [];
    if (txs && txs.length > 0) {
        csvRows.push(headers.join(','));
        for (const item of txs) {
            csvRows.push(rowToCsv(item, headers));
        }
    }
    return csvRows.join('\n');
}

export const itemToCsv = (item: any) => {
    let csvRows = [];
    const headers = Object.keys(item);
    csvRows.push(headers.join(','));
    csvRows.push(rowToCsv(item, headers));
    return csvRows.join('\n');;
}

export const formatCsvTxs = (txs: any[]) => {
    // let highestInCount = -1;
    // let highestOutCount = -1;
    // let highestIn = null;
    // let highestOut = null;
    // for (let index in txs) {
    //     let tx = txs[index];
    //     tx = flattenTxOutputs(tx);
    //     tx = flattenTxInputs(tx);

    //     if (!highestInCount && !highestIn) {
    //         highestInCount = tx.txInHashes.length;
    //         highestIn = tx;
    //     } else {
    //         if (tx.txInHashes && tx.txInHashes.length > highestInCount) {
    //             highestIn = tx;
    //         }
    //     }
    //     if (!highestOutCount && !highestOut) {
    //         highestOutCount = tx.outputs.length;
    //         highestOut = tx;
    //     } else {
    //         if (tx.outputs.length > highestOutCount) {
    //             highestOut = tx;
    //             highestOutCount = tx.outputs.length;
    //         }
    //     }
    //     if (tx.txInHashes.length > 0)
    //         delete tx.txInHashes;
    //     else 
    //         tx.txInHashes = 'N/A'

    //     delete tx.outputs;
    // }

    // const inKeys = Object.keys(highestIn);
    // const outKeys = Object.keys(highestOut);

    // let headers = inKeys.concat(outKeys.filter((item: any) =>  // Merge item header with most inputs with item header with most outputs
    //     inKeys.indexOf(item) < 0 // Check for duplicates
    // ));

    return { txs, headers: [] }
}

export const downloadFile = (fileName: string, data: any) => {
    var link = document.createElement('a');
    link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    link.setAttribute('download', fileName + '.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const rowToCsv = (item: any, headers: any) => {
    const values = headers.map((header: any) => {
        const val = (item as any)[header]
        return `${val}`;
    });
    return values.join(',');
}

const flattenTxInputs = (tx: any) => {
    if (tx.txInHashes && tx.txInHashes.length > 0) {
        for (const index in tx.txInHashes) {
            let k = `txInHashes_${index}`
            let v = tx.txInHashes[index];
            tx[k] = v;
        }
    } else if (tx.inputs && tx.inputs.length > 0) {
        for (const index in tx.inputs) {
            let k = `txInHashes_${index}`
            let v = tx.inputs[index];
            tx[k] = v;
        }
    }
    return tx
}

const flattenTxOutputs = (tx: any) => {
    for (const index in tx.outputs) {
        let keys = Object.keys(tx.outputs[index]);
        for (const key of keys) {
            let k = `output_${key}_${index}`
            let v = tx.outputs[index][key];
            tx[k] = v;
        }
    }
    return tx
}
