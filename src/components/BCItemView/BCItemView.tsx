import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';
import { RowTable } from '../RowTable/RowTable';
import { TransactionView } from '../TransactionView/TransactionView';
import { TransactionInfo, TransactionInfoProps } from '../TransactionInfo/TransactionInfo';

import styles from './BCItemView.scss';
import { values } from 'mobx';

interface BlockInfo {
    hash: string,
    computeNodes: number,
    blockNum: number,
    merkleRootHash: string,
    previousHash: string,
    version: number,
    byteSize: string,
    transactions: number
}

export const BCItemView = () => {
    let { hash } = useParams<any>();
    const store = React.useContext(StoreContext);
    const [transactions, setTransactions] = React.useState<any>(null);
    const [miningTx, setMiningTx] = React.useState<any>(null);
    const [localData, setLocalData] = React.useState<any>(null);
    const [coinbaseHash, setCoinbaseHash] = React.useState<string>('');

    const [mainTxData, setMainTxData] = React.useState<any>(null);

    const [heading, setHeading] = React.useState<string>(
        hash.charAt('b') ? 'Block' : 'Transaction'
    );

    const getTxPromises = (transactions: string[]): Promise<any>[] => {
        return transactions.map(tx => store.fetchBlockchainItem(tx));
    }

    const checkSeenTxIns = (t: any, seenIns: string[]) => {
        if (t.previous_out && t.previous_out.t_hash) {
            let t_hash = t.previous_out.t_hash;
    
            if (seenIns.indexOf(t_hash) == -1) {
                seenIns.push(t_hash);
                return true;
            }
    
            return false;
        }

        return false;
    }

    const toHexString = (byteArray: number[]) => {
        return Array.from(byteArray, (byte) => {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    }

    const formatScript = (stack: any[]) => {
        let combo = [];

        for (let entry of stack) {
            let key = Object.keys(entry)[0];
            let val = entry[key];

            combo.push(val instanceof Array ? toHexString(val): val);
        }

        console.log(combo);
        return combo.join('\n');
    }

    const formatTransactionInputs = (inputs: any[]) => {
        return inputs.map(input => {
            const previousOutputHash = input.previous_out && input.previous_out.t_hash ? 
                input.previous_out.t_hash : 
                'N/A';

            return {
                    previousOutputHash,
                    scriptSig: formatScript(input.script_signature.stack)
            };
        });
    }

    const formatTransactionOutputs = (outputs: any[]) => {
        return outputs.map(output => {
            return {
                address: output.script_public_key,
                tokens: `${output.value.Token} ZENO`,
                lockTime: output.locktime
            };
        })
    }

    const getTransactionInfo = (tx: any, hashes: string[], index: number) => {
        let seenIns: string[] = [];

        return {
            hash: hashes[index],
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
    }

    const formatTransactions = (transactions: any[], hashes: string[]) => {
        if (!transactions || !transactions.length) { return [] }

        if (transactions.length == 1) {
            let tx = transactions[0];
            return getTransactionInfo(tx, hashes, 0);
        }

        return transactions.map((tx, i) => {
            tx = tx.Transaction;
            return getTransactionInfo(tx, hashes, i);
        })
    }

    const fetchTransactions = async (txs: string[]) => {
        let tInfo = await Promise
            .all(getTxPromises(txs))
            .then(results => formatTransactions(results, txs));

        setTransactions(tInfo);
    }

    const formatDataForTable = (localData: any) => {
        console.log('localData', localData);
        if (!localData) { return null }

        return Object.keys(localData).map(key => {
            return {
                heading: key,
                value: localData[key]
            };
        });
    }

    const formatMiningTxDataForTable = (miningTx: any) => {
        if (!miningTx) { return null }

        return [
            { heading: 'Coinbase Hash', value: coinbaseHash },
            { heading: 'Token Reward', value: miningTx.tokensDivided },
            { heading: 'Fractionated Token Reward', value: miningTx.tokens },
            { heading: 'Version', value: miningTx.version },
            { heading: 'Script Public Key', value: miningTx.scriptPublicKey },
        ];
    }

    const fetchMiningTx = async (miningTxAndNonce: any) => {
        const coinbaseHash = miningTxAndNonce["1"][0];
        setCoinbaseHash(coinbaseHash);

        if (miningTxAndNonce && coinbaseHash) {
            const tx = await store.fetchBlockchainItem(coinbaseHash);
            const reward = tx['Transaction']['outputs'][0]['value']['Token'];

            const miningTx = {
                tokens: reward,
                tokensDivided: (parseFloat(reward) / 25200).toFixed(2),
                scriptPublicKey: tx['Transaction']['outputs'][0]['script_public_key'],
                version: tx['Transaction']['version'],
            };

            setMiningTx(miningTx);
        }
    }

    const formatIncomingData = (data: any) => {
        if (data.hasOwnProperty('Block')) {
            let blockInfo = data.Block;

            fetchTransactions(blockInfo.block.transactions);

            let merkleHash = blockInfo.block.header.merkle_root_hash;
            
            // Handle the coinbase
            fetchMiningTx(blockInfo.mining_tx_hash_and_nonces);

            let newData: BlockInfo = {
                hash,
                computeNodes: Object.keys(blockInfo.mining_tx_hash_and_nonces).length,
                blockNum: blockInfo.block.header.b_num,
                merkleRootHash: merkleHash.length > 0 ? merkleHash: "N/A",
                previousHash: blockInfo.block.header.previous_hash,
                version: blockInfo.block.header.version,
                byteSize: `${new TextEncoder().encode(JSON.stringify(blockInfo)).length} bytes`,
                transactions: blockInfo.block.transactions.length
            };

            console.log('newData', newData);

            return newData;
        } else {
            let txInfo = data.Transaction;
            setMainTxData(formatTransactions([txInfo], [hash]));

            return {
                inputs: formatTransactionInputs(txInfo.inputs),
                outputs: formatTransactionOutputs(txInfo.outputs)
            };
        }
    }

    React.useEffect(() => {
        console.log("useEffect");
        if (!localData) {
            console.log("fetching data");
            store.fetchBlockchainItem(hash)
                .then(nowData => {
                    setHeading(nowData ? nowData.hasOwnProperty('Block') ? 'Block' : 'Transaction' : '');
                    setLocalData(formatIncomingData(nowData));
                });
        }
    }, []);

    return useObserver(() => (
        <div className={styles.container}>
            <h2 className={styles.heading}>
                {heading} {localData && localData.blockNum} {localData && hash.charAt(0) !== 'b' && 'Summary'}
            </h2>

            {hash.charAt(0) != 'b' &&
                <TransactionView summaryData={mainTxData} detailData={localData} />}

            {hash.charAt(0) == 'b' &&
                <RowTable rows={formatDataForTable(localData)} />}

            {heading && heading == 'Block' && transactions && transactions.length > 0 &&
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
            
            {heading && heading == "Block" && miningTx &&
                <>
                <h2 className={styles.innerHeading}>Coinbase Transaction</h2>
                <div className={styles.transactionContainer}>
                    <RowTable rows={formatMiningTxDataForTable(miningTx)} />
                </div>
                </>
            }
        </div>
    ));
}

