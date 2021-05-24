import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';
import { TransactionInfo, TransactionInfoProps } from '../TransactionInfo/TransactionInfo';

import styles from './BCItemView.scss';

interface BlockInfo {
    hash: string,
    computeNodes: number,
    blockNum: number,
    merkleRootHash: string,
    previousHash: string,
    version: number,
    byteSize: number,
    transactions: number
}

export const BCItemView = () => {
    let { hash } = useParams<any>();
    const store = React.useContext(StoreContext);
    const [transactions, setTransactions] = React.useState<any>(null);
    const [localData, setLocalData] = React.useState<any>(null);
    const [heading, setHeading] = React.useState<string>(
        hash.charAt('b') ? 'Block' : 'Transaction'
    );

    const getTxPromises = (transactions: string[]): Promise<any>[] => {
        return transactions.map(tx => store.fetchBlockchainItem(tx));
    }

    const checkSeenTxIns = (t: any, seenIns: string[]) => {
        let t_hash = t.previous_out.t_hash;

        if (seenIns.indexOf(t_hash) == -1) {
            seenIns.push(t_hash);
            return true;
        }

        return false;
    }

    const formatTransactions = (transactions: any[], hashes: string[]) => {
        if (!transactions || !transactions.length) { return [] }

        return transactions.map((tx, i) => {
            tx = tx.Transaction;
            let seenIns: string[] = [];

            // Save for later use
            store.latestTransactions.push(tx);

            let info: TransactionInfoProps = {
                hash: hashes[i],
                totalTokens: tx.outputs.reduce((acc: number, o: any) => acc + o.value.Token, 0),
                txInHashes: tx.inputs
                    .filter((t: any) => checkSeenTxIns(t, seenIns))
                    .map((i: any) => i.previous_out.t_hash),
                outputs: tx.outputs.map((o: any) => {
                    return {
                        publicKey: o.script_public_key,
                        lockTime: o.locktime,
                        tokens: o.value.Token
                    }
                })
            };

            return info;
        })
    }

    const fetchTransactions = async (txs: string[]) => {
        let tInfo = await Promise
        .all(getTxPromises(txs))
        .then(results => formatTransactions(results, txs));
    
        setTransactions(tInfo);
    }

    const formatIncomingData = (data: any) => {
        if (data.hasOwnProperty('Block')) {
            let blockInfo = data.Block;

            fetchTransactions(blockInfo.block.transactions);

            let newData: BlockInfo = {
                hash,
                computeNodes: Object.keys(blockInfo.mining_tx_hash_and_nonces).length,
                blockNum: blockInfo.block.header.b_num,
                merkleRootHash: blockInfo.block.header.merkle_root_hash,
                previousHash: blockInfo.block.header.previous_hash,
                version: blockInfo.block.header.version,
                byteSize: new TextEncoder().encode(JSON.stringify(blockInfo)).length,
                transactions: blockInfo.block.transactions.length
            };

            return newData;
        }

        return null;
    }

    React.useEffect(() => {
        if (!localData) {
            store.fetchBlockchainItem(hash)
                .then(nowData => {
                    setHeading(nowData ? nowData.hasOwnProperty('Block') ? 'Block' : 'Transaction' : '');
                    setLocalData(formatIncomingData(nowData));
                });
        }
    });

    return useObserver(() => (
        <div className={styles.container}>
            <h2 className={styles.heading}>{heading} {localData && localData.blockNum}</h2>

            <table>
                <tbody>
                    <tr>
                        <td>Block Number</td>
                        <td>
                            {localData && localData.blockNum}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                    <tr>
                        <td>Block Hash</td>
                        <td>
                            {localData && localData.hash}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                    <tr>
                        <td>Previous Block Hash</td>
                        <td>
                            {localData && localData.previousHash}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                    <tr>
                        <td>Merkle Root Hash</td>
                        <td>
                            {localData && localData.merkleRootHash}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                    <tr>
                        <td>Byte Size</td>
                        <td>
                            {localData && `${localData.byteSize} bytes`}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                    <tr>
                        <td>Compute Nodes</td>
                        <td>
                            {localData && localData.computeNodes}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                    <tr>
                        <td>Transactions</td>
                        <td>
                            {localData && localData.transactions}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                    <tr>
                        <td>Version</td>
                        <td>
                            {localData && localData.version}
                            {!localData && 'loading...'}
                        </td>
                    </tr>
                </tbody>
            </table>

            {heading && heading == 'Block' &&
                <div className={styles.transactionContainer}>
                    <h2 className={styles.innerHeading}>Block Transactions</h2>

                    {transactions && transactions.length > 0 &&
                        <div className={styles.transactionContainer}>
                            {transactions.map((t: TransactionInfoProps, i: number) => {
                                return (
                                    <div key={i}>
                                        <TransactionInfo {...t} />
                                    </div>
                                );
                            })}
                        </div>}
                </div>}
        </div>
    ));
}

