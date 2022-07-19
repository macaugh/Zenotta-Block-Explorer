import * as React from 'react';
import { useObserver } from 'mobx-react';
import { useParams } from 'react-router-dom';
import { StoreContext } from '../../index';
import { RowTable, RowTableRow } from '../RowTable/RowTable';
import { TxInfo, TransactionInfoProps } from '../TxInfo/TxInfo';
import { RequestBlock, MiningTxData, TokenOutput, TransactionData, TransactionInputsData, TransactionOutputsData, TransactionInfo } from '../../interfaces';
import { formatToBlockInfo } from '../../formatData';
import { CsvBtn } from '../CsvBtn/CsvBtn';

import styles from './BlockView.scss';
import { BlockInfo } from '../../interfaces';
import { Button } from 'chi-ui';
import { itemToCsv, downloadFile, formatCsvTxs, txsToCsv } from '../../formatCsv';

enum txBtn {
    show = "Show transactions",
    hide = "Hide transactions"
}

export const BlockView = () => {
    let { hash } = useParams<any>();
    const store = React.useContext(StoreContext);
    const [transactions, setTransactions] = React.useState<TransactionInfo[] | null>(null);
    const [miningTx, setMiningTx] = React.useState<any>(null);
    const [localData, setLocalData] = React.useState<any>(null);
    const [coinbaseHash, setCoinbaseHash] = React.useState<string>('');
    const [showTransactions, setShowTransactions] = React.useState<boolean>(true);
    const [txBtnText, setTxButtonText] = React.useState<string>(txBtn.hide);

    /**
     * Fetch coinbase transaction from miningTx hash
     * @param miningTxHash 
     */
    const fetchMiningTx = async (miningTxHash: string) => {
        if (miningTxHash) {
            setCoinbaseHash(miningTxHash)
            const tx = (await store.fetchBlockchainItem(miningTxHash)) as TransactionData; // Fetch coinbase transaction
            const output = tx.outputs[0] as TransactionOutputsData;
            const reward = (output.value as TokenOutput).Token.toString();
            const miningTxInfo = {
                tokens: reward,
                tokensDivided: (parseFloat(reward) / 25200).toFixed(2),
                scriptPublicKey: output.script_public_key,
                version: tx.version,
            };
            setMiningTx(miningTxInfo);
        }
    };

    /**
     * Fetch transactions from list of tx hashes
     * @param txs 
     */
    const fetchTransactions = async (txs: string[]) => {
        let txsInfo = await Promise.all(
            txs.map(
                (tx) => store.fetchBlockchainItem(tx))).then(
                    (results) => formatTransactions(results as TransactionData[], txs));
        setTransactions(txsInfo as TransactionInfo[]);
    };

    const checkSeenTxIns = (t: TransactionInputsData, seenIns: string[]) => {
        if (t.previous_out && t.previous_out.t_hash) {
            let t_hash = t.previous_out.t_hash;

            if (seenIns.indexOf(t_hash) == -1) {
                seenIns.push(t_hash);
                return true;
            }
            return false;
        }
        return false;
    };

    const extractTransactionInfo = (tx: any, hashes: string[], index: number) => {
        let seenIns: string[] = [];
        return {
            hash: hashes[index],
            totalTokens: tx.outputs.reduce((acc: number, o: any) => acc + o.value.Token, 0),
            txInHashes: tx.inputs.filter((t: any) => checkSeenTxIns(t, seenIns)).map((i: any) => i.previous_out.t_hash),
            outputs: tx.outputs.map((o: any) => {
                return {
                    publicKey: o.script_public_key,
                    lockTime: o.locktime,
                    tokens: o.value.Token,
                };
            }),
        };
    };

    const formatTransactions = (transactions: TransactionData[], hashes: string[]) => {
        if (!transactions || !transactions.length) {
            return [];
        }

        if (transactions.length == 1) {
            let tx = transactions[0];
            return [extractTransactionInfo(tx, hashes, 0)];
        }

        return transactions.map((tx, i) => {
            return extractTransactionInfo(tx, hashes, i);
        });
    };

    const handleShowTxButton = () => {
        if (showTransactions) {
            setShowTransactions(false);
            setTxButtonText(txBtn.show);
        } else {
            setShowTransactions(true);
            setTxButtonText(txBtn.hide);
        }
    }

    const formatDataForTable = (localData: BlockInfo): RowTableRow[] | null => {
        if (!localData) {
            return null;
        }
        return Object.keys(localData).map((key) => {
            const value = (localData as any)[key];
            if (key === 'previousHash') {
                return {
                    heading: key,
                    value: value != 'N/A' ? <a href={`/block/${value}`}>{value}</a> : value,
                };
            } else {
                return {
                    heading: key,
                    value: value,
                };
            }
        });
    };

    const formatIncomingData = (block: RequestBlock) => {
        let blockInfo = block.block;
        let miningTx = block.miningTxHashAndNonces;

        // Handle block transactions
        fetchTransactions(blockInfo.transactions);

        // Handle the coinbase transaction
        fetchMiningTx(miningTx.hash);

        let newData: BlockInfo = formatToBlockInfo({ hash, block: blockInfo, miningTxHashAndNonces: miningTx });

        return newData;
    };

    const formatMiningTxDataForTable = (miningTx: MiningTxData): RowTableRow[] | null => {
        if (!miningTx) {
            return null;
        }
        return [
            { heading: 'Coinbase Hash', value: <a href={'/tx/' + coinbaseHash.toString()}>{coinbaseHash.toString()}</a> },
            { heading: 'Token Reward', value: miningTx.tokensDivided.toString() },
            { heading: 'Fractionated Token Reward', value: miningTx.tokens.toString() },
            { heading: 'Version', value: miningTx.version.toString() },
            { heading: 'Script Public Key', value: miningTx.scriptPublicKey },
        ];
    };

    React.useEffect(() => {
        if (!localData) {
            store.fetchBlockchainItem(hash).then((fetchedData) => {
                if (fetchedData.hasOwnProperty('block')) {
                    setLocalData(formatIncomingData(fetchedData as RequestBlock));
                } else if (fetchedData.hasOwnProperty('druid_info')) {
                    // Temp fix for searches on wrong filter. Must be changed on search level
                    localStorage.setItem('DROPDOWN_SELECT', 'Transaction Hash');
                    window.location.href = '/tx/' + hash;
                } else {
                    window.location.href = '/?invalid_search';
                }
            });
        }
    }, [transactions]);

    const downloadBlock = async () => {
        const csv = itemToCsv(localData);
        downloadFile(`block-${localData.blockNum}`, csv);
    };

    const downloadTxs = async () => {
        if (transactions && transactions.length > 0) {
            const { txs, headers } = formatCsvTxs(transactions as TransactionInfo[]);
            if (txs.length > 1) {
                const csv = txsToCsv(txs, headers)
                downloadFile(`txs-${txs[0].hash}-${txs[txs.length -1].hash}`, csv);
            } else if (txs.length == 1) {
                const csv = itemToCsv(txs[0]);
                downloadFile(`tx-${txs[0].hash}`, csv);
            }         
        }
    };

    const downloadCbTx = async () => {
        let tx = {
            coinbaseHash: coinbaseHash,
            ...miningTx
        }
        const csv = itemToCsv(tx);
        downloadFile(`tx-${coinbaseHash}`, csv);
    };

    return useObserver(() => {
        if (localData) return (
            <div className={styles.container}>
                <h2 className={styles.heading}>
                    {'Block'} {localData.blockNum && <span className={styles.blockNum}>{'#' + localData.blockNum}</span>}
                </h2>
                <CsvBtn action={() => downloadBlock()} />

                {<RowTable rows={formatDataForTable(localData)} />}

                {transactions && transactions.length > 0 &&
                    <div className={styles.transactionContainer}>
                        <div className={styles.txHeading}>
                            <h2 className={styles.txTitle}>{'Block Transactions ('}{transactions.length}{')'}</h2>
                            <Button onClick={() => handleShowTxButton()} className={styles.txBtn}>{txBtnText}</Button>
                        </div>

                        {showTransactions && (
                            <>
                                <CsvBtn action={() => downloadTxs()} />
                                <div className={styles.transactionContainer}>
                                    {transactions.map((t: TransactionInfo, i: number) => {
                                        return (
                                            <div key={i}>
                                                <TxInfo {...t} />
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        {!showTransactions &&
                            <span className={styles.hidden}>Transactions are hidden</span>
                        }

                    </div>
                }
                {miningTx && (
                    <>
                        <h2 className={styles.innerHeading}>
                            {'Coinbase Transaction'}
                        </h2>
                        <CsvBtn action={() => downloadCbTx()} />
                        <div className={styles.transactionContainer}>
                            <RowTable rows={formatMiningTxDataForTable(miningTx)} />
                        </div>
                    </>
                )}
            </div>
        )
        else {
            return <></>
        }
    });
};
